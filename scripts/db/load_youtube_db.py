import pandas as pd
from sqlalchemy import create_engine

# Read cleaned CSV
df = pd.read_csv("data/cleaned/youtube_clean.csv")

# PostgreSQL Connection
engine = create_engine(
    "postgresql+psycopg2://postgres:MALI8261@localhost:5432/india_trend_radar"
)

# Load data
df.to_sql(
    "youtube_trends",
    engine,
    if_exists="replace",
    index=False
)

print("YouTube data loaded successfully!")
print(f"Total rows loaded: {len(df)}")