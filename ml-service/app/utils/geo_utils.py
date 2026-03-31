# === ml-service/app/utils/geo_utils.py ===
# Purpose: Geographic utility functions
# Dependencies: math

# import math

# def haversine(lat1, lng1, lat2, lng2):
#     """
#     Great-circle distance between two points in km.
#     R = 6371 km
#     """
#     # R = 6371
#     # dlat = math.radians(lat2 - lat1)
#     # dlng = math.radians(lng2 - lng1)
#     # a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
#     # return R * 2 * math.asin(math.sqrt(a))
#     ...

# def bearing(lat1, lng1, lat2, lng2):
#     """Initial compass bearing from point 1 to point 2. Returns 0-360 degrees."""
#     ...

# CITY_COORDINATES = {
#     'Mumbai': (19.0760, 72.8777),
#     'Delhi': (28.7041, 77.1025),
#     'Bangalore': (12.9716, 77.5946),
#     'Chennai': (13.0827, 80.2707),
#     'Kolkata': (22.5726, 88.3639),
#     'Hyderabad': (17.3850, 78.4867),
#     'Ahmedabad': (23.0225, 72.5714),
#     'Pune': (18.5204, 73.8567),
#     'Surat': (21.1702, 72.8311),
#     'Jaipur': (26.9124, 75.7873),
#     'Lucknow': (26.8467, 80.9462),
#     'Nagpur': (21.1458, 79.0882),
#     'Nashik': (19.9975, 73.7898),
#     'Indore': (22.7196, 75.8577),
#     'Coimbatore': (11.0168, 76.9558),
# }

# def city_to_coords(city_name):
#     """Lookup lat/lng for a city name"""
#     # return CITY_COORDINATES.get(city_name)
#     ...
