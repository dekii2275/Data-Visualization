"""Traffic response assembly and domain filtering, independent of HTTP routing."""

import crud.traffic as traffic_crud
from schemas.traffic import (
    FullTrafficDataResponse,
    HotspotSchema,
    HourlyStatSchema,
    SystemKpiSchema,
    SystemMetadataSchema,
    TrafficSegmentSchema,
)
from sqlalchemy.orm import Session

from services.errors import DatasetUnavailableError
from services.routing_service import RoutingService


class TrafficService:
    @staticmethod
    def get_segments(
        db: Session,
        segment_type: str | None = None,
        only_severe: bool = False,
        hour: int | None = None,
    ) -> list[TrafficSegmentSchema]:
        """Filter severe segments by hourly LOS, or dominant LOS without an hour."""
        segments = traffic_crud.get_segments(db, segment_type)
        if only_severe:
            segments = [
                s
                for s in segments
                if (
                    s.hourly_los[hour]
                    if hour is not None and hour < len(s.hourly_los or [])
                    else s.dominant_los
                )
                in {"E", "F"}
            ]
        return [TrafficSegmentSchema.model_validate(s) for s in segments]

    @staticmethod
    def get_hotspots(db: Session) -> list[HotspotSchema]:
        """Convert persisted hotspots into validated response records."""
        return [HotspotSchema.model_validate(h) for h in traffic_crud.get_hotspots(db)]

    @staticmethod
    def get_kpis(db: Session) -> SystemKpiSchema:
        """Return stored KPIs; report unavailable data instead of invented defaults."""
        kpis = traffic_crud.get_system_kpis(db)
        if kpis is None:
            raise DatasetUnavailableError("Traffic dataset is not initialized")
        return SystemKpiSchema.model_validate(kpis)

    @staticmethod
    def get_hourly_stats(db: Session) -> dict[str, HourlyStatSchema]:
        """Index validated hourly observations by their JSON-compatible hour keys."""
        return {
            str(h.hour): HourlyStatSchema.model_validate(h)
            for h in traffic_crud.get_hourly_system_stats(db)
        }

    @staticmethod
    def get_full_traffic_data(db: Session) -> FullTrafficDataResponse:
        """Assemble the same data contract consumed by the standalone dashboard."""
        meta = traffic_crud.get_system_metadata(db)
        if meta is None:
            raise DatasetUnavailableError("Traffic dataset is not initialized")
        return FullTrafficDataResponse(
            metadata=SystemMetadataSchema.model_validate(meta),
            system_kpis=TrafficService.get_kpis(db),
            hourly_system_stats=TrafficService.get_hourly_stats(db),
            segments=TrafficService.get_segments(db),
            hotspots=TrafficService.get_hotspots(db),
            routing_scenarios=RoutingService.get_all_scenarios(db),
        )
