import pandas as pd
from pathlib import Path

# Project root folder
BASE_DIR = Path(__file__).resolve().parent.parent

# India Trend Score CSV
TREND_FILE = BASE_DIR / "data" / "predictions" / "india_trend_score.csv"

# Prophet predictions CSV
FORECAST_FILE = BASE_DIR / "data" / "predictions" / "prophet_predictions.csv"


def get_rising_trends():
    if not TREND_FILE.exists():
        return {"error": "india_trend_score.csv not found"}

    df = pd.read_csv(TREND_FILE)

    # Sort by trend rank
    df = df.sort_values(by="trend_rank")

    # Return top 10 rising trends
    return df.head(10).to_dict(orient="records")


def get_top_niches():
    if not TREND_FILE.exists():
        return {"error": "india_trend_score.csv not found"}

    df = pd.read_csv(TREND_FILE)

    # Highest trend score first
    df = df.sort_values(
        by="india_trend_score",
        ascending=False
    )

    return df[
        [
            "keyword",
            "india_trend_score",
            "viral_probability",
            "trend_rank",
        ]
    ].head(10).to_dict(orient="records")


def get_forecast(topic: str):
    if not FORECAST_FILE.exists():
        return {"error": "prophet_predictions.csv not found"}

    df = pd.read_csv(FORECAST_FILE)

    return {
        "topic": topic,
        "forecast": df.to_dict(orient="records")
    }