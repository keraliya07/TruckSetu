from pydantic import BaseModel, Field


class ForecastRequest(BaseModel):
    cities: list[str] = Field(default_factory=list)
    horizon_days: int = 7


class CityForecast(BaseModel):
    city: str
    date: str
    predicted_demand: float
    lower_bound: float
    upper_bound: float


class ForecastResponse(BaseModel):
    forecasts: list[CityForecast]
