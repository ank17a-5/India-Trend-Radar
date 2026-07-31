"""
scripts/Phase_3/xgboost_classifier.py
---------------------------
Member 2 (Anushka) — Phase 3: XGBoost Virality Classifier

Trains an XGBoost binary classifier to predict whether a topic is likely
to go viral, using engineered features from data/features/master_trend_features.csv.

⚠️ PLACEHOLDER LABEL — READ BEFORE USING FOR REAL SUBMISSION ⚠️
This file currently has no explicit "did this topic actually go viral"
column. Until Ankita confirms the real label definition, this script
defines "viral" as: trend_score in the top 20% of all rows (see
PLACEHOLDER_LABEL_QUANTILE below). Search for "PLACEHOLDER" to find and
replace this once the real definition is confirmed.

Run from the repo root:
    python -m scripts.Phase_3.xgboost_classifier
"""

import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from xgboost import XGBClassifier

from utils.utils import logger

FEATURES_PATH = "data/features/master_trend_features.csv"
PREDICTIONS_DIR = "data/predictions"
PREDICTIONS_PATH = os.path.join(PREDICTIONS_DIR, "virality_predictions.csv")
MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "xgboost_model.pkl")

# ⚠️ PLACEHOLDER — replace once Ankita confirms the real definition of "viral"
PLACEHOLDER_LABEL_QUANTILE = 0.80  # top 20% of trend_score = "viral" (label=1)

# Columns that either identify the row, would leak the label, or are
# non-numeric text/dates unusable directly by the model.
NON_FEATURE_COLS = [
    "keyword", "latest_news_time", "latest_video_date",
    "trend_score", "trend_rank",  # these define the placeholder label — must be excluded to avoid leakage
]


def load_features(path: str = FEATURES_PATH) -> pd.DataFrame:
    """Load the engineered trend features."""
    df = pd.read_csv(path, encoding="utf-8-sig")
    logger.info(f"Loaded {len(df)} rows from {path}")
    return df


def build_label(df: pd.DataFrame) -> pd.Series:
    """
    ⚠️ PLACEHOLDER LABEL LOGIC.
    Defines "viral" as being in the top X% of trend_score.
    Replace this function once the real definition is confirmed —
    e.g. if a ground-truth outcome column becomes available instead.
    """
    threshold = df["trend_score"].quantile(PLACEHOLDER_LABEL_QUANTILE)
    label = (df["trend_score"] >= threshold).astype(int)
    logger.warning(
        f"Using PLACEHOLDER label (trend_score >= {threshold:.4f} = viral). "
        f"Confirm real label definition with Ankita before final submission."
    )
    return label


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """Select numeric feature columns, excluding identifiers and label sources."""
    feature_cols = [c for c in df.columns if c not in NON_FEATURE_COLS]
    X = df[feature_cols].copy()
    X = X.fillna(0)
    return X


def run():
    logger.info("XGBoost virality classifier — training started")

    df = load_features()

    y = build_label(df)
    X = build_features(df)

    X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
        X, y, df.index, test_size=0.2, random_state=42, stratify=y
    )
    logger.info(f"Train size: {len(X_train)}, Test size: {len(X_test)}")

    model = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.1,
        eval_metric="logloss",
        random_state=42,
    )
    model.fit(X_train, y_train)

    preds_test = model.predict(X_test)
    acc = accuracy_score(y_test, preds_test)
    logger.info(f"Test accuracy: {acc:.4f}")
    logger.info("\n" + classification_report(y_test, preds_test))

    # Generate predictions for the full dataset (not just the test split)
    full_preds = model.predict(X)
    full_probs = model.predict_proba(X)[:, 1]

    df_out = df[["keyword"]].copy() if "keyword" in df.columns else pd.DataFrame(index=df.index)
    df_out["predicted_viral"] = full_preds
    df_out["viral_probability"] = full_probs

    os.makedirs(PREDICTIONS_DIR, exist_ok=True)
    df_out.to_csv(PREDICTIONS_PATH, index=False, encoding="utf-8-sig")
    logger.info(f"Predictions saved: {PREDICTIONS_PATH} ({len(df_out)} rows)")

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    logger.info(f"Model saved: {MODEL_PATH}")

    logger.info("XGBoost virality classifier — completed")


if __name__ == "__main__":
    run()
