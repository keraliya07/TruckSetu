from datetime import date, timedelta


CITY_BASELINES = {
    "ahmedabad": 14,
    "surat": 12,
    "vadodara": 9,
    "mumbai": 18,
    "pune": 11,
    "rajkot": 7,
}


def _city_seed(city: str) -> int:
    return sum(ord(char) for char in city.lower())


def forecast_demand(cities, horizon_days=7):
    safe_horizon = max(1, min(int(horizon_days or 7), 30))
    requested_cities = [city for city in cities if city]

    if not requested_cities:
        requested_cities = ["Ahmedabad", "Surat", "Mumbai"]

    today = date.today()
    forecasts = []

    for city in requested_cities:
        city_key = city.lower()
        baseline = CITY_BASELINES.get(city_key, 8 + (_city_seed(city) % 6))
        trend = 0.38 if safe_horizon > 14 else 0.62
        seasonal_seed = (_city_seed(city) % 5) * 0.35

        for offset in range(safe_horizon):
            predicted = baseline + (offset * trend) + ((offset % 4) * 0.55) + seasonal_seed
            lower = max(1.0, predicted * 0.86)
            upper = predicted * 1.17

            forecasts.append(
                {
                    "city": city,
                    "date": (today + timedelta(days=offset + 1)).isoformat(),
                    "predicted_demand": round(predicted, 2),
                    "lower_bound": round(lower, 2),
                    "upper_bound": round(upper, 2),
                }
            )

    return forecasts


def retrain_forecast_model():
    return {
        "status": "accepted",
        "model": "demand-forecast",
        "message": "Forecast model refresh completed with heuristic baseline data.",
    }
