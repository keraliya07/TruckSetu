from app.services.osrm_client import get_route


def _distance_km(start, end):
    lat1 = float(start.get("lat", 0.0))
    lng1 = float(start.get("lng", 0.0))
    lat2 = float(end.get("lat", 0.0))
    lng2 = float(end.get("lng", 0.0))
    return (((lat1 - lat2) ** 2 + (lng1 - lng2) ** 2) ** 0.5) * 111.0


def solve_vrp(truck, shipments):
    if not shipments:
        return {
            "orderedStops": [],
            "totalDistanceKm": 0.0,
            "totalTimeS": 0,
            "feasible": False,
            "geometry": {"type": "LineString", "coordinates": []},
        }

    pickup = shipments[0]
    truck_position = {
        "lat": truck.get("currentLat") or truck.get("dealer", {}).get("primaryLat") or pickup.get("originLat"),
        "lng": truck.get("currentLng") or truck.get("dealer", {}).get("primaryLng") or pickup.get("originLng"),
    }

    remaining = []
    seen = set()
    for shipment in shipments:
        city = shipment.get("destCity")
        if city in seen:
            continue
        seen.add(city)
        remaining.append(
            {
                "type": "DELIVERY",
                "city": city,
                "address": shipment.get("destAddress"),
                "lat": shipment.get("destLat"),
                "lng": shipment.get("destLng"),
                "shipmentId": shipment.get("id"),
            }
        )

    ordered = [
        {
            "type": "PICKUP",
            "city": pickup.get("originCity"),
            "address": pickup.get("originAddress"),
            "lat": pickup.get("originLat"),
            "lng": pickup.get("originLng"),
        }
    ]

    current = {"lat": pickup.get("originLat"), "lng": pickup.get("originLng")}
    while remaining:
        best_index = 0
        best_distance = float("inf")
        for index, candidate in enumerate(remaining):
            distance = _distance_km(current, candidate)
            if distance < best_distance:
                best_distance = distance
                best_index = index

        next_stop = remaining.pop(best_index)
        ordered.append(next_stop)
        current = next_stop

    route_points = [[truck_position["lng"], truck_position["lat"]]] + [
        [stop.get("lng"), stop.get("lat")] for stop in ordered
    ]
    route = get_route(route_points)
    total_distance = round(max(float(route["distance"]) / 1000.0, 12.0), 2)
    total_time_s = int(max(float(route["duration"]), 2700.0))

    return {
        "orderedStops": ordered,
        "totalDistanceKm": total_distance,
        "totalTimeS": total_time_s,
        "feasible": True,
        "geometry": route.get("geometry")
        or {
            "type": "LineString",
            "coordinates": [[stop.get("lng"), stop.get("lat")] for stop in ordered],
        },
        "source": route.get("source", "fallback"),
    }
