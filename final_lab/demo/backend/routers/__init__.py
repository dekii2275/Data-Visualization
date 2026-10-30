from .health import router as health_router
from .routing import router as routing_router
from .simulation import router as simulation_router
from .traffic import router as traffic_router

__all__ = ["health_router", "traffic_router", "simulation_router", "routing_router"]
