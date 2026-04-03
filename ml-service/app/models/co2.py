from pydantic import BaseModel


class CO2ScoreRequest(BaseModel):
    distance_km: float
    weight_tons: float
    fuel_efficiency: float = 4.0
    emission_factor: float = 2.68
    utilization_pct: float | None = None


class CO2ScoreResponse(BaseModel):
    emitted_kg: float
    baseline_kg: float
    saved_kg: float
    saved_pct: float
    equivalents: dict
