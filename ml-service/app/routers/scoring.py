from fastapi import APIRouter
from pydantic import BaseModel

from app.services.scoring_engine import score_trucks


class JsonPayload(BaseModel):
    trucks: list[dict]
    shipments: list[dict]


router = APIRouter()


@router.post("/score-trucks")
async def score_trucks_endpoint(request: JsonPayload):
    return {"scoredTrucks": score_trucks(request.trucks, request.shipments)}
