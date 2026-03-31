# === ml-service/app/services/demand_forecast.py ===
# Purpose: Demand forecasting using Facebook Prophet
# Dependencies: prophet, pandas

# from prophet import Prophet
# import pandas as pd

# _models = {}  # Cache fitted models per city

# def forecast_demand(cities, horizon_days=7):
#     """
#     Forecast shipment demand per city for next N days.
#
#     Steps:
#       1. For each city, query historical daily shipment counts from DB
#       2. Format as Prophet DataFrame: columns 'ds' (date) and 'y' (count)
#       3. Fit Prophet model (or use cached)
#       4. Generate future dates: model.make_future_dataframe(periods=horizon_days)
#       5. Predict: forecast = model.predict(future)
#       6. Extract: yhat, yhat_lower, yhat_upper
#
#     Returns: list of { city, date, predicted_demand, lower_bound, upper_bound }
#     """
#     ...

# def retrain_forecast_model():
#     """Retrain Prophet models with latest data, called by weekly cron"""
#     ...
