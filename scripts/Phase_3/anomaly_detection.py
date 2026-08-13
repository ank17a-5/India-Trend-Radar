

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

# ------------------------------------------------------------------
# CONFIG
# ------------------------------------------------------------------
INPUT_PATH = "data/features/master_trend_features.csv"
OUTPUT_PATH = "data/predictions/anomaly_detection.csv"

# Numeric signal columns used for anomaly detection
# (keyword / date columns are excluded, binary flags excluded)
FEATURE_COLUMNS = [
    "news_count",
    "unique_sources",
    "avg_news_title_length",
    "avg_description_length",
    "news_age_hours",
    "latest_interest",
    "num_rising_queries",
    "interest_normalized",
    "video_count",
    "avg_views",
    "total_views",
    "avg_likes",
    "avg_comments",
    "avg_engagement_rate",
    "news_score",
    "google_score",
    "youtube_score",
    "attention_score",
    "trend_score",
]

# Isolation Forest settings
CONTAMINATION = 0.05      # assume ~5% of rows are anomalies (tune as needed)
RANDOM_STATE = 42

# Z-Score threshold: values beyond +/- this many std deviations are flagged
Z_THRESHOLD = 3.0


# ------------------------------------------------------------------
# STEP 1: Load data
# ------------------------------------------------------------------
def load_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    print(f"Loaded {df.shape[0]} rows, {df.shape[1]} columns from {path}")
    return df


# ------------------------------------------------------------------
# STEP 2: Prepare features (handle missing values, scale)
# ------------------------------------------------------------------
def prepare_features(df: pd.DataFrame, feature_cols: list) -> pd.DataFrame:
    features = df[feature_cols].copy()
    # Fill missing numeric values with 0 (no signal on that platform)
    features = features.fillna(0)
    return features


# ------------------------------------------------------------------
# STEP 3: Isolation Forest anomaly detection
# ------------------------------------------------------------------
def run_isolation_forest(features: pd.DataFrame) -> pd.DataFrame:
    scaler = StandardScaler()
    scaled = scaler.fit_transform(features)

    model = IsolationForest(
        contamination=CONTAMINATION,
        random_state=RANDOM_STATE,
        n_estimators=200,
    )
    model.fit(scaled)

    # decision_function: higher = more normal, lower/negative = more anomalous
    iso_score = model.decision_function(scaled)
    # predict: -1 = anomaly, 1 = normal
    iso_pred = model.predict(scaled)

    result = pd.DataFrame({
        "iso_score": iso_score,
        "iso_anomaly": np.where(iso_pred == -1, 1, 0),
    })
    return result


# ------------------------------------------------------------------
# STEP 4: Z-Score anomaly detection
# ------------------------------------------------------------------
def run_zscore(features: pd.DataFrame) -> pd.DataFrame:
    mean = features.mean()
    std = features.std().replace(0, 1)  # avoid divide-by-zero for constant cols

    z_scores = (features - mean) / std
    max_abs_z = z_scores.abs().max(axis=1)

    result = pd.DataFrame({
        "z_score_max": max_abs_z,
        "z_anomaly": np.where(max_abs_z > Z_THRESHOLD, 1, 0),
    })
    return result


# ------------------------------------------------------------------
# STEP 5: Combine both methods into a final anomaly label/score
# ------------------------------------------------------------------
def combine_results(df: pd.DataFrame, iso_df: pd.DataFrame, z_df: pd.DataFrame) -> pd.DataFrame:
    combined = pd.concat([df.reset_index(drop=True), iso_df, z_df], axis=1)

    # Flag as anomaly if EITHER method flags it
    combined["is_anomaly"] = np.where(
        (combined["iso_anomaly"] == 1) | (combined["z_anomaly"] == 1), 1, 0
    )

    # Combined anomaly score (normalized 0-1, higher = more anomalous)
    iso_norm = (combined["iso_score"].max() - combined["iso_score"]) / (
        combined["iso_score"].max() - combined["iso_score"].min() + 1e-9
    )
    z_norm = (combined["z_score_max"] - combined["z_score_max"].min()) / (
        combined["z_score_max"].max() - combined["z_score_max"].min() + 1e-9
    )
    combined["anomaly_score"] = (iso_norm + z_norm) / 2

    return combined


# ------------------------------------------------------------------
# STEP 6: Validate results (quick sanity checks)
# ------------------------------------------------------------------
def validate(df: pd.DataFrame):
    total = len(df)
    n_anomalies = df["is_anomaly"].sum()
    print(f"Total rows: {total}")
    print(f"Flagged anomalies: {n_anomalies} ({n_anomalies / total * 100:.2f}%)")
    print("\nTop 5 anomalies by anomaly_score:")
    cols_to_show = ["keyword", "trend_score", "iso_score", "z_score_max", "anomaly_score"]
    cols_to_show = [c for c in cols_to_show if c in df.columns]
    print(df.sort_values("anomaly_score", ascending=False)[cols_to_show].head())


# ------------------------------------------------------------------
# STEP 7: Export final output
# ------------------------------------------------------------------
def export(df: pd.DataFrame, path: str):
    output_cols = [
        "keyword",
        "trend_score",
        "trend_rank",
        "iso_score",
        "iso_anomaly",
        "z_score_max",
        "z_anomaly",
        "is_anomaly",
        "anomaly_score",
    ]
    output_cols = [c for c in output_cols if c in df.columns]
    df[output_cols].to_csv(path, index=False)
    print(f"\nSaved anomaly detection output to {path}")


# ------------------------------------------------------------------
# MAIN
# ------------------------------------------------------------------
def run():
    df = load_data(INPUT_PATH)
    features = prepare_features(df, FEATURE_COLUMNS)

    iso_df = run_isolation_forest(features)
    z_df = run_zscore(features)

    combined = combine_results(df, iso_df, z_df)
    validate(combined)
    export(combined, OUTPUT_PATH)


if __name__ == "__main__":
    run()
