# scripts/youtube_fetch.py

import os
import re
import sys
import time
import argparse
import traceback
import pandas as pd
from datetime import datetime, date
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

# --- Fetch Function (today's top trending, general chart only) --------
def fetch_trending_videos(max_results=200):
    """
    Fetches today's top trending videos for India from YouTube's
    general "mostPopular" chart (no category filtering).
    Note: YouTube's trending chart typically returns a maximum of
    around 200 videos per region regardless of how high max_results
    is set.
    """
    all_videos = []
    seen_ids   = set()  # Used to skip duplicate video IDs

    print("\nFetching today's top trending videos...")
    all_videos, seen_ids = fetch_page(
        all_videos, seen_ids,
        category_id=None,
        max_results=max_results
    )

    return all_videos


# --- Keyword Extraction Helper ---------------------------------------
# Common English filler/stop words to exclude from extracted keywords
STOP_WORDS = {
    "a", "an", "the", "and", "or", "but", "if", "in", "on", "at", "to",
    "of", "for", "with", "is", "are", "was", "were", "be", "been", "being",
    "this", "that", "these", "those", "it", "its", "as", "by", "from",
    "vs", "ft", "feat", "official", "video", "new", "full", "song",
    "part", "ep", "episode", "hd", "4k", "trailer"
}

def extract_keywords(title, max_keywords=8):
    """
    Extracts simple keywords from a video title by removing
    punctuation, stop words, and short/noise tokens.
    Returns a comma-separated string, e.g. "cricket, india, final".
    """
    if not title:
        return ""

    # Keep only letters/numbers/spaces, lowercase everything
    cleaned = re.sub(r"[^a-zA-Z0-9\s]", " ", title).lower()
    words = cleaned.split()

    keywords = []
    seen = set()
    for word in words:
        if len(word) <= 2:
            continue
        if word in STOP_WORDS:
            continue
        if word in seen:
            continue
        seen.add(word)
        keywords.append(word)
        if len(keywords) >= max_keywords:
            break

    return ", ".join(keywords)


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
                "video_id":        vid_id,
                "title":           snippet.get("title",        "").strip(),
                "channel_name":    snippet.get("channelTitle", "").strip(),
                "published_at":    snippet.get("publishedAt",  ""),
                "views":           int(stats.get("viewCount",    0) or 0),
                "likes":           int(stats.get("likeCount",    0) or 0),
                "comments":        int(stats.get("commentCount", 0) or 0),
                "tags":            tags_str,
                "keywords":        extract_keywords(snippet.get("title", "")),
                "video_url":       f"https://www.youtube.com/watch?v={vid_id}",
                "collection_date": datetime.now().strftime("%Y-%m-%d"),
            }
            all_videos.append(video)
            fetched += 1

        next_page_token = response.get("nextPageToken")
        if not next_page_token:
            break

    print(f"   Running total: {len(all_videos)} unique videos")
    return all_videos, seen_ids


# --- Clean Function ------------------------------------------------
def clean_data(df, days_back=3):
    """
    days_back : how many days of publish history to keep, counting
                today as day 1. Default 3 means videos published
                today, yesterday, or the day before are all kept.
                Set to 1 to restore the old "today only" behavior.
    """
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

    # 9. Keep only videos published within the last `days_back` days.
    #    Broadened from "today only" to "last few days" because some
    #    videos take a couple of days to build up views/likes/comments
    #    before they actually show up as trending - this also means a
    #    single run picks up some of what would've been missed on
    #    days the script wasn't run.
    published_dt = pd.to_datetime(df["published_at"], errors="coerce")
    cutoff_date = pd.Timestamp(datetime.now().date()) - pd.Timedelta(days=days_back - 1)
    df = df[published_dt >= cutoff_date]

    after = len(df)
    print(f"   Removed {before - after} invalid rows")
    print(f"   Clean rows (published in last {days_back} day(s)): {after}")

    return df


# --- Legacy Cleanup Helper -------------------------------------------
def strip_excel_prefix(df):
    """
    Some older saved CSVs may still have a leading apostrophe (') in
    front of published_at / collection_date - this was previously
    added to stop Excel from mangling the date display. This function
    strips it off (if present) so dates read back in as plain text,
    e.g. "2026-07-04" instead of "'2026-07-04".
    """
    df = df.copy()
    for col in ["published_at", "collection_date"]:
        if col in df.columns:
            df[col] = df[col].astype(str).str.lstrip("'")
    return df


# --- Monthly Rolling File Helper --------------------------------------
# Instead of creating a brand-new file every single run, we keep adding
# to the SAME file for the whole calendar month (e.g. 1 July - 31 July).
# The moment a new month starts, a new file is used automatically -
# no config or state file needed, it's calculated purely from today's
# date, so it works the same whether you run it once a day or 50
# times a day.
import calendar

def get_period_label():
    """
    Returns a label like '20260701_20260731' identifying the current
    calendar month window, and rolls over to a new label automatically
    on the 1st of every month.
    """
    today = date.today()
    last_day = calendar.monthrange(today.year, today.month)[1]
    period_start = today.replace(day=1)
    period_end   = today.replace(day=last_day)
    return f"{period_start.strftime('%Y%m%d')}_{period_end.strftime('%Y%m%d')}"


def append_and_dedupe(existing_path, new_df, sort_col="views"):
    """
    Loads the existing CSV (if any), appends new_df to it, and removes
    duplicates so that:
      - the same video collected on the same day only appears once
        (if you run the script several times in one day, the LATEST
        run's numbers for that video/day win, older ones are dropped)
      - data from previous days is kept untouched, so you build up
        3-4 days, a week, or the full 30-day window in one file.
    """
    if os.path.exists(existing_path):
        old_df = pd.read_csv(existing_path, dtype=str, encoding="utf-8-sig")
        old_df = strip_excel_prefix(old_df)
        # restore proper dtypes for numeric columns after reading back as str
        for col in ["views", "likes", "comments"]:
            if col in old_df.columns:
                old_df[col] = pd.to_numeric(old_df[col], errors="coerce").fillna(0).astype(int)
        combined = pd.concat([old_df, new_df], ignore_index=True)
    else:
        combined = new_df.copy()

    # Keep the newest row for a given (video_id, collection_date) pair
    combined = combined.drop_duplicates(
        subset=["video_id", "collection_date"], keep="last"
    )
    combined = combined.sort_values(
        ["collection_date", sort_col], ascending=[False, False]
    ).reset_index(drop=True)

    return combined


# --- Save Function ---------------------------------------------------
def save_data(videos, days_back=3):
    if not videos:
        print("No data fetched.")
        return

    df = pd.DataFrame(videos)

    # Keep only the required columns
    df = df[[
        "video_id",
        "title",
        "channel_name",
        "published_at",
        "views",
        "likes",
        "comments",
        "tags",
        "keywords",
        "video_url",
        "collection_date"
    ]]

    # Clean the data
    df_clean = clean_data(df, days_back=days_back)

    # Folders
    os.makedirs("data/raw",     exist_ok=True)
    os.makedirs("data/cleaned", exist_ok=True)

    period_label = get_period_label()

    # File paths - same file reused for the whole 30-day window,
    # a new one is created automatically once the window rolls over
    raw_path   = f"data/raw/youtube_{period_label}.csv"
    clean_path = f"data/cleaned/youtube_cleaned_{period_label}.csv"

    # Raw: append this run's data to the current window's file
    raw_df = pd.DataFrame(videos)[[
        "video_id", "title", "channel_name",
        "published_at", "views", "likes", "comments", "tags",
        "keywords", "video_url", "collection_date"
    ]]
    raw_combined = append_and_dedupe(raw_path, raw_df)
    raw_combined.to_csv(raw_path, index=False, encoding="utf-8-sig")

    # Cleaned: append this run's cleaned data to the current window's file
    clean_combined = append_and_dedupe(clean_path, df_clean)
    clean_combined.to_csv(clean_path, index=False, encoding="utf-8-sig")

    # --- Summary --------------------------------------------------
    print(f"\n{'='*55}")
    print(f"Current 30-day window : {period_label}")
    print(f"Raw file (running)    : {raw_path}")
    print(f"Clean file (running)  : {clean_path}")
    print(f"{'='*55}")
    print(f"Rows added this run    : {len(df_clean)}")
    print(f"Total rows in file now : {len(clean_combined)}")
    print(f"Columns                : {list(clean_combined.columns)}")
    print(f"Rows with tags         : {(clean_combined['tags'] != 'No Tags').sum()}")
    print(f"{'='*55}")
    print(f"\nTop 5 by views (whole file so far):")
    print(clean_combined.head(5)[
        ["title", "channel_name", "views", "tags", "collection_date"]
    ].to_string(index=False))


# --- Job wrapper (a single fetch + save run) --------------------------
def run_job(days_back=3):
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
        videos = fetch_trending_videos(max_results=200)
        save_data(videos, days_back=days_back)
    except Exception as e:
        print(f"Job failed: {e}")
        traceback.print_exc()
    finally:
        end = datetime.now()
        print(f"Run completed in {(end - start).total_seconds():.1f}s")


# --- Scheduler ---------------------------------------------------------
def start_scheduler(run_time="09:00", interval=None, run_now=True, days_back=3):
    """
    run_time : "HH:MM" (24-hour, local system time) - used for daily runs
    interval : if provided (in minutes), the job runs every N minutes
               instead of once a day (useful for testing/frequent updates)
    run_now  : whether to run the job immediately when the scheduler starts
    """
    if run_now:
        print("Running an immediate job before starting the schedule...")
        run_job(days_back=days_back)

    if interval:
        schedule.every(interval).minutes.do(run_job, days_back=days_back)
        print(f"Scheduler set: will run every {interval} minute(s)")
    else:
        schedule.every().day.at(run_time).do(run_job, days_back=days_back)
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
    parser.add_argument("--days-back", type=int, default=3,
                         help="Keep videos published in the last N days instead of today only (default: 3)")
    args = parser.parse_args()

    print("India Trend Radar - YouTube Data Collection")
    print("=" * 55)

    if args.schedule:
        start_scheduler(
            run_time=args.time,
            interval=args.interval,
            run_now=not args.no_run_now,
            days_back=args.days_back
        )
    else:
        # Default behavior - single one-time run
        run_job(days_back=args.days_back)