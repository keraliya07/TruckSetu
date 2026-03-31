# === ml-service/app/models/forecast.py ===
# Purpose: Pydantic models for demand forecasting
# Dependencies: pydantic

# from pydantic import BaseModel
# from typing import List
# from datetime import date

# class ForecastRequest(BaseModel):
#     cities: List[str]
#     horizon_days: int = 7

# class CityForecast(BaseModel):
#     city: str
#     date: date
#     predicted_demand: float
#     lower_bound: float
#     upper_bound: float

# class ForecastResponse(BaseModel):
#     forecasts: List[CityForecast]
