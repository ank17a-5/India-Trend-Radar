import os
import re
import argparse
import traceback
import pandas as pd
from datetime import datetime, date
from dotenv import load_dotenv
from googleapiclient.discovery import build  

# --- Setup ---------------------------------------------------
load_dotenv(dotenv_path="config/.env")
API_KEY = os.getenv("YOUTUBE_API_KEY")   

if not API_KEY:
    print("Error: API key missing. Please check config/.env")
    exit() 

youtube = build("youtube", "v3", developerKey=API_KEY)  
print("YouTube API connected successfully.")

# --- Config ----------------------------------------------------------
ROLLING_WINDOW_DAYS = 30   # keep only the latest 30 collection days

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

            if vid_id in seen_ids:
                continue
            seen_ids.add(vid_id)

            snippet = item.get("snippet",    {})
            stats   = item.get("statistics", {})

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


# --- Legacy Cleanup Helper -------------------------------------------
def strip_excel_prefix(df):
    """
    Some older saved CSVs may still have a leading apostrophe (') in
    front of published_at / collection_date - strips it if present.
    """
    df = df.copy()
    for col in ["published_at", "collection_date"]:
        if col in df.columns:
            df[col] = df[col].astype(str).str.lstrip("'")
    return df


# --- Monthly File Naming Helper (original naming, kept as-is) --------
import calendar

def get_period_label():
    """
    Returns a label like '20260701_20260731' identifying the current
    calendar month window. This keeps the original file-naming scheme
    - no migration needed, since it just keeps writing to whichever
    monthly file already exists on disk.
    """
    today = date.today()
    last_day = calendar.monthrange(today.year, today.month)[1]
    period_start = today.replace(day=1)
    period_end   = today.replace(day=last_day)
    return f"{period_start.strftime('%Y%m%d')}_{period_end.strftime('%Y%m%d')}"


def parse_mixed_dates(series):
    """
    Robustly parses a column of date strings even when it contains a
    MIX of formats - e.g. '2026-07-13', '11/07/2026', '08-07-2026'.
    Tries known formats one at a time instead of letting pandas guess
    a single format for the whole column.
    """
    s = series.astype(str).str.strip().str.lstrip("'")
    result = pd.Series(pd.NaT, index=s.index, dtype="datetime64[ns]")

    known_formats = ["%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d", "%m/%d/%Y"]
    remaining = result.isna()
    for fmt in known_formats:
        if not remaining.any():
            break
        parsed = pd.to_datetime(s[remaining], format=fmt, errors="coerce")
        result.loc[remaining] = result.loc[remaining].fillna(parsed)
        remaining = result.isna()

    if remaining.any():
        parsed = pd.to_datetime(s[remaining], errors="coerce", dayfirst=True)
        result.loc[remaining] = result.loc[remaining].fillna(parsed)

    return result


def append_and_dedupe(existing_path, new_df, sort_col="views"):
    """
    Loads the existing CSV (if any), appends new_df to it, and removes
    duplicates. Rows are ordered by COLLECTION DATE, newest first.
    """
    if os.path.exists(existing_path):
        old_df = pd.read_csv(existing_path, dtype=str, encoding="utf-8-sig")
        old_df = strip_excel_prefix(old_df)
        for col in ["views", "likes", "comments"]:
            if col in old_df.columns:
                old_df[col] = pd.to_numeric(old_df[col], errors="coerce").fillna(0).astype(int)
        combined = pd.concat([old_df, new_df], ignore_index=True)
    else:
        combined = new_df.copy()

    collection_key = parse_mixed_dates(combined["collection_date"])
    published_key  = parse_mixed_dates(combined["published_at"])
    combined = combined.assign(_collection_key=collection_key, _published_key=published_key)

    combined = combined.drop_duplicates(
        subset=["video_id", "_collection_key"], keep="last"
    )

    combined = combined.sort_values(
        ["_collection_key", "_published_key", sort_col],
        ascending=[False, False, False]
    )

    combined["collection_date"] = combined["_collection_key"].dt.strftime("%Y-%m-%d")
    combined["published_at"]    = combined["_published_key"].dt.strftime("%Y-%m-%d")

    combined = combined.drop(columns=["_collection_key", "_published_key"]).reset_index(drop=True)

    return combined


# --- Rolling 30-Day Window Helper -------------------------------------
def enforce_rolling_window(df, days=ROLLING_WINDOW_DAYS):
    """
    Keeps only the most recent `days` UNIQUE collection dates in the
    dataframe and drops everything older.

    This is what creates the rolling window behaviour:
      - Day 1 to Day 30: data just keeps accumulating in the file.
      - Day 31: a new collection_date is added, which pushes the count
        of unique dates to 31 -> the oldest date (Day 1) is dropped,
        so the file always contains at most `days` collection dates.
    """
    if df.empty:
        return df

    df = df.copy()
    collection_key = parse_mixed_dates(df["collection_date"])
    df = df.assign(_collection_key=collection_key)

    unique_dates = sorted(df["_collection_key"].dropna().unique(), reverse=True)
    keep_dates = set(unique_dates[:days])
    dropped_dates = sorted(set(unique_dates) - keep_dates, reverse=True)

    if dropped_dates:
        dropped_str = ", ".join(pd.Timestamp(d).strftime("%Y-%m-%d") for d in dropped_dates)
        print(f"Rolling window: dropping data for date(s) older than {days} days -> {dropped_str}")

    df = df[df["_collection_key"].isin(keep_dates)]
    df = df.drop(columns=["_collection_key"]).reset_index(drop=True)
    return df


# --- Save Function ---------------------------------------------------
def save_data(videos):
    if not videos:
        print("No data fetched.")
        return

    df = pd.DataFrame(videos)

    # Structured column order - always enforced, both for new rows and
    # for the final saved file (see below).
    df = df[[
        "video_id", "title", "channel_name", "published_at",
        "views", "likes", "comments", "tags", "keywords",
        "video_url", "collection_date"
    ]]

    df["published_at"] = pd.to_datetime(
        df["published_at"], errors="coerce"
    ).dt.strftime("%Y-%m-%d")

    os.makedirs("data/raw", exist_ok=True)

    period_label = get_period_label()
    raw_path = f"data/raw/youtube_trending_rolling30.csv"

    raw_combined = append_and_dedupe(raw_path, df)
    raw_combined = enforce_rolling_window(raw_combined, days=ROLLING_WINDOW_DAYS)

    # Re-enforce structured column order + dtypes before saving, so the
    # file on disk is always clean regardless of what was merged in.
    raw_combined = raw_combined[[
        "video_id", "title", "channel_name", "published_at",
        "views", "likes", "comments", "tags", "keywords",
        "video_url", "collection_date"
    ]]
    for col in ["views", "likes", "comments"]:
        raw_combined[col] = pd.to_numeric(raw_combined[col], errors="coerce").fillna(0).astype(int)

    raw_combined.to_csv(raw_path, index=False, encoding="utf-8-sig")

    num_days = raw_combined["collection_date"].nunique()

    print(f"\n{'='*55}")
    print(f"Current month window       : {period_label}")
    print(f"Raw file (rolling {ROLLING_WINDOW_DAYS}-day window): {raw_path}")
    print(f"{'='*55}")
    print(f"Rows added this run       : {len(df)}")
    print(f"Total rows in file now    : {len(raw_combined)}")
    print(f"Unique collection dates   : {num_days} / {ROLLING_WINDOW_DAYS}")
    print(f"Columns                   : {list(raw_combined.columns)}")
    print(f"{'='*55}")
    print(f"\nTop 5 rows (most recent collection date, sorted by views within that day):")
    print(raw_combined.head(5)[
        ["title", "channel_name", "views", "tags", "collection_date"]
    ].to_string(index=False))


# --- Job wrapper (a single fetch + save run) --------------------------
def run_job():
    start = datetime.now()
    print(f"\n[{start.strftime('%Y-%m-%d %H:%M:%S')}] Starting Trend Radar run...")
    print("=" * 55)
    try:
        videos = fetch_trending_videos(max_results=200)
        save_data(videos)
    except Exception as e:
        print(f"Job failed: {e}")
        traceback.print_exc()
    finally:
        end = datetime.now()
        print(f"Run completed in {(end - start).total_seconds():.1f}s")


# --- Main ----------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="India Trend Radar - YouTube Data Collector")
    args = parser.parse_args()

    print("India Trend Radar - YouTube Data Collection")
    print("=" * 55)

    run_job()   