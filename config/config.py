import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from config/.env (for local development)
load_dotenv("config/.env")


# ---------------- Google Trends Configuration ----------------

GOOGLE_TRENDS = {
    "geo": "IN",
    "timeframe": "today 1-m",
    "language": "en-US",
    "timezone": 330,
}


# ---------------- News Configuration ----------------

class Config:
    """
    Configuration for News APIs.
    """

    NEWS_API_KEY = os.getenv("NEWS_API_KEY")
    GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")
    NEWS_RETENTION_DAYS = int(os.getenv("NEWS_RETENTION_DAYS", 30))

    @classmethod
    def validate(cls):
        required = {
            "NEWS_API_KEY": cls.NEWS_API_KEY,
            "GNEWS_API_KEY": cls.GNEWS_API_KEY,
        }

        missing = [key for key, value in required.items() if not value]

        if missing:
            raise EnvironmentError(
                f"Missing environment variables: {', '.join(missing)}"
            )

        print("✅ News configuration loaded successfully.")

# Base directory
BASE_DIR = Path(__file__).resolve().parent

# Data paths
NEWS_DATA = BASE_DIR / "data" / "news_clean.csv"
# REDDIT_DATA = BASE_DIR / "data" / "cleaned_reddit.csv"

# Output paths
OUTPUT_DIR = BASE_DIR / "output"
TOPIC_INFO = OUTPUT_DIR / "topic_info.csv"
TOPIC_ASSIGNMENTS = OUTPUT_DIR / "topic_assignments.csv"

# Model directory
MODEL_DIR = BASE_DIR / "models"

# Embedding model
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
