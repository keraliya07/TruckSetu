from fastapi import APIRouter

from app.models.distance import DistanceMatrixRequest, DistanceMatrixResponse
from app.services.osrm_client import get_distance_matrix

router = APIRouter()


@router.post("/distance-matrix", response_model=DistanceMatrixResponse)
async def distance_matrix_endpoint(request: DistanceMatrixRequest):
    coordinates = [[point.lng, point.lat] for point in request.coordinates]
    return get_distance_matrix(coordinates)
