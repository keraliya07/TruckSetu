from math import asin, atan2, cos, degrees, radians, sin, sqrt

from app.config import settings

W_PROXIMITY = 0.42
W_DIRECTION = 0.33
W_UTILIZATION = 0.25


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))


def _haversine_km(start: dict, end: dict) -> float:
    lat1 = radians(float(start.get("lat", 0.0)))
    lng1 = radians(float(start.get("lng", 0.0)))
    lat2 = radians(float(end.get("lat", 0.0)))
    lng2 = radians(float(end.get("lng", 0.0)))

    d_lat = lat2 - lat1
    d_lng = lng2 - lng1
    a = sin(d_lat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(d_lng / 2) ** 2
    return 6371.0 * 2 * asin(sqrt(a))


def _bearing(start: dict, end: dict) -> float:
    lat1 = radians(float(start.get("lat", 0.0)))
    lng1 = radians(float(start.get("lng", 0.0)))
    lat2 = radians(float(end.get("lat", 0.0)))
    lng2 = radians(float(end.get("lng", 0.0)))

    y = sin(lng2 - lng1) * cos(lat2)
    x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(lng2 - lng1)
    return (degrees(atan2(y, x)) + 360.0) % 360.0


def _angle_difference(first: float, second: float) -> float:
    delta = abs(first - second)
    return delta if delta <= 180.0 else 360.0 - delta


def score_return_loads(truck: dict, candidate_shipments: list[dict]) -> list[dict]:
    current = {
        "lat": truck.get("currentLat") or truck.get("homeLat") or 0.0,
        "lng": truck.get("currentLng") or truck.get("homeLng") or 0.0,
    }
    home = {
        "lat": truck.get("homeLat") or current["lat"],
        "lng": truck.get("homeLng") or current["lng"],
    }
    max_weight = float(truck.get("maxWeightKg", 0.0) or 0.0)
    max_volume = float(truck.get("maxVolumeM3", 0.0) or 0.0)

    scored = []

    for shipment in candidate_shipments:
        pickup = {
            "lat": shipment.get("originLat", 0.0),
            "lng": shipment.get("originLng", 0.0),
        }
        destination = {
            "lat": shipment.get("destLat", 0.0),
            "lng": shipment.get("destLng", 0.0),
        }

        pickup_distance_km = _haversine_km(current, pickup)
        if pickup_distance_km > settings.max_return_load_distance_km:
            continue

        proximity_score = _clamp(100.0 - pickup_distance_km * 0.65, 0.0, 100.0)

        angle_home = _bearing(current, home)
        angle_delivery = _bearing(current, destination)
        direction_score = _clamp(
            100.0 - _angle_difference(angle_home, angle_delivery) * 0.55,
            0.0,
            100.0,
        )

        weight_fill_pct = (
            (float(shipment.get("weightKg", 0.0) or 0.0) / max_weight) * 100.0
            if max_weight
            else 0.0
        )
        volume_fill_pct = (
            (float(shipment.get("volumeM3", 0.0) or 0.0) / max_volume) * 100.0
            if max_volume
            else 0.0
        )
        utilization_score = _clamp(max(weight_fill_pct, volume_fill_pct * 0.92), 0.0, 100.0)

        combined_score = (
            proximity_score * W_PROXIMITY
            + direction_score * W_DIRECTION
            + utilization_score * W_UTILIZATION
        )

        scored.append(
            {
                "shipmentId": shipment.get("id"),
                "pickupDistanceKm": round(pickup_distance_km, 2),
                "proximityScore": round(proximity_score, 2),
                "directionScore": round(direction_score, 2),
                "utilizationScore": round(utilization_score, 2),
                "combinedScore": round(combined_score, 2),
            }
        )

    return sorted(scored, key=lambda item: item["combinedScore"], reverse=True)
