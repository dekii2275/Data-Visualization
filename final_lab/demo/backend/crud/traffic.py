"""Database access and transactional ingestion of the canonical demo dataset."""

import logging
from pathlib import Path

from database_models.traffic import (
    HotspotModel,
    HourlySystemStatModel,
    RoutingScenarioModel,
    SystemKpiModel,
    SystemMetadataModel,
    TrafficSegmentModel,
)
from schemas.traffic import FullTrafficDataResponse
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def get_system_metadata(db: Session) -> SystemMetadataModel | None:
    """Return dataset provenance, or None before initial seeding."""
    return db.query(SystemMetadataModel).first()


def get_system_kpis(db: Session) -> SystemKpiModel | None:
    """Return the aggregate indicators stored with the dataset."""
    return db.query(SystemKpiModel).first()


def get_hourly_system_stats(db: Session) -> list[HourlySystemStatModel]:
    """Return hourly observations in chronological order."""
    return db.query(HourlySystemStatModel).order_by(HourlySystemStatModel.hour).all()


def get_segments(db: Session, segment_type: str | None = None) -> list[TrafficSegmentModel]:
    """Return segments, optionally restricted to a road classification."""
    query = db.query(TrafficSegmentModel)
    if segment_type and segment_type != "all":
        query = query.filter(TrafficSegmentModel.type == segment_type)
    return query.order_by(TrafficSegmentModel.id).all()


def get_hotspots(db: Session) -> list[HotspotModel]:
    """Return hotspot records in insertion order."""
    return db.query(HotspotModel).order_by(HotspotModel.id).all()


def get_routing_scenarios(db: Session) -> list[RoutingScenarioModel]:
    """Return the stored routing comparison scenarios."""
    return db.query(RoutingScenarioModel).order_by(RoutingScenarioModel.id).all()


def seed_data_if_empty(db: Session, seed_file_path: str | Path) -> bool:
    """Validate a seed file and insert all records atomically into an empty database.

    Return False when already seeded; propagate validation or persistence failures
    so startup cannot silently serve fabricated or partially loaded traffic data.
    """
    if db.query(TrafficSegmentModel).first() is not None:
        logger.info("Traffic database already seeded; skipping ingestion.")
        return False
    data = FullTrafficDataResponse.model_validate_json(
        Path(seed_file_path).read_text(encoding="utf-8")
    )
    try:
        db.add(SystemMetadataModel(**data.metadata.model_dump()))
        db.add(SystemKpiModel(**data.system_kpis.model_dump()))
        db.add_all(
            HourlySystemStatModel(hour=int(hour), **stat.model_dump())
            for hour, stat in data.hourly_system_stats.items()
        )
        db.add_all(TrafficSegmentModel(**segment.model_dump()) for segment in data.segments)
        db.add_all(HotspotModel(**hotspot.model_dump()) for hotspot in data.hotspots)
        for scenario in data.routing_scenarios:
            record = scenario.model_dump(exclude_none=True)
            record["start_point"] = record.pop("start")
            record["end_point"] = record.pop("end")
            db.add(RoutingScenarioModel(**record))
        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Failed to seed traffic database")
        raise
    logger.info("Seeded %s traffic segments.", len(data.segments))
    return True
