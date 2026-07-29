from collectors.news_collector import collect_news
from collectors.google_collector import collect_google
from collectors.youtube_collector import collect_youtube

from preprocessing.cleaner import clean_data

from features.feature_engineering import create_features

from ranking.trend_score import calculate_score


def run_pipeline():

    print("Collecting data...")

    news = collect_news()
    google = collect_google()
    youtube = collect_youtube()


    print("Cleaning data...")

    news = clean_data(news)


    print("Creating features...")

    master_features = create_features(
        news,
        google,
        youtube
    )


    print("Ranking trends...")

    ranked = calculate_score(master_features)


    ranked.to_csv(
        "data/rankings/trend_rankings.csv",
        index=False
    )


    print("Pipeline completed")


if __name__ == "__main__":
    run_pipeline()