# === ml-service/app/services/return_load_scorer.py ===
# Purpose: Score return load opportunities for a completed trip
# Dependencies: ../utils/geo_utils

# from app.utils.geo_utils import haversine, bearing

# def score_return_loads(truck, candidate_shipments):
#     """
#     Score return load candidates for a truck at its delivery endpoint.
#
#     For each candidate shipment:
#
#     1. PROXIMITY SCORE (weight: 0.4)
#        pickup_distance = haversine(truck.current, shipment.origin)
#        proximity = max(0, 100 - pickup_distance * 2)
#
#     2. DIRECTION SCORE (weight: 0.35)
#        angle_home = bearing(current, home_city)
#        angle_delivery = bearing(current, shipment.destination)
#        diff = abs(angle_home - angle_delivery)
#        if diff > 180: diff = 360 - diff
#        direction = max(0, 100 - diff * 0.8)
#
#     3. UTILIZATION SCORE (weight: 0.25)
#        fill_pct = (shipment.weight_kg / truck.max_weight_kg) * 100
#        utilization = min(100, fill_pct * 1.2)
#
#     COMBINED = 0.4 * proximity + 0.35 * direction + 0.25 * utilization
#
#     Returns: top 3 candidates sorted by combined_score desc
#     """
#     scored = []
#     # for s in candidate_shipments:
#     #     ... compute scores ...
#     #     scored.append({...})
#     # return sorted(scored, key=lambda x: x['combined_score'], reverse=True)[:3]
#     ...
