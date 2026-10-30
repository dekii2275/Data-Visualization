from db.session import get_db
from fastapi import APIRouter, Depends
from schemas.simulation import PolicySimulationRequest, PolicySimulationResponse
from services.simulation_service import SimulationService
from sqlalchemy.orm import Session

router = APIRouter(prefix="/simulation", tags=["Simulation"])


@router.post("/policy", response_model=PolicySimulationResponse)
def simulate_traffic_policies(
    request: PolicySimulationRequest, db: Session = Depends(get_db)
) -> PolicySimulationResponse:
    """Mô phỏng tác động giảm ùn tắc và phát thải CO2 khi áp dụng giải pháp thông minh."""
    return SimulationService.simulate_policy_impact(db, request)
