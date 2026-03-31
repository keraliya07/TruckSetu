from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql://stlos_user:stlos_pass@localhost:5432/stlos_db"
    osrm_url: str = "http://localhost:5000"
    port: int = 8000
    environment: str = "development"
    log_level: str = "info"
    price_model_path: str = "app/models/saved/price_model.pkl"
    demand_model_path: str = "app/models/saved/demand_model.pkl"
    vrp_time_limit_seconds: int = 5
    max_return_load_distance_km: float = 150.0

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
