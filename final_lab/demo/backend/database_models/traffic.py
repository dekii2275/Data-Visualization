from db.session import Base
from sqlalchemy import JSON, Column, Float, Integer, String, Text


class SystemMetadataModel(Base):
    __tablename__ = "system_metadata"
    id = Column(Integer, primary_key=True)
    project = Column(String(255), nullable=False)
    city = Column(String(255), nullable=False)
    total_observations = Column(Integer, nullable=False)
    unique_segments = Column(Integer, nullable=False)
    time_range = Column(String(50), nullable=False)
    generated_at = Column(String(50), nullable=False)


class SystemKpiModel(Base):
    __tablename__ = "system_kpis"
    id = Column(Integer, primary_key=True)
    severe_congestion_overall = Column(Float, nullable=False)
    peak_morning_congestion = Column(Float, nullable=False)
    peak_evening_congestion = Column(Float, nullable=False)
    median_speed = Column(Float, nullable=False)
    crawl_speed_pct = Column(Float, nullable=False)
    total_segments_monitored = Column(Integer, nullable=False)


class HourlySystemStatModel(Base):
    __tablename__ = "hourly_system_stats"
    hour = Column(Integer, primary_key=True)
    severe_pct = Column(Float, nullable=False)
    avg_score = Column(Float, nullable=False)
    est_speed = Column(Float, nullable=False)
    los_dist = Column(JSON, nullable=False)


class TrafficSegmentModel(Base):
    __tablename__ = "traffic_segments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(50), nullable=False, index=True)
    coords = Column(JSON, nullable=False)
    length = Column(Float, nullable=False)
    avg_score = Column(Float, nullable=False)
    severe_rate = Column(Float, nullable=False)
    dominant_los = Column(String(5), nullable=False, index=True)
    hourly_los = Column(JSON, nullable=False)


class HotspotModel(Base):
    __tablename__ = "traffic_hotspots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    desc = Column(Text, nullable=True)


class RoutingScenarioModel(Base):
    __tablename__ = "routing_scenarios"

    id = Column(String(100), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    icon = Column(String(20), nullable=True)
    start_point = Column(JSON, nullable=False)
    end_point = Column(JSON, nullable=False)
    context = Column(Text, nullable=True)
    static_route = Column(JSON, nullable=False)
    dynamic_route = Column(JSON, nullable=False)
