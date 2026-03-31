# === ml-service/app/utils/matrix_builder.py ===
# Purpose: Build distance/time matrices from OSRM for VRP solver
# Dependencies: ../services/osrm_client

# from app.services.osrm_client import get_distance_matrix

# def build_matrices(nodes):
#     """
#     Given route nodes, build NxN distance and time matrices via OSRM.
#
#     Steps:
#       1. Extract coordinates: [(lng, lat) for each node]
#       2. Call OSRM table service
#       3. Handle response, replace nulls with large number (unreachable)
#       4. Return: (distance_matrix, time_matrix) as 2D lists
#
#     NOTE: OSRM limit ~100 coords. Split into chunks if more.
#     """
#     ...
