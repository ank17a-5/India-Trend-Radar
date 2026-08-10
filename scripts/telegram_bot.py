import os
import logging
from datetime import datetime
import pandas as pd
import requests
from dotenv import load_dotenv

load_dotenv("../.env.txt" if os.path.basename(os.getcwd()) == "scripts" else ".env.txt")

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

# TODO(Anushka): Per task table, this bot should pull data from the FastAPI
# backend (Shubham's API + Atharva's data integration layer), not read CSVs
# directly. Using local CSVs for now since the backend isn't ready yet.
# Swap these two lines for API calls (e.g. requests.get(BACKEND_URL + "/trending"))
# once the endpoints are live. Keep get_top_trends()/get_predicted_viral()
# signatures the same so the rest of the script doesn't need to change.
FEATURES_PATH = "data/features/master_trend_features.csv"
PREDICTIONS_PATH = "data/predictions/virality_predictions.csv"

def clean_keyword(raw: str) -> str:
    """Take the first tag from a pipe/comma-separated keyword string and title-case it."""
    first = raw.replace(",", "|").split("|")[0].strip()
    return first.title() if first else raw


def get_top_trends(n: int = 5) -> pd.DataFrame:
    df = pd.read_csv(FEATURES_PATH, encoding="utf-8-sig")
    df_sorted = df.sort_values("trend_score", ascending=False).copy()
    df_sorted["display_name"] = df_sorted["keyword"].apply(clean_keyword)

    max_score = df["trend_score"].max()
    df_sorted["score_100"] = (df_sorted["trend_score"] / max_score * 100).round(1)

    # Deduplicate by display_name, keeping the highest-scoring row for each topic
    deduped = df_sorted.drop_duplicates(subset="display_name", keep="first")
    return deduped.head(n)

def get_predicted_viral(n: int = 5) -> pd.DataFrame:
    df = pd.read_csv(PREDICTIONS_PATH, encoding="utf-8-sig")
    viral = df[df["predicted_viral"] == 1].sort_values("viral_probability", ascending=False).head(n).copy()
    viral["display_name"] = viral["keyword"].apply(clean_keyword)
    return viral


def build_message() -> str:
    top_trends = get_top_trends(5)
    viral = get_predicted_viral(5)
    today = datetime.now().strftime("%d %b %Y")

    lines = ["📈 *India Trend Radar - Daily Update*", ""]

    lines.append("🔥 *Top Trending Topics*")
    for i, row in enumerate(top_trends.itertuples(), 1):
        lines.append(f"{i}. {row.display_name}")
    lines.append("")

    if not viral.empty:
        lines.append("🚀 *Predicted Viral Topics*")
        for row in viral.itertuples():
            lines.append(f"• {row.display_name}")
        lines.append("")
    else:
        lines.append("🚀 *Predicted Viral Topics*")
        lines.append("• None predicted today")
        lines.append("")

    if not top_trends.empty:
        best = top_trends.iloc[0]
        lines.append("📊 *Highest India Trend Score*")
        lines.append(f"• {best['display_name']} - {best['score_100']}")
        lines.append("")

    lines.append(f"📅 Generated: {today}")

    return "\n".join(lines)


def send_telegram_message(text: str):
    if not BOT_TOKEN or not CHAT_ID:
        logger.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env.txt")
        return
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {"chat_id": CHAT_ID, "text": text, "parse_mode": "Markdown"}
    resp = requests.post(url, data=payload, timeout=15)
    if resp.status_code == 200:
        logger.info("Daily summary sent successfully")
    else:
        logger.error(f"Failed to send message: {resp.status_code} {resp.text}")


def run():
    logger.info("Building daily trend summary")
    message = build_message()
    logger.info(f"Message preview:\n{message}")
    send_telegram_message(message)


if __name__ == "__main__":
    run()