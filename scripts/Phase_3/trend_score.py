import os
import pandas as pd
from datetime import datetime

# ==========================================================
# Configuration
# ==========================================================

MASTER_FILE = "data/features/master_trend_features.csv"

PROPHET_FILE = "data/predictions/prophet_predictions.csv"

VIRALITY_FILE = "data/predictions/virality_predictions.csv"

ANOMALY_FILE = "data/predictions/anomaly_detection.csv"

OUTPUT_FILE = "data/predictions/india_trend_score.csv"


# ==========================================================
# Load Data
# ==========================================================

def load_data():

    print("Loading datasets...")

    master = pd.read_csv(MASTER_FILE)
    master.columns = master.columns.str.strip()

    prophet = pd.read_csv(PROPHET_FILE)
    prophet.columns = prophet.columns.str.strip()

    virality = pd.read_csv(VIRALITY_FILE)
    virality.columns = virality.columns.str.strip()

    anomaly = pd.read_csv(ANOMALY_FILE)
    anomaly.columns = anomaly.columns.str.strip()

    return master, prophet, virality, anomaly

# ==========================================================
# Merge Predictions
# ==========================================================

def clean_keyword(series):

    return (
        series.astype(str)
        .str.lower()
        .str.strip()
        .str.replace('"', '', regex=False)
        .str.replace(r"\s*\|\s*", "|", regex=True)
        .str.replace(r"\s*,\s*", ",", regex=True)
        .str.replace(r"\s+", " ", regex=True)
    )


def merge_predictions(master, prophet, virality, anomaly):

    print("Merging prediction files...")

    # ------------------------------------------------------
    # Clean Column Names
    # ------------------------------------------------------

    master.columns = master.columns.str.strip()
    prophet.columns = prophet.columns.str.strip()
    virality.columns = virality.columns.str.strip()
    anomaly.columns = anomaly.columns.str.strip()

    # ------------------------------------------------------
    # Clean Keywords
    # ------------------------------------------------------

    master["keyword"] = clean_keyword(master["keyword"])
    virality["keyword"] = clean_keyword(virality["keyword"])
    anomaly["keyword"] = clean_keyword(anomaly["keyword"])

    # ------------------------------------------------------
    # Prophet Forecast
    # ------------------------------------------------------

    latest_forecast = prophet["yhat"].iloc[-1]

    master["forecast_score"] = latest_forecast

    # Prediction date (when pipeline runs)
    master["prediction_date"] = datetime.now().strftime("%Y-%m-%d")


    # Forecasting date (future date from Prophet)
    if "forecasting_date" in prophet.columns:
        master["forecasting_date"] = prophet["forecasting_date"].iloc[-1]

    elif "ds" in prophet.columns:
        master["forecasting_date"] = prophet["ds"].iloc[-1]

    else:
        master["forecasting_date"] = None

    # ------------------------------------------------------
    # Merge Virality
    # ------------------------------------------------------

    master = master.merge(
        virality[
            [
                "keyword",
                "predicted_viral",
                "viral_probability"
            ]
        ],
        on="keyword",
        how="left"
    )

    # ------------------------------------------------------
    # Merge Anomaly
    # ------------------------------------------------------

    anomaly = anomaly.rename(
        columns={
            "trend_score": "anomaly_trend_score"
        }
    )

    master = master.merge(
        anomaly[
            [
                "keyword",
                "is_anomaly",
                "anomaly_score"
            ]
        ],
        on="keyword",
        how="left"
    )

    # ------------------------------------------------------
    # Fill Missing Values
    # ------------------------------------------------------

    master["predicted_viral"] = (
        master["predicted_viral"]
        .fillna(0)
        .astype(int)
    )

    master["viral_probability"] = (
        master["viral_probability"]
        .fillna(0)
    )

    master["is_anomaly"] = (
        master["is_anomaly"]
        .fillna(0)
        .astype(int)
    )

    master["anomaly_score"] = (
        master["anomaly_score"]
        .fillna(0)
    )

    # ------------------------------------------------------
    # Debug Summary
    # ------------------------------------------------------

    print("\n" + "=" * 60)
    print("MERGE SUMMARY")
    print("=" * 60)

    print(f"Master Rows      : {len(master)}")
    print(f"Virality Rows    : {len(virality)}")
    print(f"Anomaly Rows     : {len(anomaly)}")

    print(
        f"Virality Matches : "
        f"{master['predicted_viral'].notna().sum()}"
    )

    print(
        f"Anomaly Matches  : "
        f"{master['is_anomaly'].notna().sum()}"
    )

    print("=" * 60)

    return master

# ==========================================================
# Compute India Trend Score
# ==========================================================

def compute_trend_score(df):

    print("Computing India Trend Score...")

    df["india_trend_score"] = (
    0.40 * df["google_score"] +
    0.25 * df["news_score"] +
    0.20 * df["youtube_score"] +
    0.05 * df["forecast_score"] +      # Overall trend signal
    0.05 * df["viral_probability"] +
    0.05 * df["anomaly_score"]
    )

    df["india_trend_score"] = df["india_trend_score"].round(4)

    df = df.sort_values(
        by="india_trend_score",
        ascending=False
    ).reset_index(drop=True)

    df["trend_rank"] = df.index + 1

    return df


# ==========================================================
# Save Results
# ==========================================================

def save_results(df):

    os.makedirs(
        "data/predictions",
        exist_ok=True
    )

    output = df[
        [
            "keyword",
            "prediction_date",
            "forecasting_date",
            "forecast_score",
            "predicted_viral",
            "viral_probability",
            "is_anomaly",
            "anomaly_score",
            "india_trend_score",
            "trend_rank"
        ]
    ]

    output.to_csv(
        OUTPUT_FILE,
        index=False,
        encoding="utf-8-sig"

    )

    print("=" * 60)
    print("Results saved successfully")
    print(f"Output File : {OUTPUT_FILE}")
    print(f"Total Rows  : {len(output)}")
    print("=" * 60)

    # Debug Information
    print("\nMerge Summary")
    print("-" * 30)
    print("Virality Matches :", output["predicted_viral"].notna().sum())
    print("Anomaly Matches  :", output["is_anomaly"].notna().sum())
    print("-" * 30)


# ==========================================================
# Main
# ==========================================================

def run():

    print("=" * 60)
    print("INDIA TREND SCORE PIPELINE")
    print("=" * 60)

    master, prophet, virality, anomaly = load_data()

    master = merge_predictions(
        master,
        prophet,
        virality,
        anomaly
    )

    master = compute_trend_score(master)

    save_results(master)

    print("=" * 60)
    print("Pipeline Completed Successfully")
    print("=" * 60)


# ==========================================================
# Run
# ==========================================================

if __name__ == "__main__":
    run()
