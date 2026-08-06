import os
import joblib
import pandas as pd
from xgboost import XGBClassifier
from prophet import Prophet

FEATURES_PATH = "data/features/master_trend_features.csv"
NON_FEATURE_COLS = ["keyword", "latest_news_time", "latest_video_date", "trend_score", "trend_rank"]

def retrain_models():
    if not os.path.exists(FEATURES_PATH):
        print(f"File not found at {FEATURES_PATH}")
        return

    print("Loading dataset")
    df = pd.read_csv(FEATURES_PATH, encoding="utf-8-sig")

    os.makedirs("models", exist_ok=True)
    os.makedirs("data/predictions", exist_ok=True)

    # ------------------------------------
    #  TARGET LOGIC & XGBOOST
    # ------------------------------------
    print("Processing Target & Retraining XGBoost Virality Classifier")
    
    # Target = Top 20% of trend_score 
    threshold = df["trend_score"].quantile(0.80)
    y = (df["trend_score"] >= threshold).astype(int)

    feature_cols = [c for c in df.columns if c not in NON_FEATURE_COLS]
    X = df[feature_cols].fillna(0)

    # Retrain XGBoost Classifier
    xgb_model = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.1,
        eval_metric="logloss",
        random_state=42
    )
    xgb_model.fit(X, y)

    # Save predictions & model
    df_out = df[["keyword"]].copy() if "keyword" in df.columns else pd.DataFrame(index=df.index)
    df_out["predicted_viral"] = xgb_model.predict(X)
    df_out["viral_probability"] = xgb_model.predict_proba(X)[:, 1]
    df_out.to_csv("data/predictions/virality_predictions.csv", index=False, encoding="utf-8-sig")

    joblib.dump(xgb_model, "models/xgboost_model.pkl")
    print("XGBoost Classifier retrained & saved to 'models/xgboost_model.pkl'")

    # ------------------------------------
    # 2. PROPHET MODEL RETRAINING
    # ------------------------------------
    print("Retraining Prophet Model...")
    date_col = 'latest_news_time' if 'latest_news_time' in df.columns else 'latest_video_date'
    
    if date_col in df.columns:
        prophet_df = df[[date_col, 'trend_score']].copy()
        prophet_df.columns = ['ds', 'y']
        prophet_df['ds'] = pd.to_datetime(prophet_df['ds']).dt.tz_localize(None)
        prophet_df = prophet_df.dropna().sort_values('ds')

        if len(prophet_df) > 0:
            prophet_model = Prophet()
            prophet_model.fit(prophet_df)
            joblib.dump(prophet_model, "models/prophet_model.pkl")
            print("Prophet model retrained & saved to 'models/prophet_model.pkl'")

    print("\nRetraining completed perfectly using Anushka's exact logic!")

if __name__ == "__main__":
    retrain_models()