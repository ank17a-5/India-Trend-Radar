import pandas as pd
from pathlib import Path


# ==========================================================
# PROJECT ROOT
# ==========================================================

SCRIPT_DIR = Path(__file__).resolve().parent

PROJECT_ROOT = (
    Path.cwd()
    if (Path.cwd() / "data").exists()
    else SCRIPT_DIR.parents[2]
)


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

    # Replace NaN / NaT with None
    df = df.where(pd.notna(df), None)

    return df


# ==========================================================
# RISING TRENDS
# ==========================================================

def get_rising_trends():
    if not TREND_FILE.exists():
        return []

    try:
        df = pd.read_csv(TREND_FILE)
        df = df.where(pd.notnull(df), None)

        # Prediction date = today's date
        prediction_date = pd.Timestamp.today().strftime("%Y-%m-%d")

        # Forecasting date from Prophet forecast file
        forecasting_date = prediction_date

        if FORECAST_FILE.exists():
            forecast_df = pd.read_csv(FORECAST_FILE)

            if "ds" in forecast_df.columns:
                forecast_df["ds"] = pd.to_datetime(
                    forecast_df["ds"],
                    errors="coerce"
                )

                forecast_df = forecast_df.dropna(subset=["ds"])

                if not forecast_df.empty:
                    forecasting_date = (
                        forecast_df["ds"].max().strftime("%Y-%m-%d")
                    )

        # Add dates to API response
        df["prediction_date"] = prediction_date
        df["forecasting_date"] = forecasting_date

        # Sort by trend rank
        if "trend_rank" in df.columns:
            df = df.sort_values(by="trend_rank")

        return df.head(10).to_dict(orient="records")

    except Exception as e:
        print("Rising trends error:", e)
        return []


# ==========================================================
# TOP NICHES
# ==========================================================

def get_top_niches():

    if not TREND_FILE.exists():
        return []

    try:

        df = pd.read_csv(TREND_FILE)

        df = clean_dataframe(df)

        # Sort by India Trend Score
        if "india_trend_score" in df.columns:

            df["india_trend_score"] = pd.to_numeric(
                df["india_trend_score"],
                errors="coerce"
            )

            df = df.sort_values(
                by="india_trend_score",
                ascending=False
            )

        columns = [
            "keyword",
            "india_trend_score",
            "viral_probability",
            "trend_rank"
        ]

        available_columns = [
            col for col in columns
            if col in df.columns
        ]

        if available_columns:
            df = df[available_columns]

        return df.head(10).to_dict(
            orient="records"
        )

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

        df = pd.read_csv(FORECAST_FILE)

        df = clean_dataframe(df)

        # Prophet currently produces OVERALL trend forecast.
        # There is no keyword column in prophet_predictions.csv.
        #
        # Therefore we DO NOT filter by topic here.

        columns = [
            "ds",
            "yhat",
            "yhat_lower",
            "yhat_upper"
        ]

        available_columns = [
            col for col in columns
            if col in df.columns
        ]

        if available_columns:
            df = df[available_columns]

        return {
            "topic": topic,
            "forecast_type": "overall",
            "forecast": df.to_dict(
                orient="records"
            )
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

        df = pd.read_csv(ANOMALY_FILE)

        df = clean_dataframe(df)

        # Keep only detected anomalies
        if "is_anomaly" in df.columns:

            df["is_anomaly"] = pd.to_numeric(
                df["is_anomaly"],
                errors="coerce"
            )

            df = df[
                df["is_anomaly"] == 1
            ]

        # Highest anomaly score first
        if "anomaly_score" in df.columns:

            df["anomaly_score"] = pd.to_numeric(
                df["anomaly_score"],
                errors="coerce"
            )

            df = df.sort_values(
                by="anomaly_score",
                ascending=False
            )

        return {
            "count": len(df),
            "anomalies": df.head(limit).to_dict(
                orient="records"
            )
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
            "metrics": df.to_dict(
                orient="records"
            )
        }

    except Exception as e:

        return {
            "metrics": [],
            "error": str(e)
        }
