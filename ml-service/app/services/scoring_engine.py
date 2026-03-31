# === ml-service/app/services/scoring_engine.py ===
# Purpose: 4-parameter truck scoring logic
# Dependencies: co2_calculator, osrm_client

# from app.services.co2_calculator import score as co2_score_fn

# SCORE WEIGHTS
# W_UTILIZATION = 0.35
# W_ROUTE = 0.25
# W_COST = 0.20
# W_CO2 = 0.20

# def score_trucks(trucks, shipments):
#     """
#     Score each truck on 4 parameters:
#
#     1. UTILIZATION (weight: 0.35)
#        pct = (total_shipment_volume / truck.max_volume_m3) * 100
#        score = max(0, 100 - abs(pct - 87) * 1.8)  # Peak at 87%
#
#     2. ROUTE EFFICIENCY (weight: 0.25)
#        deadhead_km = distance from truck to nearest pickup
#        score = max(0, 100 - deadhead_km * 0.5)
#
#     3. COST EFFICIENCY (weight: 0.20)
#        estimated = dealer.base_rate * route_km * weight_ton
#        score = min(100, (benchmark / estimated) * 80)
#
#     4. CO2 IMPACT (weight: 0.20)
#        score = co2_score_fn(truck, weight, route_km, utilization_pct)
#
#     COMPOSITE = 0.35*util + 0.25*route + 0.20*cost + 0.20*co2
#
#     Returns: sorted list of scored trucks (highest composite first)
#     """
#     scored = []
#     for truck in trucks:
#         # TODO: Calculate all 4 scores
#         # TODO: Compute composite
#         # TODO: Append to scored list
#         ...
#     return sorted(scored, key=lambda x: x['composite_score'], reverse=True)
