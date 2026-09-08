import os
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv("config/.env")
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("Error: DATABASE_URL not set in config/.env")
    exit(1)

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

files_to_tables = {
    "data/predictions/india_trend_score.csv": "india_trend_score",
    "data/predictions/prophet_predictions.csv": "prophet_predictions",
    "data/predictions/anomaly_detection.csv": "anomaly_detection",
    "data/reports/model_metrics.csv": "model_metrics",
}

print("Uploading predictions to Neon DB...")
for file_path, table_name in files_to_tables.items():
    if os.path.exists(file_path):
        df = pd.read_csv(file_path)
        df.to_sql(table_name, engine, if_exists="replace", index=False)
        print(f"Uploaded {file_path} -> table '{table_name}' ({len(df)} rows)")
    else:
        print(f"Skipped {file_path} (file not found)")

print("All predictions uploaded successfully to Neon DB!")
