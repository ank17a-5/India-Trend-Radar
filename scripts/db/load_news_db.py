import os
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine

# Load .env
load_dotenv("config/.env")

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL")

df = pd.read_csv("data/cleaned/news_clean.csv")

engine = create_engine(DATABASE_URL)


df.to_sql("news_trends",engine,if_exists="replace",index=False)


print("News data loaded successfully")
print(f"Total rows loaded:{len(df)}")