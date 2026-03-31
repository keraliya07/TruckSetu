# === ml-service/app/routers/prediction.py ===
# Purpose: Price prediction endpoint using RandomForest model
# Dependencies: fastapi, ../services/price_model

# from fastapi import APIRouter
# from app.services.price_model import predict_price

# router = APIRouter()

# @router.post('/predict-price')
# async def predict_price_endpoint(request: dict):
#     """
#     Predict estimated cost for a trip.
#     Input: { distance_km, weight_tons, truck_type, origin_city, dest_city, urgency }
#     Output: { estimated_price, confidence_interval: [low, high] }
#     Model: sklearn RandomForest trained on historical trip pricing
#     """
#     result = predict_price(**request)
#     return result
