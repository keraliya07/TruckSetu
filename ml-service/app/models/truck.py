# === ml-service/app/models/truck.py ===
# Purpose: Pydantic models for truck data
# Dependencies: pydantic

# from pydantic import BaseModel
# from typing import Optional, List

# class TruckInput(BaseModel):
#     id: str
#     registration_no: str
#     truck_type: str
#     max_weight_kg: float
#     max_volume_m3: float
#     emission_factor: float = 2.68
#     fuel_efficiency: float = 4.0
#     current_city: Optional[str] = None
#     current_lat: Optional[float] = None
#     current_lng: Optional[float] = None
#     dealer_id: str
#     base_rate_per_km_ton: float
#     pickup_zones: List[str]
#     delivery_zones: List[str]

# class TruckWithScores(TruckInput):
#     utilization_score: float
#     route_score: float
#     cost_score: float
#     co2_score: float
#     composite_score: float
#     estimated_cost: Optional[float] = None
#     co2_saved_kg: Optional[float] = None
