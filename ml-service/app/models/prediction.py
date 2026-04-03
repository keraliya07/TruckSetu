from pydantic import BaseModel


class PricePredictionRequest(BaseModel):
    distance_km: float
    weight_tons: float
    truck_type: str
    origin_city: str
    dest_city: str
    urgency: int = 1


class PricePredictionResponse(BaseModel):
    estimated_price: float
    confidence_interval: list[float]
    pricing_factors: dict
