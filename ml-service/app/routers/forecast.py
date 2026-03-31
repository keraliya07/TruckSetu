# === ml-service/app/routers/forecast.py ===
# Purpose: Demand forecasting endpoint using Prophet
# Dependencies: fastapi, ../services/demand_forecast

# from fastapi import APIRouter
# from app.models.forecast import ForecastRequest, ForecastResponse
# from app.services.demand_forecast import forecast_demand

# router = APIRouter()

# @router.post('/forecast-demand', response_model=ForecastResponse)
# async def forecast_demand_endpoint(request: ForecastRequest):
#     """
#     Predict shipment demand per city for the next N days.
#     Uses Facebook Prophet trained on historical shipment volumes.
#     """
#     result = forecast_demand(request.cities, request.horizon_days)
#     return ForecastResponse(forecasts=result)
