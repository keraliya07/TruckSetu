from app.services.co2_calculator import calculate, calculate_baseline, score as co2_score_fn
from app.services.vrp_solver import solve_vrp

W_UTILIZATION = 0.35
W_ROUTE = 0.25
W_COST = 0.20
W_CO2 = 0.20


def _clamp(value, minimum, maximum):
    return max(minimum, min(value, maximum))


def _distance_km(start, end):
    lat1 = float(start.get("lat", 0.0))
    lng1 = float(start.get("lng", 0.0))
    lat2 = float(end.get("lat", 0.0))
    lng2 = float(end.get("lng", 0.0))
    return (((lat1 - lat2) ** 2 + (lng1 - lng2) ** 2) ** 0.5) * 111.0


def _estimate_route_distance(truck, shipments):
    pickup = shipments[0]
    current = {
        "lat": truck.get("currentLat") or truck.get("dealer", {}).get("primaryLat") or pickup.get("originLat"),
        "lng": truck.get("currentLng") or truck.get("dealer", {}).get("primaryLng") or pickup.get("originLng"),
    }
    total = _distance_km(current, {"lat": pickup.get("originLat"), "lng": pickup.get("originLng")})
    current = {"lat": pickup.get("originLat"), "lng": pickup.get("originLng")}

    destinations = []
    seen = set()
    for shipment in shipments:
      city = shipment.get("destCity")
      if city in seen:
          continue
      seen.add(city)
      destinations.append(
          {
              "lat": shipment.get("destLat"),
              "lng": shipment.get("destLng"),
          }
      )

    while destinations:
        best_index = 0
        best_distance = float("inf")
        for index, destination in enumerate(destinations):
            distance = _distance_km(current, destination)
            if distance < best_distance:
                best_index = index
                best_distance = distance

        next_destination = destinations.pop(best_index)
        total += best_distance
        current = next_destination

    return round(max(total * 1.18, 12.0), 2)


def score_trucks(trucks, shipments):
    if not trucks or not shipments:
        return []

    total_weight_kg = sum(float(shipment.get("weightKg", 0.0)) for shipment in shipments)
    total_volume_m3 = sum(float(shipment.get("volumeM3", 0.0)) for shipment in shipments)
    max_base_rate = max(
        [float(truck.get("dealer", {}).get("baseRatePerKmTon", 0.0) or 0.0) for truck in trucks] or [1.0]
    )

    scored = []
    for truck in trucks:
        max_weight = float(truck.get("maxWeightKg", 0.0))
        max_volume = float(truck.get("maxVolumeM3", 0.0))
        if total_weight_kg > max_weight or total_volume_m3 > max_volume:
            continue

        solved_route = solve_vrp(truck, shipments)
        route_km = float(solved_route.get("totalDistanceKm") or _estimate_route_distance(truck, shipments))
        weight_util = (total_weight_kg / max_weight) * 100.0 if max_weight else 0.0
        volume_util = (total_volume_m3 / max_volume) * 100.0 if max_volume else 0.0
        utilization_pct = weight_util * 0.65 + volume_util * 0.35
        utilization_score = _clamp(100.0 - abs(utilization_pct - 84.0) * 1.6, 0.0, 100.0)

        pickup = shipments[0]
        deadhead_km = _distance_km(
            {
                "lat": truck.get("currentLat") or truck.get("dealer", {}).get("primaryLat") or pickup.get("originLat"),
                "lng": truck.get("currentLng") or truck.get("dealer", {}).get("primaryLng") or pickup.get("originLng"),
            },
            {"lat": pickup.get("originLat"), "lng": pickup.get("originLng")},
        )
        route_score = _clamp(100.0 - deadhead_km * 0.45 - (len(shipments) - 1) * 3.0, 25.0, 100.0)

        base_rate = float(truck.get("dealer", {}).get("baseRatePerKmTon", 18.0) or 18.0)
        total_weight_tons = total_weight_kg / 1000.0
        estimated_cost = round(base_rate * total_weight_tons * route_km, 2)
        cost_score = _clamp(100.0 - (base_rate / max(max_base_rate, 1.0)) * 42.0, 40.0, 98.0)

        co2_score = co2_score_fn(truck, total_weight_kg, route_km, utilization_pct)
        route_co2 = calculate(route_km, truck.get("fuelEfficiency", 4.0), truck.get("emissionFactor", 2.68), total_weight_tons)
        baseline_shipments = [
            {
                "weightKg": shipment.get("weightKg", 0.0),
                "baselineDistanceKm": max(route_km / max(len(shipments), 1), 45.0),
            }
            for shipment in shipments
        ]
        baseline_co2 = calculate_baseline(
            baseline_shipments,
            truck.get("fuelEfficiency", 4.0),
            truck.get("emissionFactor", 2.68),
        )
        co2_saved = round(max(baseline_co2 - route_co2, 1.0), 2)

        composite = (
            utilization_score * W_UTILIZATION
            + route_score * W_ROUTE
            + cost_score * W_COST
            + co2_score * W_CO2
        )

        scored.append(
            {
                "truckId": truck.get("id"),
                "scores": {
                    "utilization": round(utilization_score, 2),
                    "route": round(route_score, 2),
                    "cost": round(cost_score, 2),
                    "co2": round(co2_score, 2),
                },
                "estimatedCost": estimated_cost,
                "co2SavedKg": co2_saved,
                "routeDistanceKmEstimate": route_km,
                "routeSource": solved_route.get("source", "fallback"),
                "compositeScore": round(composite, 2),
            }
        )

    return sorted(scored, key=lambda item: item["compositeScore"], reverse=True)
