from typing import Any

from pydantic import BaseModel


class RoutingPoint(BaseModel):
    name: str
    coords: list[float]


class RouteDetail(BaseModel):
    name: str
    distance_km: float
    path: list[list[float]]
    color: str
    hourly_travel_time: dict[str, float]
    peak_travel_time_min: float
    peak_avg_speed_kmh: float
    severe_los_pct: float
    bottlenecks: list[dict[str, Any]] | None = None
    time_saved_min: float | None = None
    time_saved_pct: float | None = None
    co2_reduced_pct: float | None = None
    strategy_applied: str | None = None


class RoutingScenarioSchema(BaseModel):
    id: str
    name: str
    category: str
    icon: str | None = "🚗"
    start: RoutingPoint
    end: RoutingPoint
    context: str
    static_route: RouteDetail
    dynamic_route: RouteDetail
