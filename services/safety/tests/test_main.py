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


def test_publisher_location_reaches_watchers_cleaned():
    with TestClient(main.app) as client:
        sid, token = new_session(client)
        with client.websocket_connect(f"/ws/track/{sid}") as watcher:
            with client.websocket_connect(f"/ws/track/{sid}?token={token}") as sender:
                sender.send_text(json.dumps({"lat": 18.5195123456, "lng": 73.8553, "acc": 12, "evil": "<script>"}))
                msg = json.loads(watcher.receive_text())
                assert msg["type"] == "loc"
                assert msg["lat"] == 18.519512 and msg["lng"] == 73.8553 and msg["acc"] == 12
                assert "evil" not in msg


def test_watchers_cannot_publish_and_bad_payloads_are_dropped():
    with TestClient(main.app) as client:
        sid, token = new_session(client)
        with client.websocket_connect(f"/ws/track/{sid}") as watcher:
            with client.websocket_connect(f"/ws/track/{sid}?token=wrong") as faker:
                faker.send_text(json.dumps({"lat": 1, "lng": 1}))
            with client.websocket_connect(f"/ws/track/{sid}?token={token}") as sender:
                sender.send_text("not json")
                sender.send_text(json.dumps({"lat": 999, "lng": 1}))
                sender.send_text(json.dumps({"lat": 18.5, "lng": 73.8}))
                # The only thing the watcher sees is the one valid point from the real publisher
                assert json.loads(watcher.receive_text())["lat"] == 18.5


def test_unknown_or_malformed_sessions_are_refused():
    with TestClient(main.app) as client:
        for sid in [str(uuid.uuid4()), "abc"]:
            with pytest.raises(WebSocketDisconnect):
                with client.websocket_connect(f"/ws/track/{sid}") as ws:
                    ws.receive_text()


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
            with client.websocket_connect(f"/ws/track/{sid}?token={token}") as sender:
                sender.send_text(json.dumps({"lat": 18.5, "lng": 73.8}))
                assert json.loads(watcher.receive_text())["lng"] == 73.8
