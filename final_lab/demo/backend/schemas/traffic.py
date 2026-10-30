"""Typed contracts shared by seed ingestion and traffic API responses."""

from pydantic import BaseModel, ConfigDict

from schemas.routing import RoutingScenarioSchema


class RecordSchema(BaseModel):
    """Allow response validation directly from SQLAlchemy records."""

    model_config = ConfigDict(from_attributes=True)


class SystemMetadataSchema(RecordSchema):
    project: str
    city: str
    total_observations: int
    unique_segments: int
    time_range: str
    generated_at: str


class SystemKpiSchema(RecordSchema):
    severe_congestion_overall: float
    peak_morning_congestion: float
    peak_evening_congestion: float
    median_speed: float
    crawl_speed_pct: float
    total_segments_monitored: int


class HourlyStatSchema(RecordSchema):
    severe_pct: float
    avg_score: float
    est_speed: float
    los_dist: dict[str, float]


class TrafficSegmentSchema(RecordSchema):
    id: int
    name: str
    type: str
    coords: list[list[float]]
    length: float
    avg_score: float
    severe_rate: float
    dominant_los: str
    hourly_los: list[str]


class HotspotSchema(RecordSchema):
    name: str
    lat: float
    lng: float
    desc: str | None = None


class FullTrafficDataResponse(BaseModel):
    metadata: SystemMetadataSchema
    system_kpis: SystemKpiSchema
    hourly_system_stats: dict[str, HourlyStatSchema]
    segments: list[TrafficSegmentSchema]
    hotspots: list[HotspotSchema]
    routing_scenarios: list[RoutingScenarioSchema]
