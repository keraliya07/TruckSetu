def _distance_km(start, end):
    lat1 = float(start.get("lat", 0.0))
    lng1 = float(start.get("lng", 0.0))
    lat2 = float(end.get("lat", 0.0))
    lng2 = float(end.get("lng", 0.0))
    return (((lat1 - lat2) ** 2 + (lng1 - lng2) ** 2) ** 0.5) * 111.0


def solve_vrp(truck, shipments):
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

    points = [truck_position, *ordered]
    total_distance = 0.0
    for index in range(1, len(points)):
        total_distance += _distance_km(points[index - 1], points[index])

    total_distance = round(max(total_distance * 1.18, 12.0), 2)
    total_time_s = int(max((total_distance / 42.0) * 3600.0, 2700.0))

    return {
        "orderedStops": ordered,
        "totalDistanceKm": total_distance,
        "totalTimeS": total_time_s,
        "feasible": True,
        "geometry": {
            "type": "LineString",
            "coordinates": [[stop.get("lng"), stop.get("lat")] for stop in ordered],
        },
    }
