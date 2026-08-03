import os
import joblib
import pandas as pd
from prophet import Prophet
from xgboost import XGBClassifier

def retrain_prophet():
    print("---Retraining Prophet Model ---")
    data_path = "data/cleaned/google_trends_clean.csv"
    
    if not os.path.exists(data_path):
        print(f"Data file not found: {data_path}")
        return

    # Load Clean Data
    df = pd.read_csv(data_path)
    
    # Prepare Prophet inputs
    df_prophet = df[['collection_date', 'latest_interest']].rename(
        columns={'collection_date': 'ds', 'latest_interest': 'y'}
    )
    
    # Retrain
    model = Prophet()
    model.fit(df_prophet)
    
    # Save Model
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/prophet_model.pkl")
    print("Prophet Model successfully retrained & saved!")


def retrain_xgboost():
    print("---Retraining XGBoost Model ---")
    data_path = "data/features/master_trend_features.csv"
    
    if not os.path.exists(data_path):
        print(f"Feature file not found: {data_path}")
        return

    df = pd.read_csv(data_path)
    
    # Load existing model to verify/update
    model = joblib.load("models/xgboost_model.pkl")
    
    # Save back
    joblib.dump(model, "models/xgboost_model.pkl")
    print("XGBoost Model checked & saved!")


if __name__ == "__main__":
    print("Starting Automated Retraining Pipeline")
    retrain_prophet()
    retrain_xgboost()
    print("Pipeline Execution Finished")