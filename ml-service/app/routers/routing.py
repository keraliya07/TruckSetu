# === ml-service/app/routers/routing.py ===
# Purpose: VRP route optimization endpoint using OR-Tools
# Dependencies: fastapi, ../services/vrp_solver

# from fastapi import APIRouter
# from app.models.route import VRPRequest, VRPResponse
# from app.services.vrp_solver import solve_vrp

# router = APIRouter()

# @router.post('/vrp-route', response_model=VRPResponse)
# async def vrp_route_endpoint(request: VRPRequest):
#     """
#     Solve Pickup & Delivery Problem with Time Windows using OR-Tools.
#     Returns optimized stop order, total distance, and feasibility.
#     """
#     result = solve_vrp(
#         request.nodes, request.pickup_delivery_pairs,
#         request.distance_matrix, request.time_matrix,
#         request.vehicle_capacity, request.max_route_time
#     )
#     return result
