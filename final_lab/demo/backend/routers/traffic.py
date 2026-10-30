"""HTTP traffic endpoints; persistence and transformations belong to services."""

from db.session import get_db
from fastapi import APIRouter, Depends, Query
from schemas.traffic import (
    FullTrafficDataResponse,
    HotspotSchema,
    HourlyStatSchema,
    SystemKpiSchema,
    TrafficSegmentSchema,
)
from services.traffic_service import TrafficService
from sqlalchemy.orm import Session

router = APIRouter(prefix="/traffic", tags=["Traffic"])


@router.get("/data", response_model=FullTrafficDataResponse)
def get_all_traffic_data(db: Session = Depends(get_db)) -> FullTrafficDataResponse:
    """Return the complete dataset used by the dashboard."""
    return TrafficService.get_full_traffic_data(db)


@router.get("/segments", response_model=list[TrafficSegmentSchema])
def get_traffic_segments(
    segment_type: str | None = Query(None, alias="type", description="Road classification or all"),
    only_severe: bool = Query(False, description="Restrict to LOS E and F"),
    hour: int | None = Query(None, ge=0, le=23),
    db: Session = Depends(get_db),
) -> list[TrafficSegmentSchema]:
    """Return road segments matching optional type and congestion filters."""
    return TrafficService.get_segments(db, segment_type, only_severe, hour)


@router.get("/hotspots", response_model=list[HotspotSchema])
def get_hotspots(db: Session = Depends(get_db)) -> list[HotspotSchema]:
    """Return the congestion hotspots stored in the dataset."""
    return TrafficService.get_hotspots(db)


@router.get("/kpis", response_model=SystemKpiSchema)
def get_kpis(db: Session = Depends(get_db)) -> SystemKpiSchema:
    """Return aggregate traffic indicators."""
    return TrafficService.get_kpis(db)


@router.get("/hourly", response_model=dict[str, HourlyStatSchema])
def get_hourly_stats(db: Session = Depends(get_db)) -> dict[str, HourlyStatSchema]:
    """Return traffic indicators for each hour of the day."""
    return TrafficService.get_hourly_stats(db)
