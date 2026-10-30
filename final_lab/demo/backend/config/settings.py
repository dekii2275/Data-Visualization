"""Central application settings, overridden by environment variables or .env."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

DEMO_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Configure API, persistence, and seed paths for local and Docker runs."""

    PROJECT_NAME: str = "HCMC Smart Traffic IOC Backend"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = f"sqlite:///{DEMO_DIR / 'traffic.db'}"
    CORS_ORIGINS: list[str] = ["http://localhost:8080", "http://127.0.0.1:8080"]
    SEED_DATA_PATH: Path = DEMO_DIR / "traffic_data.json"
    model_config = SettingsConfigDict(
        env_file=DEMO_DIR / ".env", env_file_encoding="utf-8", extra="ignore"
    )


settings = Settings()
