from fastapi import APIRouter

from app.models.co2 import CO2ScoreRequest, CO2ScoreResponse
from app.services.co2_calculator import calculate, equivalents

router = APIRouter()


@router.post("/co2-score", response_model=CO2ScoreResponse)
async def co2_score_endpoint(request: CO2ScoreRequest):
    emitted = calculate(
        request.distance_km,
        request.fuel_efficiency,
        request.emission_factor,
        request.weight_tons,
    )
    baseline = round(emitted * 1.22, 2)
    saved = round(max(baseline - emitted, 0.0), 2)
    saved_pct = round((saved / baseline) * 100, 2) if baseline else 0.0

    return {
        "emitted_kg": emitted,
        "baseline_kg": baseline,
        "saved_kg": saved,
        "saved_pct": saved_pct,
        "equivalents": equivalents(saved),
    }
