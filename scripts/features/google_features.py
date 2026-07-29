import pandas as pd


def create_google_features(google):

    google["collection_date"] = pd.to_datetime(
        google["collection_date"]
    )


    google_features = google.groupby("keyword").agg(

        latest_interest=("latest_interest","max"),

        num_rising_queries=("rising_queries",
                            "count")

    ).reset_index()


    google_features["interest_normalized"] = (
        google_features["latest_interest"]
        /
        google_features["latest_interest"].max()
    )


    return google_features