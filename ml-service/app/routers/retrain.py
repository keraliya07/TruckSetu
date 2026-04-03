from fastapi import APIRouter

router = APIRouter()


@router.post("/retrain")
async def retrain_models_endpoint():
    return {
        "status": "accepted",
        "models": ["price-prediction", "demand-forecast"],
        "message": "Retraining job acknowledged by ml-service.",
    }
