import os
import joblib
import pandas as pd
from prophet import Prophet


# ==========================================================
# Configuration
# ==========================================================

INPUT_FILE = "../../data/features/master_trend_features.csv"

PREDICTIONS_FILE = "../../data/predictions/prophet_predictions.csv"

MODEL_FILE = "../../models/prophet_model.pkl"


# ==========================================================
# Load Dataset
# ==========================================================

def load_data():

    print("Loading cleaned dataset...")

    df = pd.read_csv(INPUT_FILE)

    return df


# ==========================================================
# Prepare Prophet Dataset
# ==========================================================

def prepare_prophet_dataset(df):

    print("Preparing Prophet dataset...")

    # Convert to datetime
    df["latest_news_time"] = pd.to_datetime(
        df["latest_news_time"],
        errors="coerce"
    )

    # Remove missing dates
    df = df.dropna(subset=["latest_news_time"])

    # Aggregate daily trend score
    prophet_df = (
        df.groupby(df["latest_news_time"].dt.date)["trend_score"]
        .mean()
        .reset_index()
    )

    prophet_df.columns = ["ds", "y"]

    prophet_df["ds"] = pd.to_datetime(prophet_df["ds"])

    # Fill missing calendar dates
    prophet_df = (
        prophet_df
        .set_index("ds")
        .asfreq("D")
        .reset_index()
    )

    prophet_df["y"] = (
        prophet_df["y"]
        .interpolate(method="linear")
    )

    print(f"Training Days : {len(prophet_df)}")

    return prophet_df


# ==========================================================
# Train Prophet
# ==========================================================

def train_model(prophet_df):

    print("Training Prophet model...")

    model = Prophet(
        yearly_seasonality=False,
        weekly_seasonality=True,
        daily_seasonality=False
    )

    model.fit(prophet_df)

    print("Model training completed.")

    return model


# ==========================================================
# Forecast
# ==========================================================

def forecast(model):

    print("Generating 30-day forecast...")

    future = model.make_future_dataframe(
        periods=30,
        freq="D"
    )

    forecast = model.predict(future)

    return forecast


# ==========================================================
# Save Predictions
# ==========================================================

def save_predictions(forecast):

    os.makedirs(
        "../../data/predictions",
        exist_ok=True
    )

    prophet_predictions = forecast[
        [
            "ds",
            "yhat",
            "yhat_lower",
            "yhat_upper"
        ]
    ].tail(30)

    prophet_predictions.to_csv(
        PREDICTIONS_FILE,
        index=False
    )

    print(f"Predictions saved to:\n{PREDICTIONS_FILE}")


# ==========================================================
# Save Model
# ==========================================================

def save_model(model):

    os.makedirs(
        "../../models",
        exist_ok=True
    )

    joblib.dump(
        model,
        MODEL_FILE
    )

    print(f"Model saved to:\n{MODEL_FILE}")


# ==========================================================
# Main Pipeline
# ==========================================================

def run():

    print("=" * 60)
    print("PROPHET FORECASTING PIPELINE")
    print("=" * 60)

    df = load_data()

    prophet_df = prepare_prophet_dataset(df)

    model = train_model(prophet_df)

    forecast_df = forecast(model)

    save_predictions(forecast_df)

    save_model(model)

    print("=" * 60)
    print("Pipeline Completed Successfully")
    print("=" * 60)


# ==========================================================
# Run
# ==========================================================

if __name__ == "__main__":
    run()
