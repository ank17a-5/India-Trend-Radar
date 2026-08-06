

import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
    roc_auc_score,
    cohen_kappa_score
)

# File Paths

MASTER_FILE = "data/features/master_trend_features.csv"
PROPHET_FILE = "data/predictions/prophet_predictions.csv"
VIRALITY_FILE = "data/predictions/virality_predictions.csv"
ANOMALY_FILE = "data/predictions/anomaly_detection.csv"
INDIA_TREND_FILE = "data/predictions/india_trend_score.csv"

METRICS_FILE = "data/reports/model_metrics.csv"


# Load Data

def load_data():
    master = pd.read_csv(MASTER_FILE)
    prophet = pd.read_csv(PROPHET_FILE)
    virality = pd.read_csv(VIRALITY_FILE)
    anomaly = pd.read_csv(ANOMALY_FILE)
    india = pd.read_csv(INDIA_TREND_FILE)

    return master, prophet, virality, anomaly, india


# 1. Prophet Forecast Evaluation

def evaluate_prophet(prophet):
    print("\n[1] Prophet Forecast Evaluation")

    metrics = []

    prophet["ci_width"] = prophet["yhat_upper"] - prophet["yhat_lower"]

    forecast_count = len(prophet)
    avg_forecast = prophet["yhat"].mean()
    min_forecast = prophet["yhat"].min()
    max_forecast = prophet["yhat"].max()
    std_forecast = prophet["yhat"].std()
    avg_ci_width = prophet["ci_width"].mean()

    print(f"Forecast Count              : {forecast_count}")
    print(f"Average Forecast            : {avg_forecast:.4f}")
    print(f"Minimum Forecast            : {min_forecast:.4f}")
    print(f"Maximum Forecast            : {max_forecast:.4f}")
    print(f"Forecast Std Dev            : {std_forecast:.4f}")
    print(f"Average Confidence Width    : {avg_ci_width:.4f}")

    metrics.append(("Prophet Forecast", "Forecast Count", forecast_count))
    metrics.append(("Prophet Forecast", "Average Forecast", avg_forecast))
    metrics.append(("Prophet Forecast", "Minimum Forecast", min_forecast))
    metrics.append(("Prophet Forecast", "Maximum Forecast", max_forecast))
    metrics.append(("Prophet Forecast", "Forecast Std Dev", std_forecast))
    metrics.append(("Prophet Forecast", "Average Confidence Width", avg_ci_width))

    return metrics


# 2. Virality Model Evaluation

def evaluate_virality(master, virality):
    print("\n[2] Virality Model Evaluation")

    metrics = []

    merged = master.merge(virality, on="keyword")

    y_true = merged["viral_video"]
    y_pred = merged["predicted_viral"]

    acc = accuracy_score(y_true, y_pred)
    pre = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)

    print(f"Accuracy      : {acc:.4f}")
    print(f"Precision     : {pre:.4f}")
    print(f"Recall        : {rec:.4f}")
    print(f"F1 Score      : {f1:.4f}")

    metrics.append(("Virality Model", "Accuracy", acc))
    metrics.append(("Virality Model", "Precision", pre))
    metrics.append(("Virality Model", "Recall", rec))
    metrics.append(("Virality Model", "F1 Score", f1))


    print("\nClassification Report")
    print(classification_report(y_true, y_pred, zero_division=0))

    cm = confusion_matrix(y_true, y_pred)
    print("Confusion Matrix")
    print(cm)

    metrics.append(("Virality Model", "Confusion Matrix", cm.tolist()))

    return metrics


# 3. Anomaly Detection Evaluation

def evaluate_anomaly(anomaly):
    print("\n[3] Anomaly Detection Evaluation")

    metrics = []

    iso = anomaly["iso_anomaly"]
    final = anomaly["is_anomaly"]

    acc = accuracy_score(final, iso)
    pre = precision_score(final, iso, zero_division=0)
    rec = recall_score(final, iso, zero_division=0)
    f1 = f1_score(final, iso, zero_division=0)

    print("Isolation Forest vs Final Decision")
    print(f"Accuracy      : {acc:.4f}")
    print(f"Precision     : {pre:.4f}")
    print(f"Recall        : {rec:.4f}")
    print(f"F1 Score      : {f1:.4f}")

    metrics.append(("Anomaly Detection (Isolation Forest vs Final)", "Accuracy", acc))
    metrics.append(("Anomaly Detection (Isolation Forest vs Final)", "Precision", pre))
    metrics.append(("Anomaly Detection (Isolation Forest vs Final)", "Recall", rec))
    metrics.append(("Anomaly Detection (Isolation Forest vs Final)", "F1 Score", f1))

    z = anomaly["z_anomaly"]

    acc = accuracy_score(final, z)
    pre = precision_score(final, z, zero_division=0)
    rec = recall_score(final, z, zero_division=0)
    f1 = f1_score(final, z, zero_division=0)

    print("\nZ-Score vs Final Decision")
    print(f"Accuracy      : {acc:.4f}")
    print(f"Precision     : {pre:.4f}")
    print(f"Recall        : {rec:.4f}")
    print(f"F1 Score      : {f1:.4f}")

    metrics.append(("Anomaly Detection (Z-Score vs Final)", "Accuracy", acc))
    metrics.append(("Anomaly Detection (Z-Score vs Final)", "Precision", pre))
    metrics.append(("Anomaly Detection (Z-Score vs Final)", "Recall", rec))
    metrics.append(("Anomaly Detection (Z-Score vs Final)", "F1 Score", f1))

    return metrics


# 4. India Trend Score

def evaluate_india_trend(india):
    metrics = []

    if india is not None:
        print("\n[4] India Trend Score")

        print(india.describe())

        numeric = india.select_dtypes(include=np.number)

        print("\nCorrelation Matrix")
        print(numeric.corr())

        metrics.append(("India Trend Score", "Describe", india.describe().to_dict()))
        metrics.append(("India Trend Score", "Correlation Matrix", numeric.corr().to_dict()))

    return metrics


# Save Metrics to CSV

def save_metrics(metrics_records):

    os.makedirs("data/reports", exist_ok=True)


    metrics_df = pd.DataFrame(metrics_records, columns=["section", "metric", "value"])
    metrics_df.to_csv(METRICS_FILE, index=False, encoding="utf-8-sig")

# Main-

def run():
    print("=" * 70)
    print("MODEL EVALUATION REPORT")
    print("=" * 70)

    master, prophet, virality, anomaly, india = load_data()

    metrics_records = []
    metrics_records += evaluate_prophet(prophet)
    metrics_records += evaluate_virality(master, virality)
    metrics_records += evaluate_anomaly(anomaly)
    metrics_records += evaluate_india_trend(india)

    save_metrics(metrics_records)

    print("\n" + "=" * 70)
    print("Evaluation completed successfully.")
    print("=" * 70)


if __name__ == "__main__":
    run()
