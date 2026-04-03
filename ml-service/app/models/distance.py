from pydantic import BaseModel, Field


class Coordinate(BaseModel):
    lat: float
    lng: float


class DistanceMatrixRequest(BaseModel):
    coordinates: list[Coordinate] = Field(default_factory=list)


class DistanceMatrixResponse(BaseModel):
    distances: list[list[float]]
    durations: list[list[float]]
    source: str
