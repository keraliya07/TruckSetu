from fastapi import APIRouter

from app.models.prediction import PricePredictionRequest, PricePredictionResponse
from app.services.price_model import predict_price

router = APIRouter()


@router.post("/predict-price", response_model=PricePredictionResponse)
async def predict_price_endpoint(request: PricePredictionRequest):
    return predict_price(
        request.distance_km,
        request.weight_tons,
        request.truck_type,
        request.origin_city,
        request.dest_city,
        request.urgency,
    )
