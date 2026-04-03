from fastapi import APIRouter

from app.models.return_load import ReturnLoadRequest, ReturnLoadResponse
from app.services.return_load_scorer import score_return_loads

router = APIRouter()


@router.post("/return-load-score", response_model=ReturnLoadResponse)
async def return_load_score_endpoint(request: ReturnLoadRequest):
    return {
        "scored": score_return_loads(
            request.truck.model_dump(),
            [shipment.model_dump() for shipment in request.candidateShipments],
        )
    }
