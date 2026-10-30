import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import crud.traffic as traffic_crud
from config.settings import settings
from db.session import Base, SessionLocal, engine
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import health_router, routing_router, simulation_router, traffic_router
from services.errors import DatasetUnavailableError

# Logging configuration
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Quản lý vòng đời khởi động và tắt ứng dụng FastAPI."""
    logger.info("Starting up HCMC Smart Traffic IOC Backend...")
    # 1. Khởi tạo tables trong database nếu chưa tồn tại
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema verified.")

    # 2. Tự động nạp dữ liệu (seeding) nếu database mới tạo
    with SessionLocal() as db:
        traffic_crud.seed_data_if_empty(db, settings.SEED_DATA_PATH)

    yield
    engine.dispose()
    logger.info("Shutting down HCMC Smart Traffic IOC Backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API phục vụ Trung tâm Điều hành Giao thông Thông minh TP.HCM (Digital Twin)",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(traffic_router, prefix=settings.API_PREFIX)
app.include_router(simulation_router, prefix=settings.API_PREFIX)
app.include_router(routing_router, prefix=settings.API_PREFIX)


@app.get("/")
def root() -> dict[str, str]:
    """Expose service identity and discovery links."""
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_url": f"{settings.API_PREFIX}/health",
    }


@app.exception_handler(DatasetUnavailableError)
async def dataset_unavailable_handler(
    request: Request, exc: DatasetUnavailableError
) -> JSONResponse:
    """Translate missing domain data into an explicit service-unavailable response."""
    return JSONResponse(status_code=503, content={"detail": str(exc)})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
