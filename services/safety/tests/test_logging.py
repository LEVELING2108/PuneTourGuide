import main


def test_redis_url_password_never_logged():
    assert main._safe_url("rediss://default:s3cret@eu1.upstash.io:6379") == "rediss://eu1.upstash.io:6379"
    assert main._safe_url("redis://localhost:6379") == "redis://localhost:6379"


def test_error_reports_drop_request_details():
    event = main._scrub_event(
        {"request": {"method": "POST", "url": "https://x/session?token=abc", "data": {"lat": 1}, "headers": {"a": "b"}}, "user": {"ip_address": "1.2.3.4"}, "extra": {"x": 1}},
        None,
    )
    assert event == {"request": {"method": "POST", "url": "https://x/session"}}
