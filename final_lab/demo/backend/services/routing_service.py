import crud.traffic as traffic_crud
from schemas.routing import RoutingScenarioSchema
from sqlalchemy.orm import Session


class RoutingService:
    @staticmethod
    def get_all_scenarios(db: Session) -> list[RoutingScenarioSchema]:
        """Lấy danh sách các kịch bản điều hướng động."""
        scenarios = traffic_crud.get_routing_scenarios(db)
        results = []
        for sc in scenarios:
            results.append(
                {
                    "id": sc.id,
                    "name": sc.name,
                    "category": sc.category,
                    "icon": sc.icon,
                    "start": sc.start_point,
                    "end": sc.end_point,
                    "context": sc.context,
                    "static_route": sc.static_route,
                    "dynamic_route": sc.dynamic_route,
                }
            )
        return [RoutingScenarioSchema.model_validate(record) for record in results]
