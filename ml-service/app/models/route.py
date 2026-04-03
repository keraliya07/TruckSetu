from pydantic import BaseModel


class RouteTruckPayload(BaseModel):
    id: str | None = None
    currentLat: float | None = None
    currentLng: float | None = None
    dealer: dict | None = None


class RouteShipmentPayload(BaseModel):
    id: str
    originCity: str
    originAddress: str | None = None
    originLat: float
    originLng: float
    destCity: str
    destAddress: str | None = None
    destLat: float
    destLng: float


class RouteRequest(BaseModel):
    truck: RouteTruckPayload
    shipments: list[RouteShipmentPayload]


class RouteStop(BaseModel):
    type: str
    city: str
    address: str | None = None
    lat: float
    lng: float
    shipmentId: str | None = None


class RouteGeometry(BaseModel):
    type: str
    coordinates: list[list[float]]


class RouteResponse(BaseModel):
    orderedStops: list[RouteStop]
    totalDistanceKm: float
    totalTimeS: int
    feasible: bool
    geometry: RouteGeometry | None = None
