"""Exercise real seeding, response contracts, and traffic domain behavior."""

import json
from pathlib import Path

import main
import pytest
from crud.traffic import seed_data_if_empty
from db.session import Base, get_db
from fastapi.testclient import TestClient
from schemas.traffic import FullTrafficDataResponse
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

DATA_PATH = Path(__file__).resolve().parents[1] / "final_lab/demo/traffic_data.json"


@pytest.fixture
def client(monkeypatch):
    """Run application startup against an isolated, seeded SQLite database."""
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    sessions = sessionmaker(bind=engine)
    monkeypatch.setattr(main, "engine", engine)
    monkeypatch.setattr(main, "SessionLocal", sessions)
    monkeypatch.setattr(main.settings, "SEED_DATA_PATH", DATA_PATH)

    def override_db():
        with sessions() as session:
            yield session

    main.app.dependency_overrides[get_db] = override_db
    with TestClient(main.app) as test_client:
        yield test_client
    main.app.dependency_overrides.clear()


def test_full_data_preserves_source(client):
    source = FullTrafficDataResponse.model_validate_json(DATA_PATH.read_text())
    response = client.get("/api/traffic/data")
    assert response.status_code == 200
    actual = FullTrafficDataResponse.model_validate(response.json())
    assert actual.metadata == source.metadata
    assert actual.system_kpis == source.system_kpis
    assert actual.hourly_system_stats == source.hourly_system_stats
    assert sorted(actual.segments, key=lambda s: s.id) == sorted(
        source.segments, key=lambda s: s.id
    )
    assert actual.hotspots == source.hotspots
    assert sorted(actual.routing_scenarios, key=lambda s: s.id) == sorted(
        source.routing_scenarios, key=lambda s: s.id
    )


@pytest.mark.parametrize("hour", [None, 0, 17, 23])
def test_severe_filter(client, hour):
    source = json.loads(DATA_PATH.read_text())["segments"]
    params = {"only_severe": "true"}
    if hour is not None:
        params["hour"] = hour
    result = client.get("/api/traffic/segments", params=params)
    assert result.status_code == 200
    expected = {
        s["id"]
        for s in source
        if (s["dominant_los"] if hour is None else s["hourly_los"][hour]) in {"E", "F"}
    }
    assert {s["id"] for s in result.json()} == expected


def test_type_filter(client):
    records = client.get("/api/traffic/segments", params={"type": "primary"}).json()
    assert records
    assert all(s["type"] == "primary" for s in records)
    assert client.get("/api/traffic/segments", params={"type": "unknown"}).json() == []


@pytest.mark.parametrize(
    "endpoint,key",
    [("kpis", "system_kpis"), ("hourly", "hourly_system_stats"), ("hotspots", "hotspots")],
)
def test_partial_endpoints_match_dataset(client, endpoint, key):
    assert (
        client.get(f"/api/traffic/{endpoint}").json() == client.get("/api/traffic/data").json()[key]
    )


@pytest.mark.parametrize("hour", [-1, 24])
def test_invalid_hours_rejected(client, hour):
    assert client.get("/api/traffic/segments", params={"hour": hour}).status_code == 422
    assert client.post("/api/simulation/policy", json={"current_hour": hour}).status_code == 422


def test_simulation_without_policies_preserves_baseline(client):
    response = client.post(
        "/api/simulation/policy",
        json={"adaptive": False, "tidal": False, "noLeft": False, "current_hour": 17.5},
    )
    assert response.status_code == 200
    result = response.json()
    assert result["improved_segments_count"] == 0
    assert result["severe_pct_simulated"] == result["severe_pct_baseline"]
    assert result["avg_speed_improvement_kmh"] == 0
    assert sum(result["los_distribution"].values()) == 450


def test_simulation_applies_policies(client):
    response = client.post(
        "/api/simulation/policy",
        json={"adaptive": True, "tidal": True, "noLeft": True, "current_hour": 17.5},
    )
    assert response.status_code == 200
    result = response.json()
    assert result["improved_segments_count"] > 0
    assert result["severe_pct_simulated"] <= result["severe_pct_baseline"]
    assert sum(result["los_distribution"].values()) == 450


def test_routes_and_health(client):
    assert len(client.get("/api/routing/scenarios").json()) == 3
    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["database"] == "healthy"
    assert client.get("/openapi.json").status_code == 200


def test_health_reports_database_failure(client):
    class BrokenSession:
        def execute(self, statement):
            raise OperationalError("SELECT 1", {}, Exception("offline"))

    main.app.dependency_overrides[get_db] = lambda: BrokenSession()
    response = client.get("/api/health")
    assert response.status_code == 503
    assert response.json()["database"] == "unhealthy"
    assert "offline" not in response.text


def test_seed_is_idempotent(client):
    with main.SessionLocal() as session:
        assert seed_data_if_empty(session, DATA_PATH) is False
    assert len(client.get("/api/traffic/segments").json()) == 450


def test_invalid_seed_leaves_database_empty(tmp_path):
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    bad_seed = tmp_path / "invalid.json"
    bad_seed.write_text('{"segments": []}')
    with sessionmaker(bind=engine)() as session:
        with pytest.raises(ValueError):
            seed_data_if_empty(session, bad_seed)
        from database_models.traffic import TrafficSegmentModel

        assert session.query(TrafficSegmentModel).count() == 0
    engine.dispose()
