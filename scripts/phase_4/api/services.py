import pandas as pd
from pathlib import Path
from functools import lru_cache

# ==========================================================
# PROJECT ROOT DYNAMIC RESOLUTION
# ==========================================================

def get_project_root() -> Path:
    # 1. Search upwards from this file location for a directory containing 'data'
    curr = Path(__file__).resolve().parent
    while curr != curr.parent:
        if (curr / "data" / "predictions").exists() or (curr / "data").exists():
            return curr
        curr = curr.parent

    # 2. Search upwards from current working directory
    curr = Path.cwd()
    while curr != curr.parent:
        if (curr / "data" / "predictions").exists() or (curr / "data").exists():
            return curr
        curr = curr.parent

    # Fallback to 3 parents up from scripts/phase_4/api
    return Path(__file__).resolve().parents[3]

PROJECT_ROOT = get_project_root()
print(f"[API Services] Resolved PROJECT_ROOT to: {PROJECT_ROOT}")

# ==========================================================
# CSV FILE PATHS
# ==========================================================

TREND_FILE = (
    PROJECT_ROOT
    / "data"
    / "predictions"
    / "india_trend_score.csv"
)

FORECAST_FILE = (
    PROJECT_ROOT
    / "data"
    / "predictions"
    / "prophet_predictions.csv"
)

ANOMALY_FILE = (
    PROJECT_ROOT
    / "data"
    / "predictions"
    / "anomaly_detection.csv"
)

METRICS_FILE = (
    PROJECT_ROOT
    / "data"
    / "reports"
    / "model_metrics.csv"
)

# ==========================================================
# HELPER FUNCTION
# ==========================================================

def clean_dataframe(df):
    """
    Clean DataFrame before converting it to JSON.
    """
    df = df.where(pd.notna(df), None)
    return df

# ==========================================================
# RISING TRENDS (OPTIMIZED WITH CACHING)
# ==========================================================

def get_rising_trends(limit: int = 50, date_range: str = "7d", source: str = "all"):
    if not TREND_FILE.exists():
        print(f"[API Error] TREND_FILE not found at: {TREND_FILE}")
        return []

    try:
        # Load full CSV for accurate ranking & filtering
        df = pd.read_csv(TREND_FILE)

        # 1. DATE FILTERING LOGIC
        if "prediction_date" in df.columns:
            df["prediction_date_dt"] = pd.to_datetime(df["prediction_date"], errors="coerce")
            max_date = df["prediction_date_dt"].max()

            if pd.notnull(max_date) and date_range and date_range.lower() != "all":
                dr = date_range.lower()
                if dr == "today":
                    df = df[df["prediction_date_dt"].dt.date == max_date.date()]
                elif dr in ["7d", "last 7 days"]:
                    start_date = max_date - pd.Timedelta(days=7)
                    df = df[df["prediction_date_dt"] >= start_date]
                elif dr in ["15d", "last 15 days"]:
                    start_date = max_date - pd.Timedelta(days=15)
                    df = df[df["prediction_date_dt"] >= start_date]
                elif dr in ["30d", "last 30 days"]:
                    start_date = max_date - pd.Timedelta(days=30)
                    df = df[df["prediction_date_dt"] >= start_date]

            df = df.drop(columns=["prediction_date_dt"], errors="ignore")

        # 2. SOURCE / KEYWORD FILTERING LOGIC
        if source and source.lower() != "all":
            if "source" in df.columns:
                df = df[df["source"].astype(str).str.lower() == source.lower()]
            elif "keyword" in df.columns:
                df = df[df["keyword"].astype(str).str.contains(source, case=False, na=False)]

        # 3. SORT AND LIMIT
        if "trend_rank" in df.columns:
            df = df.sort_values(by="trend_rank")

        df = clean_dataframe(df.head(limit))
        return df.to_dict(orient="records")

    except Exception as e:
        print("[Rising trends error]", e)
        return []

# ==========================================================
# TOP NICHES
# ==========================================================

def get_top_niches():
    if not TREND_FILE.exists():
        return []

    try:
        df = pd.read_csv(TREND_FILE).head(100)
        df = clean_dataframe(df)

        if "india_trend_score" in df.columns:
            df["india_trend_score"] = pd.to_numeric(df["india_trend_score"], errors="coerce")
            df = df.sort_values(by="india_trend_score", ascending=False)

        columns = ["keyword", "india_trend_score", "viral_probability", "trend_rank", "prediction_date"]
        available_columns = [col for col in columns if col in df.columns]

        if available_columns:
            df = df[available_columns]

        return df.head(10).to_dict(orient="records")

    except Exception as e:
        print(f"Error loading top niches: {e}")
        return []

# ==========================================================
# PROPHET FORECAST
# ==========================================================

def get_forecast(topic: str):
    if not FORECAST_FILE.exists():
        return {
            "topic": topic,
            "forecast": [],
            "error": "Prophet prediction file not found."
        }

    try:
        df = pd.read_csv(FORECAST_FILE).head(100)
        df = clean_dataframe(df)

        columns = ["ds", "yhat", "yhat_lower", "yhat_upper"]
        available_columns = [col for col in columns if col in df.columns]

        if available_columns:
            df = df[available_columns]

        return {
            "topic": topic,
            "forecast_type": "overall",
            "forecast": df.to_dict(orient="records")
        }

    except Exception as e:
        return {
            "topic": topic,
            "forecast_type": "overall",
            "forecast": [],
            "error": str(e)
        }

# ==========================================================
# ANOMALIES
# ==========================================================

def get_anomalies(limit: int = 20):
    if not ANOMALY_FILE.exists():
        return {
            "anomalies": [],
            "count": 0,
            "error": "Anomaly detection file not found."
        }

    try:
        df = pd.read_csv(ANOMALY_FILE).head(100)

        if "is_anomaly" in df.columns:
            df["is_anomaly"] = pd.to_numeric(df["is_anomaly"], errors="coerce")
            df = df[df["is_anomaly"] == 1]

        if "anomaly_score" in df.columns:
            df["anomaly_score"] = pd.to_numeric(df["anomaly_score"], errors="coerce")
            df = df.sort_values(by="anomaly_score", ascending=False)

        df = clean_dataframe(df)

        return {
            "count": len(df),
            "anomalies": df.head(limit).to_dict(orient="records")
        }

    except Exception as e:
        return {
            "anomalies": [],
            "count": 0,
            "error": str(e)
        }

# ==========================================================
# MODEL EVALUATION
# ==========================================================

def get_model_evaluation():
    if not METRICS_FILE.exists():
        return {
            "metrics": [],
            "error": "Model metrics file not found."
        }

    try:
        df = pd.read_csv(METRICS_FILE)
        df = clean_dataframe(df)

        return {
            "metrics": df.to_dict(orient="records")
        }

    except Exception as e:
        return {
            "metrics": [],
            "error": str(e)
        }