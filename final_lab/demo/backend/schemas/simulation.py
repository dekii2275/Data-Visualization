from pydantic import BaseModel, Field


class PolicySimulationRequest(BaseModel):
    adaptive: bool = Field(True, description="Kích hoạt làn sóng xanh thích ứng")
    tidal: bool = Field(True, description="Kích hoạt làn đường con thoi linh hoạt")
    noLeft: bool = Field(False, description="Cấm rẽ trái giờ cao điểm tại nút giao xung đột")
    current_hour: float = Field(
        17.5, ge=0, lt=24, allow_inf_nan=False, description="Khung giờ mô phỏng (0.0 đến dưới 24.0)"
    )


class PolicySimulationResponse(BaseModel):
    current_hour: float
    policies_applied: dict[str, bool]
    improved_segments_count: int
    severe_pct_baseline: float
    severe_pct_simulated: float
    severe_reduction_pct: float
    avg_speed_improvement_kmh: float
    time_saved_pct: float
    co2_reduced_pct: float
    corridors_impacted: list[str]
    los_distribution: dict[str, int]
