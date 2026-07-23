"""
=========================================================
Member 7 - Unified Topic IDs
=========================================================

Reads:
    data/cleaned/google_trends_clean.csv
    data/cleaned/youtube_clean.csv
    data/cleaned/news_clean.csv

Creates:
    data/processed/unified_topics.csv

Run:
    python scripts/unified_topic_ids.py
"""

from pathlib import Path
import pandas as pd
import re
from rapidfuzz import fuzz

# =========================================================
# Project Paths
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"

GOOGLE_FILE = DATA_DIR / "cleaned" / "google_trends_clean.csv"
YOUTUBE_FILE = DATA_DIR / "cleaned" / "youtube_clean.csv"
NEWS_FILE = DATA_DIR / "cleaned" / "news_clean.csv"

OUTPUT_DIR = DATA_DIR / "processed"
OUTPUT_FILE = OUTPUT_DIR / "unified_topics.csv"

SIMILARITY_THRESHOLD = 85


# =========================================================
# Verify Files
# =========================================================

for file in [GOOGLE_FILE, YOUTUBE_FILE, NEWS_FILE]:
    if not file.exists():
        raise FileNotFoundError(f"\nFile not found:\n{file}\n")


# =========================================================
# Clean Text
# =========================================================

def clean_text(text):
    text = str(text).lower()

    text = re.sub(r"http\S+", "", text)

    text = re.sub(r"[^a-z0-9 ]", " ", text)

    text = re.sub(r"\s+", " ", text)

    return text.strip()


# =========================================================
# Read CSV
# =========================================================

def load_file(file_path, source_name):

    df = pd.read_csv(file_path)

    if "keyword" not in df.columns:
        raise Exception(
            f"'keyword' column missing in {file_path.name}"
        )

    df = df[["keyword"]].copy()

    df.rename(
        columns={
            "keyword": "original_topic"
        },
        inplace=True,
    )

    df["source"] = source_name

    return df


google = load_file(GOOGLE_FILE, "Google Trends")
youtube = load_file(YOUTUBE_FILE, "YouTube")
news = load_file(NEWS_FILE, "News")


# =========================================================
# Merge
# =========================================================

topics = pd.concat(
    [google, youtube, news],
    ignore_index=True,
)

topics.dropna(inplace=True)

topics.drop_duplicates(inplace=True)

topics["clean_topic"] = topics["original_topic"].apply(clean_text)


# =========================================================
# Topic Matching
# =========================================================

canonical_topics = []

results = []

topic_counter = 1


for _, row in topics.iterrows():

    original = row["original_topic"]

    clean = row["clean_topic"]

    source = row["source"]

    matched = False

    for topic in canonical_topics:

        score = fuzz.token_sort_ratio(
            clean,
            topic["clean"],
        )

        if score >= SIMILARITY_THRESHOLD:

            results.append(
                {
                    "Topic_ID": topic["id"],
                    "Canonical_Topic": topic["canonical"],
                    "Original_Topic": original,
                    "Source": source,
                    "Similarity": round(score, 2),
                }
            )

            matched = True

            break

    if not matched:

        topic_id = f"T{topic_counter:03}"

        canonical_topics.append(
            {
                "id": topic_id,
                "canonical": original,
                "clean": clean,
            }
        )

        results.append(
            {
                "Topic_ID": topic_id,
                "Canonical_Topic": original,
                "Original_Topic": original,
                "Source": source,
                "Similarity": 100,
            }
        )

        topic_counter += 1


# =========================================================
# Save
# =========================================================

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

output = pd.DataFrame(results)

output = output.sort_values(
    by=["Topic_ID", "Source"]
)

output.to_csv(
    OUTPUT_FILE,
    index=False,
)

# =========================================================
# Summary
# =========================================================

print("\n========================================")
print("Unified Topic IDs Generated Successfully")
print("========================================")
print(f"Google Topics : {len(google)}")
print(f"YouTube Topics: {len(youtube)}")
print(f"News Topics   : {len(news)}")
print("----------------------------------------")
print(f"Total Records : {len(output)}")
print(f"Unique Topics : {len(canonical_topics)}")
print("----------------------------------------")
print(f"Output File:")
print(OUTPUT_FILE)
print("========================================")