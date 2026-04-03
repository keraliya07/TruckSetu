from fastapi import APIRouter

from app.models.forecast import ForecastRequest, ForecastResponse
from app.services.demand_forecast import forecast_demand

router = APIRouter()


@router.post("/forecast-demand", response_model=ForecastResponse)
async def forecast_demand_endpoint(request: ForecastRequest):
    return {
        "forecasts": forecast_demand(request.cities, request.horizon_days),
    }
