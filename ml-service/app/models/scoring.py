from pydantic import BaseModel


class ScoreBreakdown(BaseModel):
    utilization: float
    route: float
    cost: float
    co2: float


class ScoredTruck(BaseModel):
    truckId: str
    scores: ScoreBreakdown
    compositeScore: float
    estimatedCost: float
    co2SavedKg: float


class ScoringRequest(BaseModel):
    trucks: list[dict]
    shipments: list[dict]


class ScoringResponse(BaseModel):
    scoredTrucks: list[ScoredTruck]
