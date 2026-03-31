# === ml-service/app/models/scoring.py ===
# Purpose: Pydantic models for scoring request/response
# Dependencies: pydantic

# from pydantic import BaseModel
# from typing import List

# class ScoreBreakdown(BaseModel):
#     utilization: float   # 0-100
#     route: float         # 0-100
#     cost: float          # 0-100
#     co2: float           # 0-100

# class ScoredTruck(BaseModel):
#     truck_id: str
#     scores: ScoreBreakdown
#     composite_score: float
#     estimated_cost: float
#     co2_saved_kg: float

# class ScoringRequest(BaseModel):
#     trucks: list   # List[TruckInput]
#     shipments: list  # List[ShipmentInput]

# class ScoringResponse(BaseModel):
#     scored_trucks: List[ScoredTruck]
