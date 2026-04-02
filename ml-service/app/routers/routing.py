from fastapi import APIRouter
from pydantic import BaseModel

from app.services.vrp_solver import solve_vrp


class RouteRequest(BaseModel):
    truck: dict
    shipments: list[dict]


router = APIRouter()


@router.post("/vrp-route")
async def vrp_route_endpoint(request: RouteRequest):
    return solve_vrp(request.truck, request.shipments)
