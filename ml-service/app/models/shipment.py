# === ml-service/app/models/shipment.py ===
# Purpose: Pydantic models for shipment data
# Dependencies: pydantic

# from pydantic import BaseModel
# from typing import Optional
# from datetime import datetime

# class ShipmentInput(BaseModel):
#     id: str
#     weight_kg: float
#     volume_m3: float
#     origin_city: str
#     origin_lat: float
#     origin_lng: float
#     dest_city: str
#     dest_lat: float
#     dest_lng: float
#     deadline: datetime
#     fragile: bool = False
#     hazardous: bool = False
#     priority: int = 1
