import os
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine

# Load .env
load_dotenv("config/.env")

DATABASE_URL = os.getenv("DATABASE_URL")

print("Connected to:")
print(DATABASE_URL)

# Read cleaned CSV
df = pd.read_csv("data/cleaned/youtube_clean.csv")

# Create connection
engine = create_engine(DATABASE_URL)

# Upload to Neon
df.to_sql(
    "youtube_trends",
    engine,
    if_exists="replace",
    index=False
)

print("✅ YouTube uploaded to Neon")
print(f"Rows: {len(df)}")