EMISSION_FACTOR = 2.68


def calculate(distance_km, fuel_efficiency, emission_factor=EMISSION_FACTOR, weight_tons=0):
    efficiency = max(float(fuel_efficiency or 4.0), 1.0)
    load_factor = max(float(weight_tons or 0.0), 1.0)
    base_co2 = (float(distance_km or 0.0) / efficiency) * float(emission_factor or EMISSION_FACTOR)
    return round(base_co2 * min(max(load_factor / 10.0, 0.85), 1.2), 2)


def calculate_baseline(shipments, fuel_efficiency, emission_factor=EMISSION_FACTOR):
    total = 0.0
    for shipment in shipments:
        route_km = float(shipment.get("baselineDistanceKm", 180.0))
        weight_tons = float(shipment.get("weightKg", 0.0)) / 1000.0
        total += calculate(route_km, fuel_efficiency, emission_factor, weight_tons)
    return round(total, 2)


def score(truck, shipment_weight_kg, total_route_km, utilization_pct):
    weight_tons = float(shipment_weight_kg or 0.0) / 1000.0
    trip_co2 = calculate(
        total_route_km,
        truck.get("fuelEfficiency", 4.0),
        truck.get("emissionFactor", EMISSION_FACTOR),
        weight_tons,
    )
    benchmark = max(22.0, total_route_km * 0.28)
    efficiency_bonus = min(max(float(utilization_pct or 0.0) / 100.0, 0.4), 1.0)
    score_value = 100.0 - ((trip_co2 / benchmark) * 45.0) + efficiency_bonus * 18.0
    return round(max(25.0, min(score_value, 97.0)), 2)


def equivalents(co2_saved_kg):
    saved = float(co2_saved_kg or 0.0)
    return {
        "trees_equivalent": round(saved / 21.8, 2),
        "car_km_avoided": round(saved * 4.1, 1),
        "flights_avoided": round(saved / 255.0, 3),
    }
