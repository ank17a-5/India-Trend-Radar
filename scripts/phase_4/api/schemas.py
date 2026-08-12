from pydantic import BaseModel

class RisingTrend(BaseModel):
    keyword: str
    prediction_date: str
    forecasting_date: str
    forecast_score: float
    predicted_viral: int
    viral_probability: float
    is_anomaly: int
    anomaly_score: float
    india_trend_score: float
    trend_rank: int