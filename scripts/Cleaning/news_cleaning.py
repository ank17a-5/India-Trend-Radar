import pandas as pd
import re


def clean_text(text):
    
    text = str(text)
    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-zA-Z0-9 ]", "", text)
    text = text.strip()
    return text


def clean_news():

    print("Loading raw news data...")

    df = pd.read_csv("data/raw/news_raw.csv")

    df["author"] = df["author"].fillna("Unknown")

    df = df.drop_duplicates(subset=["title"])

    df["title"] = df["title"].apply(clean_text)
    df["description"] = df["description"].apply(clean_text)

    df["published_date"] = pd.to_datetime(df["published_date"])
    df["collected_at"] = pd.to_datetime(df["collected_at"])

    df["year"] = df["published_date"].dt.year
    df["month"] = df["published_date"].dt.month
    df["day"] = df["published_date"].dt.day
    df["weekday"] = df["published_date"].dt.day_name()

    df = df[df["url"].str.startswith("http", na=False)]

    df = df[df["title"].str.len() > 5]

    df["language"] = df["language"].str.lower()

    df["language"] = df["language"].replace({
        "fr": "en",
        "nl": "en"
    })

    df.to_csv("data/cleaned/news_clean.csv", index=False)

    print("News cleaning completed successfully!")
    print(f"Final records: {len(df)}")


if __name__ == "__main__":
    clean_news()