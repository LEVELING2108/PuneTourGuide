"""Smoke tests for the safety service. Runs without Redis (in-memory fallback)."""
from fastapi.testclient import TestClient

import main


def test_health():
    with TestClient(main.app) as client:
        assert client.get("/health").json() == {"status": "healthy"}


def test_create_session_returns_uuid():
    with TestClient(main.app) as client:
        res = client.post("/api/create-session")
        assert res.status_code == 200
        assert len(res.json()["session_id"]) == 36


def test_emergency_services_requires_longitude():
    with TestClient(main.app) as client:
        res = client.get("/api/emergency-services", params={"lat": 18.52})
        assert res.status_code == 422


def test_tracking_websocket_relays_location():
    with TestClient(main.app) as client:
        with client.websocket_connect("/ws/track/abc") as watcher:
            with client.websocket_connect("/ws/track/abc") as sender:
                sender.send_text('{"lat":18.5,"lng":73.8}')
                assert watcher.receive_text() == '{"lat":18.5,"lng":73.8}'


def test_tracking_works_without_redis(monkeypatch):
    with TestClient(main.app) as client:
        monkeypatch.setattr(main, "REDIS_OK", False)
        with client.websocket_connect("/ws/track/offline") as watcher:
            with client.websocket_connect("/ws/track/offline") as sender:
                sender.send_text("ping")
                assert watcher.receive_text() == "ping"
