# === ml-service/app/models/route.py ===
# Purpose: Pydantic models for routing
# Dependencies: pydantic

# from pydantic import BaseModel
# from typing import List, Optional, Tuple

# class RouteNode(BaseModel):
#     id: str
#     lat: float
#     lng: float
#     type: str        # 'DEPOT', 'PICKUP', 'DELIVERY'
#     demand: float    # m3 (+ for pickup, - for delivery)
#     time_window: Optional[Tuple[int, int]] = None

# class VRPRequest(BaseModel):
#     nodes: List[RouteNode]
#     pickup_delivery_pairs: List[Tuple[int, int]]
#     distance_matrix: List[List[float]]
#     time_matrix: List[List[float]]
#     vehicle_capacity: float
#     max_route_time: int = 36000  # 10 hours

# class VRPResponse(BaseModel):
#     ordered_stops: List[dict]
#     total_distance_m: float
#     total_time_s: float
#     feasible: bool
