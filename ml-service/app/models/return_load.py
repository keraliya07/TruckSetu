from pydantic import BaseModel


class ReturnLoadTruckPayload(BaseModel):
    id: str | None = None
    currentLat: float | None = None
    currentLng: float | None = None
    maxWeightKg: float
    maxVolumeM3: float | None = None
    homeLat: float | None = None
    homeLng: float | None = None


class CandidateShipmentPayload(BaseModel):
    id: str
    originCity: str
    originLat: float
    originLng: float
    destCity: str
    destLat: float
    destLng: float
    weightKg: float
    volumeM3: float | None = None


class ReturnLoadRequest(BaseModel):
    truck: ReturnLoadTruckPayload
    candidateShipments: list[CandidateShipmentPayload]


class ReturnLoadCandidate(BaseModel):
    shipmentId: str
    pickupDistanceKm: float
    proximityScore: float
    directionScore: float
    utilizationScore: float
    combinedScore: float


class ReturnLoadResponse(BaseModel):
    scored: list[ReturnLoadCandidate]
