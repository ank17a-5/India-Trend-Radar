import pandas as pd


def clean_youtube_data():

    print("Loading YouTube data...")

    df = pd.read_csv("data/raw/youtube_trending_rolling30.csv")

    # Standardize column names
    df.columns = df.columns.str.strip().str.lower()

    # Remove duplicate videos
    df = df.drop_duplicates(subset=["video_id"])

    # Clean text columns
    df["title"] = df["title"].str.strip()
    df["channel_name"] = df["channel_name"].str.strip()
    df["tags"] = df["tags"].fillna("No Tags").str.strip()

    # Convert publish date
    df["published_at"] = pd.to_datetime(df["published_at"])

    # Convert numeric columns
    numeric_cols = ["views", "likes", "comments"]

    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)

    # Remove invalid URLs
    df = df[df["video_url"].str.startswith("http", na=False)]

    # Save cleaned dataset
    df.to_csv(
        "data/cleaned/youtube_clean.csv",
        index=False
    )

    print("YouTube cleaning completed successfully!")
    print(f"Total Records : {len(df)}")


if __name__ == "__main__":
    clean_youtube_data()