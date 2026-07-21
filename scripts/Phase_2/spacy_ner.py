import os
import pandas as pd
import spacy

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
    print("✅ spaCy model loaded successfully.")
except Exception as e:
    print("❌ Error loading spaCy model.")
    print(e)
    exit()

# File Paths
INPUT_FILE = "data/cleaned/news_clean.csv"
OUTPUT_DIR = "data/processed"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "news_with_ner.csv")


# Entity Extraction Function
def extract_entities(text):
    if pd.isna(text) or str(text).strip() == "":
        return ""

    doc = nlp(str(text))
    entities = []

    for ent in doc.ents:
        entities.append(f"{ent.text} ({ent.label_})")

    return ", ".join(entities)


# Count Entities
def count_entities(entity_string):
    if entity_string == "":
        return 0

    return len(entity_string.split(","))


# Main NER Function
def run_ner():
    # Create output directory if it doesn't exist
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Check input file
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Input file not found: {INPUT_FILE}")
        return

    # Read CSV
    print("📖 Reading cleaned news data...")
    df = pd.read_csv(INPUT_FILE)

    print(f"✅ Total News Articles: {len(df)}")

    # Check required columns
    required_columns = ["title", "description"]

    for col in required_columns:
        if col not in df.columns:
            print(f"❌ Missing required column: {col}")
            return

    # Combine title and description
    df["text"] = (
        df["title"].fillna("") + " " + df["description"].fillna("")
    )

    # Apply NER
    print("🚀 Running spaCy NER...")
    df["entities"] = df["text"].apply(extract_entities)

    # Count entities
    df["entity_count"] = df["entities"].apply(count_entities)

    # Remove temporary column
    df.drop(columns=["text"], inplace=True)

    # Save Output
    df.to_csv(OUTPUT_FILE, index=False, encoding="utf-8-sig")

    print("\n==========================================")
    print("✅ NER Completed Successfully")
    print("==========================================")
    print(f"📄 Output File : {OUTPUT_FILE}")
    print(f"📰 Total Records : {len(df)}")
    print("==========================================")


if __name__ == "__main__":
    run_ner()
