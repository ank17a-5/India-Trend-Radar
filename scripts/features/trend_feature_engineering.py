import os
import pandas as pd

from scripts.features.news_features import create_news_features
from scripts.features.google_features import create_google_features
from scripts.features.youtube_features import create_youtube_features
from scripts.features.feature_engineering import create_features


def run_trend_feature_engineering():
    """
    Run complete feature engineering pipeline.
    """

    print("Loading datasets...")

    # -------------------------------
    # Load processed datasets
    # -------------------------------

    news = pd.read_csv(
        "data/processed/news_with_topics.csv"
    )

    google = pd.read_csv(
        "data/cleaned/google_trends_clean.csv"
    )

    youtube = pd.read_csv(
        "data/cleaned/youtube_clean.csv"
    )

    # -------------------------------
    # Create platform-wise features
    # -------------------------------

    print("Creating News features...")
    news_features = create_news_features(news)

    print("Creating Google Trends features...")
    google_features = create_google_features(google)

    print("Creating YouTube features...")
    youtube_features = create_youtube_features(youtube)

    # -------------------------------
    # Merge and engineer features
    # -------------------------------

    print("Creating master feature table...")

    master = create_features(
        news_features,
        google_features,
        youtube_features
    )

    # -------------------------------
    # Save output
    # -------------------------------

    output_dir = "data/features"
    os.makedirs(output_dir, exist_ok=True)

    output_file = os.path.join(
        output_dir,
        "master_trend_features.csv"
    )

    master.to_csv(
        output_file,
        index=False
    )

    print(f"\nFeature engineering completed successfully.")
    print(f"Saved to: {output_file}")
    print(f"Total keywords: {len(master)}")


if __name__ == "__main__":
    run_trend_feature_engineering()
    