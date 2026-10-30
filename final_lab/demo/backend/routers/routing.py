from db.session import get_db
from fastapi import APIRouter, Depends
from schemas.routing import RoutingScenarioSchema
from services.routing_service import RoutingService
from sqlalchemy.orm import Session

router = APIRouter(prefix="/routing", tags=["Routing"])


@router.get("/scenarios", response_model=list[RoutingScenarioSchema])
def get_routing_scenarios(db: Session = Depends(get_db)) -> list[RoutingScenarioSchema]:
    """Lấy danh sách các kịch bản định tuyến thông minh (Cấp cứu, Xe buýt nhanh, Hậu cần)."""
    return RoutingService.get_all_scenarios(db)
