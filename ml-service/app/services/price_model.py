TRUCK_TYPE_FACTORS = {
    "LCV": 0.92,
    "ICV": 1.0,
    "HEAVY": 1.12,
    "MULTI_AXLE": 1.2,
}

CITY_FACTORS = {
    "mumbai": 1.08,
    "pune": 1.04,
    "surat": 1.01,
    "ahmedabad": 1.0,
}


def predict_price(distance_km, weight_tons, truck_type, origin_city, dest_city, urgency=1):
    safe_distance = max(float(distance_km or 0.0), 10.0)
    safe_weight = max(float(weight_tons or 0.0), 0.5)
    urgency_factor = 1 + max(int(urgency or 1) - 1, 0) * 0.08
    truck_factor = TRUCK_TYPE_FACTORS.get(str(truck_type or "").upper(), 1.05)
    lane_factor = (
        CITY_FACTORS.get(str(origin_city or "").lower(), 1.0)
        + CITY_FACTORS.get(str(dest_city or "").lower(), 1.0)
    ) / 2

    estimated_price = safe_distance * safe_weight * 8.9 * truck_factor * lane_factor * urgency_factor
    confidence_spread = max(estimated_price * 0.08, 450.0)

    return {
        "estimated_price": round(estimated_price, 2),
        "confidence_interval": [
            round(max(estimated_price - confidence_spread, 0.0), 2),
            round(estimated_price + confidence_spread, 2),
        ],
        "pricing_factors": {
            "truck_factor": round(truck_factor, 3),
            "lane_factor": round(lane_factor, 3),
            "urgency_factor": round(urgency_factor, 3),
        },
    }


def retrain_model():
    return {
        "status": "accepted",
        "model": "price-prediction",
        "message": "Price model refresh completed with heuristic baseline data.",
    }
