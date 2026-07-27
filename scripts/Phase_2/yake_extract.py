import pandas as pd
import yake
from pathlib import Path


# File Paths

INPUT_FILE = Path("India-Trend-Radar/data/processed/news_with_ner.csv")
OUTPUT_FILE = Path("India-Trend-Radar/data/processed/news_yake_keywords.csv")

# Create output directory if it doesn't exist
OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)


# Initialize YAKE

kw_extractor = yake.KeywordExtractor(
    lan="en",
    n=3,                # Maximum keyword length
    dedupLim=0.7,       # Remove similar keywords
    windowsSize=2,
    top=5               # Top 5 keywords
)


# Combine Title & Description

def combine_text(row):
    
    title = str(row["title"]).strip() if pd.notna(row["title"]) else ""
    description = str(row["description"]).strip() if pd.notna(row["description"]) else ""

    if not title:
        return description

    if not description:
        return title

    if title.lower() == description.lower():
        return title

    return f"{title} {description}"


# Extract Keywords using YAKE

def extract_keywords(text):
    

    if not text:
        return []

    keywords = kw_extractor.extract_keywords(text)

    # Return only keyword names
    return [keyword for keyword, score in keywords]


# Main Function

def run():

    # Load cleaned dataset
    df = pd.read_csv(INPUT_FILE)

    # Create combined text
    df["combined_text"] = df.apply(combine_text, axis=1)

    # Extract keywords
    df["keywords"] = df["combined_text"].apply(extract_keywords)

    # Save processed dataset
    df.to_csv(OUTPUT_FILE, index=False)

    print(f"Output saved to: {OUTPUT_FILE}")
    print("Keyword extraction completed successfully.")
   


if __name__ == "__main__":
    run()
