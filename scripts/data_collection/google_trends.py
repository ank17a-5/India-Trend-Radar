from scripts.Cleaning.google_cleaning import clean_google_data
from pytrends.request import TrendReq
from pytrends.exceptions import TooManyRequestsError  # Added to catch the 429 error
from config.config import GOOGLE_TRENDS
import pandas as pd
from datetime import datetime
import os
import time
import random  # Added to introduce jitter (randomized sleep)
import traceback

from scripts.data_collection.get_daily_trends import get_daily_trends


def collect_google_trends():

    print("=" * 60)
    print("GOOGLE TRENDS DATA COLLECTION STARTED")
    print("=" * 60)

    # Removed retries and backoff_factor to fix the urllib3 version conflict
    pytrends = TrendReq(
        hl=GOOGLE_TRENDS["language"],
        tz=GOOGLE_TRENDS["timezone"],
        timeout=(10, 25)
    )

    keywords = get_daily_trends()

    # Only use first 10 trending searches
    keywords = keywords[:10]

    geo = GOOGLE_TRENDS["geo"]
    timeframe = GOOGLE_TRENDS["timeframe"]

    output = []

    for keyword in keywords:

        print(f"\nCollecting data for: {keyword}")
        
        # We use a retry loop for each specific keyword
        max_retries = 4
        success = False
        
        for attempt in range(max_retries):
            try:
                pytrends.build_payload(
                    kw_list=[keyword],
                    cat=0,
                    timeframe=timeframe,
                    geo=geo
                )

                # Interest Over Time

                latest_interest = None

                interest_df = pytrends.interest_over_time()

                if not interest_df.empty:
                    if "isPartial" in interest_df.columns:
                        interest_df = interest_df.drop(columns=["isPartial"])

                    latest_interest = int(
                        interest_df[keyword].iloc[-1]
                    )

                # Rising Queries

                rising_queries = ""

                try:
                    queries = pytrends.related_queries()

                    if queries:
                        rising = queries.get(keyword, {}).get("rising")

                        if rising is not None and not rising.empty:
                            rising_queries = ", ".join(
                                rising["query"]
                                .head(5)
                                .astype(str)
                                .tolist()
                            )

                except Exception:
                    print("   ℹ Rising queries not available.")

                # Save Row

                output.append({
                    "collection_date": datetime.now().strftime("%Y-%m-%d"),
                    "collection_time": datetime.now().strftime("%H:%M:%S"),
                    "keyword": keyword,
                    "latest_interest": latest_interest,
                    "rising_queries": rising_queries,
                    "country": "India",
                    "time_window": "Past 30 Days",
                    "source": "Google Trends"
                })

                print("✓ Success")
                success = True
                
                # Add a randomized delay (e.g., between 15 to 30 seconds) to avoid patterns
                delay = random.randint(15, 30)
                print(f"Waiting {delay} seconds before next keyword...")
                time.sleep(delay)
                break  # Successfully processed this keyword, exit the retry loop

            except TooManyRequestsError:
                # Calculate exponential wait: attempt 0 -> 30s, attempt 1 -> 60s, attempt 2 -> 120s...
                wait_time = (2 ** attempt) * 30 + random.randint(5, 15)
                print(f"⚠️ Rate limited (429) for '{keyword}'. Attempt {attempt + 1}/{max_retries}.")
                print(f"   Waiting {wait_time} seconds before retrying...")
                time.sleep(wait_time)
                
            except Exception:
                print(f"❌ Unexpected error collecting '{keyword}'")
                traceback.print_exc()
                time.sleep(30)
                break  # Break out of retry if it's a structural error (not a 429 limit)

        if not success:
            print(f"🛑 Skipped '{keyword}' after failing all retries.")

    # Save CSV
    
    if output:
        final_df = pd.DataFrame(output)

        os.makedirs("data/raw", exist_ok=True)

        output_file = "data/raw/google_trends.csv"

        # Read existing CSV if it exists
        if os.path.exists(output_file):

            old_df = pd.read_csv(output_file)

            # Combine old and new data
            final_df = pd.concat(
                [old_df, final_df],
                ignore_index=True
            )

        # Convert collection_date to datetime
        final_df["collection_date"] = pd.to_datetime(
            final_df["collection_date"]
        )

        # Keep only the last 30 days
        latest_date = final_df["collection_date"].max()

        final_df = final_df[
            final_df["collection_date"] >= latest_date - pd.Timedelta(days=29)
        ]

        # Sort by date and time
        final_df = final_df.sort_values(
            by=["collection_date", "collection_time"]
        )

        # Convert date back to string
        final_df["collection_date"] = final_df["collection_date"].dt.strftime("%Y-%m-%d")

        # Save CSV
        final_df.to_csv(
            output_file,
            index=False
        )

        print("\n")
        print("=" * 60)
        print("GOOGLE TRENDS COLLECTION COMPLETED")
        print("=" * 60)

        print(final_df)

        print("\nSummary")
        print("----------------------------")
        print(f"Total Records : {len(final_df)}")
        print(f"Output File   : {output_file}")
    else:
        print("\n❌ No data was collected due to rate limits.")


if __name__ == "__main__":
    collect_google_trends()
    clean_google_data()
