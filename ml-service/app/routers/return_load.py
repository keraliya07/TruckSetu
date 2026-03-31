# === ml-service/app/routers/return_load.py ===
# Purpose: Return load scoring endpoint
# Dependencies: fastapi, ../services/return_load_scorer

# from fastapi import APIRouter
# from app.services.return_load_scorer import score_return_loads

# router = APIRouter()

# @router.post('/return-load-score')
# async def return_load_score_endpoint(request: dict):
#     """
#     Score return load opportunities for a completed trip.
#     Input: { truck: {...}, candidate_shipments: [...] }
#     Output: { scored: [{ shipment_id, proximity_score, direction_score, utilization_score, combined_score }] }
#     """
#     # result = score_return_loads(request['truck'], request['candidate_shipments'])
#     # return {'scored': result}
