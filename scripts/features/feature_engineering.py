import pandas as pd
import numpy as np


# -------------------------------------------------
# 1. Remove duplicate keywords
# -------------------------------------------------

def remove_duplicates(
        news_features,
        google_features,
        youtube_features
):

    news_features = news_features.drop_duplicates(
        "keyword"
    )

    google_features = google_features.drop_duplicates(
        "keyword"
    )

    youtube_features = youtube_features.drop_duplicates(
        "keyword"
    )

    return (
        news_features,
        google_features,
        youtube_features
    )


# -------------------------------------------------
# 2. Merge News + Google + YouTube
# -------------------------------------------------

def merge_platform_features(
        news_features,
        google_features,
        youtube_features
):

    master = pd.merge(
        news_features,
        google_features,
        on="keyword",
        how="outer"
    )


    master = pd.merge(
        master,
        youtube_features,
        on="keyword",
        how="outer"
    )


    return master


# -------------------------------------------------
# 3. Create platform presence features
# -------------------------------------------------

def create_platform_features(master):

    master["has_news"] = (
        master["news_count"]
        .notna()
        .astype(int)
    )


    master["has_google"] = (
        master["latest_interest"]
        .notna()
        .astype(int)
    )


    master["has_youtube"] = (
        master["video_count"]
        .notna()
        .astype(int)
    )


    master["platform_count"] = (
        master["has_news"]
        +
        master["has_google"]
        +
        master["has_youtube"]
    )


    return master


# -------------------------------------------------
# 4. Create trend indicators
# -------------------------------------------------

def create_trend_indicators(master):

    # Fresh news indicator

    master["fresh_news"] = (
        master["news_age_hours"]
        .fillna(float("inf")) < 24
    ).astype(int)


    # High Google interest

    if "interest_normalized" in master.columns:

        master["high_google_interest"] = (
            master["interest_normalized"]
            > 0.7
        ).astype(int)


    # Viral video indicator

    if "avg_engagement_rate" in master.columns:

        master["viral_video"] = (
            master["avg_engagement_rate"]
            > master["avg_engagement_rate"]
            .median()
        ).astype(int)


    return master


# -------------------------------------------------
# 5. Create scoring features
# -------------------------------------------------

def create_scores(master):

    # News score

    master["news_score"] = (
    master["news_count"].fillna(0) /
    master["news_count"].fillna(0).max()
    +
    master["unique_sources"].fillna(0) /
    master["unique_sources"].fillna(0).max()
    )   


    # Google score

    master["google_score"] = (
    master["latest_interest"].fillna(0) /
    master["latest_interest"].fillna(0).max()
    +
    master["num_rising_queries"].fillna(0) /
    master["num_rising_queries"].fillna(0).max()
    )


    # YouTube score

    master["youtube_score"] = (
        master["video_count"]
        .fillna(0)
        +
        master["avg_engagement_rate"]
        .fillna(0)
    )


    return master


# -------------------------------------------------
# 6. Final Trend Score
# -------------------------------------------------

def create_trend_ranking(master):

    master["attention_score"] = (
        master["news_score"]
        +
        master["google_score"]
        +
        master["youtube_score"]
    )


    master["trend_score"] = (
        0.3 * master["news_score"]
        +
        0.4 * master["google_score"]
        +
        0.3 * master["youtube_score"]
    )


    master["trend_rank"] = (
        master["trend_score"]
        .rank(
            ascending=False,
            method="dense"
        )
        .astype(int)
    )


    return master



# -------------------------------------------------
# MASTER FEATURE ENGINEERING FUNCTION
# -------------------------------------------------

def create_features(
        news_features,
        google_features,
        youtube_features
):

    news_features, google_features, youtube_features = remove_duplicates(
        news_features,
        google_features,
        youtube_features
    )


    master = merge_platform_features(
        news_features,
        google_features,
        youtube_features
    )


    master = create_platform_features(master)


    master = create_trend_indicators(master)


    master = create_scores(master)


    master = create_trend_ranking(master)


    return master