# === ml-service/app/services/osrm_client.py ===
# Purpose: HTTP client for self-hosted OSRM
# Dependencies: requests, ../config

# import requests
# from app.config import settings

# def get_distance_matrix(coordinates):
#     """
#     Call OSRM /table/v1/driving endpoint.
#     @param coordinates: list of [lng, lat] pairs
#     @returns: { distances: NxN meters, durations: NxN seconds }
#     """
#     # coords_str = ";".join(f"{lng},{lat}" for lng, lat in coordinates)
#     # url = f"{settings.OSRM_URL}/table/v1/driving/{coords_str}?annotations=distance,duration"
#     # response = requests.get(url)
#     # data = response.json()
#     # return { "distances": data["distances"], "durations": data["durations"] }
#     ...

# def get_route(coordinates):
#     """
#     Call OSRM /route/v1/driving endpoint.
#     @param coordinates: list of [lng, lat] ordered waypoints
#     @returns: { distance: meters, duration: seconds, geometry: GeoJSON }
#     """
#     # coords_str = ";".join(f"{lng},{lat}" for lng, lat in coordinates)
#     # url = f"{settings.OSRM_URL}/route/v1/driving/{coords_str}?geometries=geojson&overview=full"
#     # response = requests.get(url)
#     # data = response.json()
#     # route = data["routes"][0]
#     # return { "distance": route["distance"], "duration": route["duration"], "geometry": route["geometry"] }
#     ...
