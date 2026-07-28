import pandas as pd


def clean_google_data():

    print("Loading Google Trends data...")

    df = pd.read_csv("data/raw/google_trends.csv")

    # Standardize column names
    df.columns = df.columns.str.strip().str.lower()

    # Remove duplicate rows
    df = df.drop_duplicates()

    # Remove extra spaces
    df["keyword"] = df["keyword"].str.strip().str.lower()
    df["country"] = df["country"].str.strip().str.lower()
    df["source"] = df["source"].str.strip().str.lower()
    df["time_window"] = df["time_window"].str.strip()

    # Handle missing values
    df["rising_queries"] = df["rising_queries"].fillna("No Rising Query")

    # Convert date column
    df["collection_date"] = pd.to_datetime(df["collection_date"])

    # Create datetime column
    df["datetime"] = pd.to_datetime(
        df["collection_date"].astype(str) + " " + df["collection_time"]
    )

    # Save cleaned data
    df.to_csv(
        "data/cleaned/google_trends_clean.csv",
        index=False
    )

    print("Cleaning completed successfully!")
    print(f"Total records : {len(df)}")


if __name__ == "__main__":
    clean_google_data()