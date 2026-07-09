# scripts/youtube_fetch.py

import os
import re
import sys
import time
import argparse
import traceback
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
from googleapiclient.discovery import build
import schedule  # pip install schedule

# --- Setup ---------------------------------------------------
load_dotenv(dotenv_path="config/.env")
API_KEY = os.getenv("YOUTUBE_API_KEY")

if not API_KEY:
    print("Error: API key missing. Please check config/.env")
    exit()

youtube = build("youtube", "v3", developerKey=API_KEY)
print("YouTube API connected successfully.")

# --- Category IDs for India ------------------------------------
# Fetching data category-wise in addition to general trending
# increases the total number of unique rows collected.
CATEGORY_IDS = ["10", "17", "20", "22", "23", "24", "25", "27", "28"]

# --- Fetch Function (category-wise) ------------------------------
def fetch_trending_videos(max_per_category=50):
    all_videos = []
    seen_ids   = set()  # Used to skip duplicate video IDs

    # -- General trending (no category filter) --
    print("\nFetching general trending videos...")
    all_videos, seen_ids = fetch_page(
        all_videos, seen_ids,
        category_id=None,
        max_results=50
    )

    # -- Category-wise trending --
    for cat_id in CATEGORY_IDS:
        print(f"Fetching category {cat_id}...")
        all_videos, seen_ids = fetch_page(
            all_videos, seen_ids,
            category_id=cat_id,
            max_results=max_per_category
        )

    return all_videos


def fetch_page(all_videos, seen_ids, category_id=None, max_results=50):
    next_page_token = None
    fetched = 0

    while fetched < max_results:
        try:
            params = dict(
                part       = "snippet,statistics",
                chart      = "mostPopular",
                regionCode = "IN",
                maxResults = min(50, max_results - fetched),
                pageToken  = next_page_token
            )
            if category_id:
                params["videoCategoryId"] = category_id

            response = youtube.videos().list(**params).execute()

        except Exception as e:
            print(f"API Error (category {category_id}): {e}")
            break

        for item in response.get("items", []):
            vid_id = item["id"]

            # Skip duplicates
            if vid_id in seen_ids:
                continue
            seen_ids.add(vid_id)

            snippet = item.get("snippet",    {})
            stats   = item.get("statistics", {})

            # Tags - comma separated
            tags_list = snippet.get("tags", [])
            tags_str  = ", ".join(tags_list) if tags_list else "No Tags"

            video = {
                "video_id":     vid_id,
                "title":        snippet.get("title",        "").strip(),
                "channel_name": snippet.get("channelTitle", "").strip(),
                "published_at": snippet.get("publishedAt",  ""),
                "views":        int(stats.get("viewCount",    0) or 0),
                "likes":        int(stats.get("likeCount",    0) or 0),
                "comments":     int(stats.get("commentCount", 0) or 0),
                "tags":         tags_str,
            }
            all_videos.append(video)
            fetched += 1

        next_page_token = response.get("nextPageToken")
        if not next_page_token:
            break

    print(f"   Running total: {len(all_videos)} unique videos")
    return all_videos, seen_ids


# --- Clean Function ------------------------------------------------
def clean_data(df):
    print("\nCleaning data...")

    before = len(df)

    # 1. Remove duplicate video_id
    df = df.drop_duplicates(subset="video_id")

    # 2. Remove rows with empty title
    df = df[df["title"].str.strip() != ""]

    # 3. Remove invalid entries where views = 0
    df = df[df["views"] > 0]

    # 4. Convert published_at to a readable format
    df["published_at"] = pd.to_datetime(
        df["published_at"], errors="coerce"
    ).dt.strftime("%Y-%m-%d %H:%M:%S")

    # 5. Ensure numeric columns are proper integers
    for col in ["views", "likes", "comments"]:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)

    # 6. Strip extra whitespace from tags
    df["tags"] = df["tags"].str.strip()

    # 7. Remove non-ASCII characters from title
    df["title"] = df["title"].str.replace(r"[^\x00-\x7F]+", " ", regex=True).str.strip()

    # 8. Sort by views, descending
    df = df.sort_values("views", ascending=False).reset_index(drop=True)

    after = len(df)
    print(f"   Removed {before - after} invalid rows")
    print(f"   Clean rows: {after}")

    return df


# --- Save Function ---------------------------------------------------
def save_data(videos):
    if not videos:
        print("No data fetched.")
        return

    df = pd.DataFrame(videos)

    # Keep only the 8 required columns
    df = df[[
        "video_id",
        "title",
        "channel_name",
        "published_at",
        "views",
        "likes",
        "comments",
        "tags"
    ]]

    # Clean the data
    df_clean = clean_data(df)

    # Folders
    os.makedirs("data/raw",     exist_ok=True)
    os.makedirs("data/cleaned", exist_ok=True)

    date_str = datetime.now().strftime("%Y%m%d")

    # Raw save (before cleaning)
    raw_df = pd.DataFrame(videos)[[
        "video_id", "title", "channel_name",
        "published_at", "views", "likes", "comments", "tags"
    ]]
    raw_path = f"data/raw/youtube_{date_str}.csv"
    raw_df.to_csv(raw_path, index=False, encoding="utf-8-sig")

    # Cleaned save
    clean_path = f"data/cleaned/youtube_cleaned_{date_str}.csv"
    df_clean.to_csv(clean_path, index=False, encoding="utf-8-sig")

    # --- Summary --------------------------------------------------
    print(f"\n{'='*55}")
    print(f"Raw file saved   : {raw_path}")
    print(f"Clean file saved : {clean_path}")
    print(f"{'='*55}")
    print(f"Total rows       : {len(df_clean)}")
    print(f"Columns          : {list(df_clean.columns)}")
    print(f"Rows with tags   : {(df_clean['tags'] != 'No Tags').sum()}")
    print(f"{'='*55}")
    print(f"\nTop 5 by views:")
    print(df_clean.head(5)[
        ["title", "channel_name", "views", "tags"]
    ].to_string(index=False))


# --- Job wrapper (a single fetch + save run) --------------------------
def run_job():
    """
    Runs one complete cycle: fetch + save.
    The scheduler calls this function repeatedly.
    If an error occurs (API outage, network issue, quota exceeded),
    the job will not crash the whole program - it logs the error
    and lets the next scheduled run proceed as normal.
    """
    start = datetime.now()
    print(f"\n[{start.strftime('%Y-%m-%d %H:%M:%S')}] Starting Trend Radar run...")
    print("=" * 55)
    try:
        videos = fetch_trending_videos(max_per_category=50)
        save_data(videos)
    except Exception as e:
        print(f"Job failed: {e}")
        traceback.print_exc()
    finally:
        end = datetime.now()
        print(f"Run completed in {(end - start).total_seconds():.1f}s")


# --- Scheduler ---------------------------------------------------------
def start_scheduler(run_time="09:00", interval=None, run_now=True):
    """
    run_time : "HH:MM" (24-hour, local system time) - used for daily runs
    interval : if provided (in minutes), the job runs every N minutes
               instead of once a day (useful for testing/frequent updates)
    run_now  : whether to run the job immediately when the scheduler starts
    """
    if run_now:
        print("Running an immediate job before starting the schedule...")
        run_job()

    if interval:
        schedule.every(interval).minutes.do(run_job)
        print(f"Scheduler set: will run every {interval} minute(s)")
    else:
        schedule.every().day.at(run_time).do(run_job)
        print(f"Scheduler set: will run daily at {run_time} (system local time)")

    print("Scheduler is running. Press Ctrl+C to stop.\n")

    try:
        while True:
            schedule.run_pending()
            time.sleep(30)  # Check every 30 seconds
    except KeyboardInterrupt:
        print("\nScheduler stopped manually. Exiting.")
        sys.exit(0)


# --- Main ----------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="India Trend Radar - YouTube Data Collector")
    parser.add_argument("--schedule", action="store_true",
                         help="Run in scheduler mode (repeats automatically in the background)")
    parser.add_argument("--time", default="09:00",
                         help="Daily run time, 24-hour format, default 09:00")
    parser.add_argument("--interval", type=int, default=None,
                         help="Run every N minutes instead of daily (useful for testing)")
    parser.add_argument("--no-run-now", action="store_true",
                         help="Do not run immediately when the scheduler starts")
    args = parser.parse_args()

    print("India Trend Radar - YouTube Data Collection")
    print("=" * 55)

    if args.schedule:
        start_scheduler(
            run_time=args.time,
            interval=args.interval,
            run_now=not args.no_run_now
        )
    else:
        # Default behavior - single one-time run
        run_job()