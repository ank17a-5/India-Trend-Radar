import os
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine

# Load .env
load_dotenv("config/.env")

DATABASE_URL = os.getenv("DATABASE_URL")

print("Connected to:")
print(DATABASE_URL)

# Read CSV
df = pd.read_csv("data/cleaned/google_trends_clean.csv")

# Neon connection
engine = create_engine(DATABASE_URL)

# Upload
df.to_sql(
    "google_trends",
    engine,
    if_exists="replace",
    index=False
)

print("Google Trends uploaded to Neon")
print(f"Rows: {len(df)}")