# scripts/migrate_old_data.py
#
# ONE-TIME helper: merges data scattered across old per-day CSV files
# (and the previous 30-day-window file) into the new calendar-month
# file used by youtube_fetch.py.
#
# Run this once, from the project root (same folder that has data/raw
# and data/cleaned), right after replacing youtube_fetch.py:
#
#     python scripts/migrate_old_data.py
#
# It will NOT delete your old files - it only reads them and writes
# the combined result into the new July file. Safe to run again.

import os
import glob
import calendar
import pandas as pd
from datetime import date


def month_window_label(today=None):
    today = today or date.today()
    last_day = calendar.monthrange(today.year, today.month)[1]
    start = today.replace(day=1)
    end = today.replace(day=last_day)
    return start, end, f"{start.strftime('%Y%m%d')}_{end.strftime('%Y%m%d')}"


def strip_excel_prefix(df):
    for col in ["published_at", "collection_date"]:
        if col in df.columns:
            df[col] = df[col].astype(str).str.lstrip("'")
    return df


def load_all_csvs(folder):
    frames = []
    for path in glob.glob(os.path.join(folder, "*.csv")):
        try:
            df = pd.read_csv(path, dtype=str, encoding="utf-8-sig")
            df = strip_excel_prefix(df)
            frames.append(df)
            print(f"   Loaded {len(df):>5} rows from {path}")
        except Exception as e:
            print(f"   Skipped {path} ({e})")
    if not frames:
        return pd.DataFrame()
    return pd.concat(frames, ignore_index=True)


def consolidate(folder, out_filename, start, end):
    print(f"\nConsolidating: {folder}")
    combined = load_all_csvs(folder)
    if combined.empty:
        print("   No data found, nothing to do.")
        return

    # Keep only rows collected within this month's window
    combined["collection_date_parsed"] = pd.to_datetime(
        combined["collection_date"], errors="coerce"
    )
    mask = (combined["collection_date_parsed"] >= pd.Timestamp(start)) & \
           (combined["collection_date_parsed"] <= pd.Timestamp(end))
    combined = combined[mask].drop(columns=["collection_date_parsed"])

    # Numeric columns back to proper ints where present
    for col in ["views", "likes", "comments"]:
        if col in combined.columns:
            combined[col] = pd.to_numeric(combined[col], errors="coerce").fillna(0).astype(int)

    # De-dupe: keep last entry per (video_id, collection_date)
    if "video_id" in combined.columns:
        combined = combined.drop_duplicates(subset=["video_id", "collection_date"], keep="last")

    if "views" in combined.columns:
        combined = combined.sort_values(
            ["collection_date", "views"], ascending=[False, False]
        ).reset_index(drop=True)

    out_path = os.path.join(folder, out_filename)
    combined.to_csv(out_path, index=False, encoding="utf-8-sig")
    print(f"   Saved {len(combined)} rows -> {out_path}")


if __name__ == "__main__":
    start, end, label = month_window_label()
    print(f"Target window: {start} to {end}  (label: {label})")

    consolidate("data/cleaned", f"youtube_cleaned_{label}.csv", start, end)
    consolidate("data/raw",     f"youtube_{label}.csv",         start, end)

    print("\nDone. Old files were left untouched - you can delete them")
    print("manually once you've confirmed the merged file looks right.")
