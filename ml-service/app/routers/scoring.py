# === ml-service/app/routers/scoring.py ===
# Purpose: Truck scoring endpoint
# Dependencies: fastapi, ../services/scoring_engine, ../models/scoring

# from fastapi import APIRouter
# from app.models.scoring import ScoringRequest, ScoringResponse
# from app.services.scoring_engine import score_trucks

# router = APIRouter()

# @router.post('/score-trucks', response_model=ScoringResponse)
# async def score_trucks_endpoint(request: ScoringRequest):
#     """
#     Receive trucks + shipments from Node.js backend.
#     Score each truck using 4-parameter scoring engine.
#     Return sorted list with all score components.
#     """
#     result = score_trucks(request.trucks, request.shipments)
#     return ScoringResponse(scored_trucks=result)
