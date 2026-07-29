from src.features.news_features import create_news_features
from src.features.google_features import create_google_features
from src.features.youtube_features import create_youtube_features

from src.features.Features_new.feature_engineering import create_features

import pandas as pd


def run_pipeline():

    news = pd.read_csv(
        "data/processed/news_with_ner.csv"
    )

    google = pd.read_csv(
        "data/raw/google_trends.csv"
    )

    youtube = pd.read_csv(
        "data/raw/youtube_trending_rolling30.csv"
    )


    news_features = create_news_features(news)

    google_features = create_google_features(google)

    youtube_features = create_youtube_features(youtube)


    master = create_features(
        news_features,
        google_features,
        youtube_features
    )


    master.to_csv(
        "data/features/master_trend_features.csv",
        index=False
    )


    print("Pipeline completed")


if __name__ == "__main__":
    run_pipeline()