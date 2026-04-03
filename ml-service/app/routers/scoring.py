from fastapi import APIRouter

from app.models.scoring import ScoringRequest, ScoringResponse
from app.services.scoring_engine import score_trucks

router = APIRouter()


@router.post("/score-trucks", response_model=ScoringResponse)
async def score_trucks_endpoint(request: ScoringRequest):
    return {"scoredTrucks": score_trucks(request.trucks, request.shipments)}
