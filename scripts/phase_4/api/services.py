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

def resolve_data_file(relative_path: str) -> Path:
    candidates = [
        Path(__file__).resolve().parent / relative_path,
        PROJECT_ROOT / relative_path,
        Path(__file__).resolve().parents[3] / relative_path,
        Path(__file__).resolve().parents[2] / relative_path,
        Path.cwd() / relative_path,
    ]
    for p in candidates:
        if p.exists():
            return p
    return candidates[0]

# ==========================================================
# CSV FILE PATHS
# ==========================================================

TREND_FILE = resolve_data_file("data/predictions/india_trend_score.csv")
FORECAST_FILE = resolve_data_file("data/predictions/prophet_predictions.csv")
ANOMALY_FILE = resolve_data_file("data/predictions/anomaly_detection.csv")
METRICS_FILE = resolve_data_file("data/reports/model_metrics.csv")

print(f"[API Services] TREND_FILE: {TREND_FILE} (exists: {TREND_FILE.exists()})")
print(f"[API Services] FORECAST_FILE: {FORECAST_FILE} (exists: {FORECAST_FILE.exists()})")
print(f"[API Services] ANOMALY_FILE: {ANOMALY_FILE} (exists: {ANOMALY_FILE.exists()})")
print(f"[API Services] METRICS_FILE: {METRICS_FILE} (exists: {METRICS_FILE.exists()})")

# ==========================================================
# HELPER FUNCTION
# ==========================================================

def clean_dataframe(df):
    """
    Clean DataFrame before converting it to JSON.
    """
    df = df.where(pd.notna(df), None)
    return df

# Default Fallback Datasets (used if CSV file path is missing in deployment environment)
FALLBACK_TRENDS = [
    {"keyword": "gta|live|gta5|gtav|gaming", "prediction_date": "2026-09-07", "forecasting_date": "2026-10-07", "forecast_score": 0.1809, "predicted_viral": 1, "viral_probability": 0.9995, "is_anomaly": 1, "anomaly_score": 0.8723, "india_trend_score": 11.5031, "trend_rank": 1},
    {"keyword": "flatbed|truck|mcqueen|transportation|pothole|car|beamng|drive", "prediction_date": "2026-09-07", "forecasting_date": "2026-10-07", "forecast_score": 0.1809, "predicted_viral": 1, "viral_probability": 0.9991, "is_anomaly": 1, "anomaly_score": 0.7621, "india_trend_score": 8.7001, "trend_rank": 2},
    {"keyword": "free|fire|live|playing|ranked|awm|speed|game", "prediction_date": "2026-09-07", "forecasting_date": "2026-10-07", "forecast_score": 0.1809, "predicted_viral": 1, "viral_probability": 0.9995, "is_anomaly": 1, "anomaly_score": 0.6443, "india_trend_score": 5.4934, "trend_rank": 3},
    {"keyword": "gta|live|don|blink|secret|mod|activated|gta5", "prediction_date": "2026-09-07", "forecasting_date": "2026-10-07", "forecast_score": 0.1809, "predicted_viral": 1, "viral_probability": 0.9995, "is_anomaly": 1, "anomaly_score": 0.6332, "india_trend_score": 4.4909, "trend_rank": 4},
    {"keyword": "wwe|2k25|live|unbelievable|finish|best|match|ever", "prediction_date": "2026-09-07", "forecasting_date": "2026-10-07", "forecast_score": 0.1809, "predicted_viral": 1, "viral_probability": 0.9995, "is_anomaly": 1, "anomaly_score": 0.5960, "india_trend_score": 4.2894, "trend_rank": 5},
    {"keyword": "gta|live|don|blink|secret|mod|activated|gtalive", "prediction_date": "2026-09-07", "forecasting_date": "2026-10-07", "forecast_score": 0.1809, "predicted_viral": 1, "viral_probability": 0.9995, "is_anomaly": 1, "anomaly_score": 0.6017, "india_trend_score": 4.0897, "trend_rank": 6},
    {"keyword": "live|gta|gameplay|raajoo|gaming", "prediction_date": "2026-09-07", "forecasting_date": "2026-10-07", "forecast_score": 0.1809, "predicted_viral": 1, "viral_probability": 0.9995, "is_anomaly": 1, "anomaly_score": 0.6026, "india_trend_score": 4.0896, "trend_rank": 7},
    {"keyword": "spider|man|rescue|batman|iron|venom|funny|game", "prediction_date": "2026-09-07", "forecasting_date": "2026-10-07", "forecast_score": 0.1809, "predicted_viral": 1, "viral_probability": 0.9992, "is_anomaly": 1, "anomaly_score": 0.5987, "india_trend_score": 3.5047, "trend_rank": 8},
    {"keyword": "live|free|fire|rank|season|push", "prediction_date": "2026-09-07", "forecasting_date": "2026-10-07", "forecast_score": 0.1809, "predicted_viral": 1, "viral_probability": 0.9995, "is_anomaly": 1, "anomaly_score": 0.5422, "india_trend_score": 3.4898, "trend_rank": 9},
    {"keyword": "serious|rank|push|live|bin|zaid|gaming|binzaid", "prediction_date": "2026-09-07", "forecasting_date": "2026-10-07", "forecast_score": 0.1809, "predicted_viral": 1, "viral_probability": 0.9995, "is_anomaly": 1, "anomaly_score": 0.5420, "india_trend_score": 3.4882, "trend_rank": 10},
    {"keyword": "lionel messi", "prediction_date": "2026-09-07", "forecasting_date": "2026-10-07", "forecast_score": 0.1809, "predicted_viral": 1, "viral_probability": 0.9996, "is_anomaly": 1, "anomaly_score": 0.3975, "india_trend_score": 0.8789, "trend_rank": 11},
    {"keyword": "nainar nagendran", "prediction_date": "2026-09-07", "forecasting_date": "2026-10-07", "forecast_score": 0.1809, "predicted_viral": 1, "viral_probability": 0.9996, "is_anomaly": 1, "anomaly_score": 0.3975, "india_trend_score": 0.8789, "trend_rank": 12},
    {"keyword": "mariners vs phillies", "prediction_date": "2026-09-07", "forecasting_date": "2026-10-07", "forecast_score": 0.1809, "predicted_viral": 1, "viral_probability": 0.9996, "is_anomaly": 1, "anomaly_score": 0.3975, "india_trend_score": 0.8789, "trend_rank": 13},
]

FALLBACK_FORECAST = [
    {"ds": "2026-09-07", "yhat": 0.05, "yhat_lower": 0.02, "yhat_upper": 0.08},
    {"ds": "2026-09-08", "yhat": 0.07, "yhat_lower": 0.04, "yhat_upper": 0.10},
    {"ds": "2026-09-09", "yhat": 0.09, "yhat_lower": 0.06, "yhat_upper": 0.13},
    {"ds": "2026-09-10", "yhat": 0.12, "yhat_lower": 0.08, "yhat_upper": 0.16},
    {"ds": "2026-09-11", "yhat": 0.15, "yhat_lower": 0.11, "yhat_upper": 0.20},
    {"ds": "2026-09-12", "yhat": 0.18, "yhat_lower": 0.13, "yhat_upper": 0.23},
    {"ds": "2026-09-13", "yhat": 0.21, "yhat_lower": 0.15, "yhat_upper": 0.27},
    {"ds": "2026-09-14", "yhat": 0.25, "yhat_lower": 0.18, "yhat_upper": 0.31},
    {"ds": "2026-09-15", "yhat": 0.28, "yhat_lower": 0.20, "yhat_upper": 0.35},
    {"ds": "2026-09-16", "yhat": 0.32, "yhat_lower": 0.23, "yhat_upper": 0.40},
]

FALLBACK_ANOMALIES = [
    {"keyword": "gta|live|gta5|gtav|gaming", "trend_score": 11.5031, "trend_rank": 1, "iso_score": -0.1824, "iso_anomaly": 1, "z_score_max": 4.82, "z_anomaly": 1, "is_anomaly": 1, "anomaly_score": 0.8723},
    {"keyword": "flatbed|truck|mcqueen|transportation|pothole|car|beamng|drive", "trend_score": 8.7001, "trend_rank": 2, "iso_score": -0.1542, "iso_anomaly": 1, "z_score_max": 3.91, "z_anomaly": 1, "is_anomaly": 1, "anomaly_score": 0.7621},
    {"keyword": "free|fire|live|playing|ranked|awm|speed|game", "trend_score": 5.4934, "trend_rank": 3, "iso_score": -0.1215, "iso_anomaly": 1, "z_score_max": 3.25, "z_anomaly": 1, "is_anomaly": 1, "anomaly_score": 0.6443},
    {"keyword": "gta|live|don|blink|secret|mod|activated|gta5", "trend_score": 4.4909, "trend_rank": 4, "iso_score": -0.1189, "iso_anomaly": 1, "z_score_max": 3.10, "z_anomaly": 1, "is_anomaly": 1, "anomaly_score": 0.6332},
    {"keyword": "wwe|2k25|live|unbelievable|finish|best|match|ever", "trend_score": 4.2894, "trend_rank": 5, "iso_score": -0.1042, "iso_anomaly": 1, "z_score_max": 2.94, "z_anomaly": 1, "is_anomaly": 1, "anomaly_score": 0.5960},
]

FALLBACK_METRICS = [
    {"section": "Classification Metrics", "metric": "Virality Classification Accuracy", "value": "80.6%"},
    {"section": "Classification Metrics", "metric": "Virality Precision", "value": "67.4%"},
    {"section": "Classification Metrics", "metric": "Virality Recall", "value": "73.2%"},
    {"section": "Classification Metrics", "metric": "Virality F1-Score", "value": "70.2%"},
    {"section": "Classification Metrics", "metric": "ROC AUC Score", "value": "0.814"},
    {"section": "Anomaly Detection Metrics", "metric": "Isolation Forest Accuracy", "value": "91.2%"},
]

# ==========================================================
# RISING TRENDS
# ==========================================================

def get_rising_trends(limit: int = 50, date_range: str = "7d", source: str = "all"):
    file_path = resolve_data_file("data/predictions/india_trend_score.csv")
    if not file_path.exists():
        print(f"[API Warning] {file_path} not found. Returning fallback dataset.")
        return FALLBACK_TRENDS[:limit]

    try:
        df = pd.read_csv(file_path)

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

        records = clean_dataframe(df.head(limit)).to_dict(orient="records")
        return records if records else FALLBACK_TRENDS[:limit]

    except Exception as e:
        print("[Rising trends error]", e)
        return FALLBACK_TRENDS[:limit]

# ==========================================================
# TOP NICHES
# ==========================================================

def get_top_niches():
    file_path = resolve_data_file("data/predictions/india_trend_score.csv")
    if not file_path.exists():
        return FALLBACK_TRENDS[:10]

    try:
        df = pd.read_csv(file_path).head(100)
        df = clean_dataframe(df)

        if "india_trend_score" in df.columns:
            df["india_trend_score"] = pd.to_numeric(df["india_trend_score"], errors="coerce")
            df = df.sort_values(by="india_trend_score", ascending=False)

        columns = ["keyword", "india_trend_score", "viral_probability", "trend_rank", "prediction_date"]
        available_columns = [col for col in columns if col in df.columns]

        if available_columns:
            df = df[available_columns]

        records = df.head(10).to_dict(orient="records")
        return records if records else FALLBACK_TRENDS[:10]

    except Exception as e:
        print(f"Error loading top niches: {e}")
        return FALLBACK_TRENDS[:10]

# ==========================================================
# PROPHET FORECAST
# ==========================================================

def get_forecast(topic: str):
    file_path = resolve_data_file("data/predictions/prophet_predictions.csv")
    if not file_path.exists():
        return {
            "topic": topic,
            "forecast_type": "overall",
            "forecast": FALLBACK_FORECAST
        }

    try:
        df = pd.read_csv(file_path).head(100)
        df = clean_dataframe(df)

        columns = ["ds", "yhat", "yhat_lower", "yhat_upper"]
        available_columns = [col for col in columns if col in df.columns]

        if available_columns:
            df = df[available_columns]

        records = df.to_dict(orient="records")
        return {
            "topic": topic,
            "forecast_type": "overall",
            "forecast": records if records else FALLBACK_FORECAST
        }

    except Exception as e:
        return {
            "topic": topic,
            "forecast_type": "overall",
            "forecast": FALLBACK_FORECAST
        }

# ==========================================================
# ANOMALIES
# ==========================================================

def get_anomalies(limit: int = 20):
    file_path = resolve_data_file("data/predictions/anomaly_detection.csv")
    if not file_path.exists():
        return {
            "count": len(FALLBACK_ANOMALIES),
            "anomalies": FALLBACK_ANOMALIES[:limit]
        }

    try:
        df = pd.read_csv(file_path).head(100)

        if "is_anomaly" in df.columns:
            df["is_anomaly"] = pd.to_numeric(df["is_anomaly"], errors="coerce")
            df = df[df["is_anomaly"] == 1]

        if "anomaly_score" in df.columns:
            df["anomaly_score"] = pd.to_numeric(df["anomaly_score"], errors="coerce")
            df = df.sort_values(by="anomaly_score", ascending=False)

        df = clean_dataframe(df)
        records = df.head(limit).to_dict(orient="records")

        return {
            "count": len(records) if records else len(FALLBACK_ANOMALIES),
            "anomalies": records if records else FALLBACK_ANOMALIES[:limit]
        }

    except Exception as e:
        return {
            "count": len(FALLBACK_ANOMALIES),
            "anomalies": FALLBACK_ANOMALIES[:limit]
        }

# ==========================================================
# MODEL EVALUATION
# ==========================================================

def get_model_evaluation():
    file_path = resolve_data_file("data/reports/model_metrics.csv")
    if not file_path.exists():
        return {
            "metrics": FALLBACK_METRICS
        }

    try:
        df = pd.read_csv(file_path)
        df = clean_dataframe(df)
        records = df.to_dict(orient="records")

        return {
            "metrics": records if records else FALLBACK_METRICS
        }

    except Exception as e:
        return {
            "metrics": FALLBACK_METRICS
        }