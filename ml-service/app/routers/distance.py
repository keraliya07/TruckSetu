# === ml-service/app/routers/distance.py ===
# Purpose: Distance matrix endpoint using OSRM
# Dependencies: fastapi, ../services/osrm_client

# from fastapi import APIRouter
# from app.services.osrm_client import get_distance_matrix

# router = APIRouter()

# @router.post('/distance-matrix')
# async def distance_matrix_endpoint(coordinates: list):
#     """
#     Given coordinates, return NxN distance and time matrices via OSRM.
#     Input: [[lat, lng], ...]
#     Output: { distance_matrix: NxN meters, time_matrix: NxN seconds }
#     """
#     result = get_distance_matrix(coordinates)
#     return result
