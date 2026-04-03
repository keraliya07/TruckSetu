from fastapi import APIRouter

from app.models.route import RouteRequest, RouteResponse
from app.services.vrp_solver import solve_vrp

router = APIRouter()


@router.post("/vrp-route", response_model=RouteResponse)
async def vrp_route_endpoint(request: RouteRequest):
    return solve_vrp(request.truck.model_dump(), [shipment.model_dump() for shipment in request.shipments])
