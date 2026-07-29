import pandas as pd 
from sqlalchemy import create_engine 


engine = create_engine("postgresql+psycopg2://postgres:MALI8261@localhost:5432/india_trend_radar")

df = pd.read_csv("data/cleaned/news_clean.csv")

df.to_sql("news_trends",engine,if_exists="replace",index=False)

print("News data loaded successfully!")
print("Total rows loaded:",len(df))