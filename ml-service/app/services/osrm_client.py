import math

import requests

from app.config import settings


def _haversine_km(start, end):
    lat1 = math.radians(float(start[1]))
    lng1 = math.radians(float(start[0]))
    lat2 = math.radians(float(end[1]))
    lng2 = math.radians(float(end[0]))
    d_lat = lat2 - lat1
    d_lng = lng2 - lng1
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(d_lng / 2) ** 2
    )
    return 6371 * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _fallback_matrix(coordinates):
    distances = []
    durations = []

    for origin in coordinates:
        distance_row = []
        duration_row = []
        for destination in coordinates:
            distance_km = _haversine_km(origin, destination)
            distance_row.append(round(distance_km * 1000, 2))
            duration_row.append(round((distance_km / 42.0) * 3600, 2))
        distances.append(distance_row)
        durations.append(duration_row)

    return {
        "distances": distances,
        "durations": durations,
        "source": "fallback",
    }


def get_distance_matrix(coordinates):
    if len(coordinates) < 2:
        return {
            "distances": [[0.0 for _ in coordinates]],
            "durations": [[0.0 for _ in coordinates]],
            "source": "trivial",
        }

    try:
        coords_str = ";".join(f"{lng},{lat}" for lng, lat in coordinates)
        url = (
            f"{settings.osrm_url.rstrip('/')}/table/v1/driving/{coords_str}"
            "?annotations=distance,duration"
        )
        response = requests.get(url, timeout=4)
        response.raise_for_status()
        data = response.json()

        return {
            "distances": data["distances"],
            "durations": data["durations"],
            "source": "osrm",
        }
    except Exception:
        return _fallback_matrix(coordinates)


def get_route(coordinates):
    if len(coordinates) < 2:
        first = coordinates[0] if coordinates else [0.0, 0.0]
        return {
            "distance": 0.0,
            "duration": 0.0,
            "geometry": {"type": "LineString", "coordinates": [first]},
            "source": "trivial",
        }

    try:
        coords_str = ";".join(f"{lng},{lat}" for lng, lat in coordinates)
        url = (
            f"{settings.osrm_url.rstrip('/')}/route/v1/driving/{coords_str}"
            "?geometries=geojson&overview=full"
        )
        response = requests.get(url, timeout=4)
        response.raise_for_status()
        data = response.json()
        route = data["routes"][0]
        return {
            "distance": route["distance"],
            "duration": route["duration"],
            "geometry": route["geometry"],
            "source": "osrm",
        }
    except Exception:
        total_distance_km = 0.0
        for index in range(1, len(coordinates)):
            total_distance_km += _haversine_km(coordinates[index - 1], coordinates[index])

        total_distance_km = max(total_distance_km * 1.18, 1.0)
        return {
            "distance": round(total_distance_km * 1000, 2),
            "duration": round((total_distance_km / 42.0) * 3600, 2),
            "geometry": {"type": "LineString", "coordinates": coordinates},
            "source": "fallback",
        }
