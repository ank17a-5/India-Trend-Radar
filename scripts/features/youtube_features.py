import pandas as pd


def create_youtube_features(youtube):

    youtube_features = youtube.groupby("keyword").agg(

        video_count=("video_id","count"),

        avg_views=("views","mean"),

        total_views=("views","sum"),

        avg_likes=("likes","mean"),

        avg_comments=("comments","mean"),

        latest_video_date=("published_at","max")

    ).reset_index()


    youtube_features["avg_engagement_rate"] = (
        (
            youtube_features["avg_likes"]
            +
            youtube_features["avg_comments"]
        )
        /
        youtube_features["avg_views"]
    )


    return youtube_features