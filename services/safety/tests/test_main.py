"""Smoke tests for the safety service. Runs without Redis (in-memory fallback)."""
import json
import uuid

import pytest
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

import main


@pytest.fixture(autouse=True)
def memory_transport(monkeypatch):
    """Deterministic in-process pub/sub (a Redis subscription starts asynchronously)."""
    async def no_redis():
        raise ConnectionError("tests run without Redis")

    monkeypatch.setattr(main.redis_client, "ping", no_redis)
    monkeypatch.setattr(main, "REDIS_OK", False)
    monkeypatch.setattr(main, "_mem_kv", {})
    yield


def auth(ws, token):
    ws.send_text(json.dumps({"type": "auth", "token": token}))


def new_session(client):
    res = client.post("/api/create-session")
    assert res.status_code == 200
    body = res.json()
    return body["session_id"], body["publish_token"]


def test_health():
    with TestClient(main.app) as client:
        assert client.get("/health").json() == {"status": "healthy"}


def test_create_session_returns_id_and_publish_token():
    with TestClient(main.app) as client:
        sid, token = new_session(client)
        assert str(uuid.UUID(sid)) == sid
        assert len(token) >= 40


def test_emergency_services_requires_longitude():
    with TestClient(main.app) as client:
        res = client.get("/api/emergency-services", params={"lat": 18.52})
        assert res.status_code == 422


def test_slow_mirrors_get_time_but_the_answer_comes_within_the_deadline(monkeypatch):
    """A slow mirror is waited for, but never past the overall deadline: then an honest empty answer."""
    import asyncio
    import time

    import httpx

    timeouts = []

    async def slow_post(url, data=None, timeout=None):
        timeouts.append(timeout)
        await asyncio.sleep(timeout)
        raise httpx.ReadTimeout("slow mirror")

    monkeypatch.setattr(main.http_client, "post", slow_post)
    monkeypatch.setattr(main, "MIRROR_TIMEOUT_S", 0.6)
    monkeypatch.setattr(main, "LIVE_DEADLINE_S", 3.0)
    monkeypatch.setattr(main, "MIRROR_STATUS", {u: {"fails": 0, "last_error": None} for u in main.OVERPASS_ENDPOINTS})
    with TestClient(main.app) as client:
        started = time.monotonic()
        res = client.get("/api/emergency-services", params={"lat": 17.0, "lng": 74.0})
        took = time.monotonic() - started
    assert res.json() == {"services": [], "status": "unavailable"}
    assert took < 3.5
    assert timeouts and max(timeouts) <= 0.6


def test_a_mirror_that_answers_slowly_is_still_used(monkeypatch):
    import asyncio

    hospital = {"type": "node", "id": 1, "lat": 17.01, "lon": 74.0, "tags": {"amenity": "hospital", "name": "Civil Hospital", "emergency": "yes"}}

    class Res:
        status_code = 200

        def json(self):
            return {"elements": [hospital]}

    async def slow_post(url, data=None, timeout=None):
        await asyncio.sleep(0.3)
        return Res()

    monkeypatch.setattr(main.http_client, "post", slow_post)
    with TestClient(main.app) as client:
        res = client.get("/api/emergency-services", params={"lat": 17.0, "lng": 74.0})
    body = res.json()
    assert body["status"] == "ok"
    assert body["services"][0]["name"] == "Civil Hospital"


def test_publisher_location_reaches_watchers_cleaned():
    with TestClient(main.app) as client:
        sid, token = new_session(client)
        with client.websocket_connect(f"/ws/track/{sid}") as watcher:
            with client.websocket_connect(f"/ws/track/{sid}") as sender:
                auth(sender, token)
                sender.send_text(json.dumps({"lat": 18.5195123456, "lng": 73.8553, "acc": 12, "evil": "<script>"}))
                msg = json.loads(watcher.receive_text())
                assert msg["type"] == "loc"
                assert msg["lat"] == 18.519512 and msg["lng"] == 73.8553 and msg["acc"] == 12
                assert "evil" not in msg


def test_watchers_cannot_publish_and_bad_payloads_are_dropped():
    with TestClient(main.app) as client:
        sid, token = new_session(client)
        with client.websocket_connect(f"/ws/track/{sid}") as watcher:
            with client.websocket_connect(f"/ws/track/{sid}") as faker:
                auth(faker, "wrong")
                faker.send_text(json.dumps({"lat": 1, "lng": 1}))
            with client.websocket_connect(f"/ws/track/{sid}?token={token}") as url_token:
                url_token.send_text(json.dumps({"lat": 2, "lng": 2}))  # a token in the URL is ignored
            with client.websocket_connect(f"/ws/track/{sid}") as sender:
                auth(sender, token)
                sender.send_text("not json")
                sender.send_text(json.dumps({"lat": 999, "lng": 1}))
                sender.send_text(json.dumps({"lat": 18.5, "lng": 73.8}))
                # The only thing the watcher sees is the one valid point from the real publisher
                assert json.loads(watcher.receive_text())["lat"] == 18.5


def test_unknown_or_malformed_sessions_are_refused():
    with TestClient(main.app) as client:
        for sid in [str(uuid.uuid4()), "abc"]:
            with pytest.raises(WebSocketDisconnect) as closed:
                with client.websocket_connect(f"/ws/track/{sid}") as ws:
                    ws.receive_text()
            assert closed.value.code == 4404


def test_close_session_tells_watchers_and_needs_the_token():
    with TestClient(main.app) as client:
        sid, token = new_session(client)
        assert client.post("/api/close-session", json={"session_id": sid, "publish_token": "nope"}).status_code == 404
        with client.websocket_connect(f"/ws/track/{sid}") as watcher:
            assert client.post("/api/close-session", json={"session_id": sid, "publish_token": token}).json() == {"ok": True}
            assert json.loads(watcher.receive_text())["type"] == "ended"
        # Late watchers learn it has ended
        with client.websocket_connect(f"/ws/track/{sid}") as late:
            assert json.loads(late.receive_text())["type"] == "ended"


def test_tracking_works_without_redis(monkeypatch):
    with TestClient(main.app) as client:
        monkeypatch.setattr(main, "REDIS_OK", False)
        sid, token = new_session(client)
        with client.websocket_connect(f"/ws/track/{sid}") as watcher:
            with client.websocket_connect(f"/ws/track/{sid}") as sender:
                auth(sender, token)
                sender.send_text(json.dumps({"lat": 18.5, "lng": 73.8}))
                assert json.loads(watcher.receive_text())["lng"] == 73.8
