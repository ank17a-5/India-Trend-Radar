from scripts.features.news_features import create_news_features
from scripts.features.google_features import create_google_features
from scripts.features.youtube_features import create_youtube_features

from scripts.features.feature_engineering import create_features

import pandas as pd


def run_pipeline():

    news = pd.read_csv(
        "data/processed/news_with_topics.csv"
    )

    google = pd.read_csv(
        "data/cleaned/google_trends_clean.csv"
    )

    youtube = pd.read_csv(
        "data/cleaned/youtube_clean.csv"
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