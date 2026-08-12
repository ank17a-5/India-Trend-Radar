import pandas as pd
from pathlib import Path

# Dynamic Root Resolution: Terminal directory ya Script directory se root find karein
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = Path.cwd() if (Path.cwd() / "data").exists() else SCRIPT_DIR.parents[2]

# Explicit CSV Paths
TREND_FILE = PROJECT_ROOT / "data" / "predictions" / "india_trend_score.csv"
FORECAST_FILE = PROJECT_ROOT / "data" / "predictions" / "prophet_predictions.csv"
ANOMALY_FILE = PROJECT_ROOT / "data" / "predictions" / "anomaly_detection.csv"
METRICS_FILE = PROJECT_ROOT / "data" / "reports" / "model_metrics.csv"


def get_rising_trends():
    if not TREND_FILE.exists():
        return []

    try:
        df = pd.read_csv(TREND_FILE)

        # Convert NaN values to empty strings/safe values for JSON output
        df = df.where(pd.notnull(df), None)

        if "trend_rank" in df.columns:
            df = df.sort_values(by="trend_rank")

        return df.head(10).to_dict(orient="records")
    except Exception as e:
        return []


def get_top_niches():
    if not TREND_FILE.exists():
        return []

    try:
        df = pd.read_csv(TREND_FILE)
        df = df.where(pd.notnull(df), None)

        if "india_trend_score" in df.columns:
            df = df.sort_values(by="india_trend_score", ascending=False)

        cols = [
            col
            for col in [
                "keyword",
                "india_trend_score",
                "viral_probability",
                "trend_rank",
            ]
            if col in df.columns
        ]

        if cols:
            df = df[cols]

        return df.head(10).to_dict(orient="records")
    except Exception as e:
        return []


def get_forecast(topic: str):
    if not FORECAST_FILE.exists():
        return {
            "topic": topic,
            "forecast": [],
            "error": f"File not found at: {FORECAST_FILE}",
        }

    try:
        df = pd.read_csv(FORECAST_FILE)
        df = df.where(pd.notnull(df), None)

        if "keyword" in df.columns:
            df = df[df["keyword"].astype(str).str.lower() == topic.lower()]

        return {"topic": topic, "forecast": df.to_dict(orient="records")}
    except Exception as e:
        return {"topic": topic, "forecast": [], "error": str(e)}

def get_anomalies(limit: int = 20):
    if not ANOMALY_FILE.exists():
        return {
            "anomalies": [],
            "error": f"File not found at: {ANOMALY_FILE}",
        }

    try:
        df = pd.read_csv(ANOMALY_FILE)
        df = df.where(pd.notnull(df), None)

        if "is_anomaly" in df.columns:
            df = df[df["is_anomaly"] == 1]

        if "anomaly_score" in df.columns:
            df = df.sort_values(
                by="anomaly_score",
                ascending=False
            )

        return {
            "count": len(df),
            "anomalies": df.head(limit).to_dict(orient="records"),
        }

    except Exception as e:
        return {
            "anomalies": [],
            "error": str(e),
        }


def get_model_evaluation():
    if not METRICS_FILE.exists():
        return {
            "metrics": [],
            "error": f"File not found at: {METRICS_FILE}",
        }

    try:
        df = pd.read_csv(METRICS_FILE)
        df = df.where(pd.notnull(df), None)

        return {
            "metrics": df.to_dict(orient="records")
        }

    except Exception as e:
        return {
            "metrics": [],
            "error": str(e),
        }

