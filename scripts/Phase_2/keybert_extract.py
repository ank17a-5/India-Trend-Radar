"""
scripts/Phase_2/keybert_extract.py
---------------------------
Member 3 (Anuska) — Phase 2: KeyBERT keyword extraction

Reads the cleaned news data (data/cleaned/news_clean.csv), extracts
semantically-ranked keywords per article using KeyBERT, and writes
an output table for downstream use.

Run from the repo root:
    python -m scripts.Phase_2.keybert_extract
"""

import os
import pandas as pd
from keybert import KeyBERT

from utils.utils import logger

CLEANED_PATH = "data/cleaned/news_clean.csv"
OUTPUT_DIR = "data/cleaned"
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "news_keybert.csv")


def load_news(path: str = CLEANED_PATH) -> pd.DataFrame:
    """Load the cleaned news CSV, keeping only English-language rows."""
    df = pd.read_csv(path, encoding="utf-8-sig")

    before = len(df)
    if "language" in df.columns:
        df = df[df["language"] == "en"].copy()
    logger.info(f"Loaded {before} articles, {len(df)} after English-only filter")

    return df


def build_input_text(row) -> str:
    """Combine title + description for more context than title alone."""
    title = str(row.get("title") or "")
    description = str(row.get("description") or "")
    if description and description.lower() != "nan" and description != title:
        return f"{title}. {description}"
    return title


def extract_keywords_keybert(df: pd.DataFrame, model, top_n: int = 3) -> pd.DataFrame:
    """Run KeyBERT on each article and attach a keybert_keywords column."""
    keybert_col = []

    for _, row in df.iterrows():
        text = build_input_text(row)

        if not text.strip():
            keybert_col.append("")
            continue

        keywords = model.extract_keywords(
            text,
            keyphrase_ngram_range=(1, 2),
            stop_words="english",
            top_n=top_n,
        )
        keybert_col.append(", ".join(kw for kw, _score in keywords))

    df["keybert_keywords"] = keybert_col
    return df


def run():
    logger.info("KeyBERT extraction started")

    df = load_news()

    if df.empty:
        logger.warning("No English articles found — nothing to process")
        return

    logger.info("Loading KeyBERT model...")
    model = KeyBERT(model="all-MiniLM-L6-v2")

    df = extract_keywords_keybert(df, model, top_n=3)

    output_cols = [
        "source_name", "title", "description", "url",
        "keyword", "keybert_keywords", "language",
        "published_date", "collected_at",
        "year", "month", "day", "weekday",
    ]
    df_out = df[[c for c in output_cols if c in df.columns]].copy()

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    df_out.to_csv(OUTPUT_PATH, index=False, encoding="utf-8-sig")

    logger.info(f"KeyBERT output saved: {OUTPUT_PATH} ({len(df_out)} rows)")
    logger.info("KeyBERT extraction completed")


if __name__ == "__main__":
    run()