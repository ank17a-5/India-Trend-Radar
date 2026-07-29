import pandas as pd


def create_news_features(news):

    news["published_date"] = pd.to_datetime(
        news["published_date"]
    )

    current_time = pd.Timestamp.now()

    news["news_age_hours"] = (
        current_time - news["published_date"]
    ).dt.total_seconds() / 3600


    news_features = news.groupby("keyword").agg(

        news_count=("title", "count"),

        unique_sources=("source_name", "nunique"),

        avg_news_title_length=("title", 
                               lambda x: x.str.len().mean()),

        avg_description_length=("description",
                                lambda x: x.fillna("").str.len().mean()),

        latest_news_time=("published_date","max"),

        news_age_hours=("news_age_hours","min")

    ).reset_index()


    return news_features