import os
import sys
import logging
from datetime import datetime, timedelta
import pandas as pd
import requests
from dotenv import load_dotenv
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch

load_dotenv("../.env.txt" if os.path.basename(os.getcwd()) == "scripts" else ".env.txt")

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

# TODO(Anushka): Same as telegram_bot.py — swap these for backend API calls
# (Shubham's FastAPI + Atharva's data layer) once that integration is ready.
FEATURES_PATH = "data/features/master_trend_features.csv"
PREDICTIONS_PATH = "data/predictions/virality_predictions.csv"

REPORTS_DIR = "reports"

# Matches the date_range convention already used by the frontend (src/services/api.ts),
# e.g. fetchRisingTrends(dateRange) sends values like "7d", "30d" to the backend.
DATE_RANGE_TO_DAYS = {
    "1d": 1,
    "7d": 7,
    "30d": 30,
    "90d": 90,
}
DEFAULT_DATE_RANGE = "7d"


def parse_date_range(date_range: str) -> int:
    """Convert a date_range string like '7d' into a number of days.
    Falls back to the default (7 days) if the value isn't recognized,
    with a warning logged so a bad value from the frontend doesn't fail silently.
    """
    days = DATE_RANGE_TO_DAYS.get(date_range)
    if days is None:
        logger.warning(
            f"Unrecognized date_range '{date_range}', falling back to default "
            f"'{DEFAULT_DATE_RANGE}' ({DATE_RANGE_TO_DAYS[DEFAULT_DATE_RANGE]} days)"
        )
        return DATE_RANGE_TO_DAYS[DEFAULT_DATE_RANGE]
    return days


def clean_keyword(raw: str) -> str:
    first = raw.replace(",", "|").split("|")[0].strip()
    return first.title() if first else raw


def get_top_trends(days: int, n: int = 10) -> pd.DataFrame:
    df = pd.read_csv(FEATURES_PATH, encoding="utf-8-sig")

    # Filter to rows with news activity within the selected date range.
    # latest_news_time is the closest available per-row timestamp in this file.
    if "latest_news_time" in df.columns:
        cutoff = datetime.now() - timedelta(days=days)
        df["latest_news_time"] = pd.to_datetime(df["latest_news_time"], errors="coerce")
        before = len(df)
        df = df[df["latest_news_time"] >= cutoff]
        logger.info(
            f"Filtered top trends to last {days} day(s): {before} -> {len(df)} rows"
        )

    df_sorted = df.sort_values("trend_score", ascending=False).copy()
    df_sorted["display_name"] = df_sorted["keyword"].apply(clean_keyword)
    max_score = df["trend_score"].max() if not df.empty else 1
    df_sorted["score_100"] = (df_sorted["trend_score"] / max_score * 100).round(1)
    deduped = df_sorted.drop_duplicates(subset="display_name", keep="first")
    return deduped.head(n)


def get_predicted_viral(days: int, n: int = 10) -> pd.DataFrame:
    df = pd.read_csv(PREDICTIONS_PATH, encoding="utf-8-sig")

    # prediction_date exists on newer runs (added for exactly this kind of filtering).
    # If it's missing (older cached file), skip date filtering rather than erroring out.
    if "prediction_date" in df.columns:
        cutoff = datetime.now() - timedelta(days=days)
        df["prediction_date"] = pd.to_datetime(df["prediction_date"], errors="coerce")
        before = len(df)
        df = df[df["prediction_date"] >= cutoff]
        logger.info(
            f"Filtered predicted viral topics to last {days} day(s): {before} -> {len(df)} rows"
        )
    else:
        logger.warning("prediction_date column not found — showing all predictions, unfiltered by date")

    viral = df[df["predicted_viral"] == 1].sort_values("viral_probability", ascending=False).copy()
    viral["display_name"] = viral["keyword"].apply(clean_keyword)
    deduped = viral.drop_duplicates(subset="display_name", keep="first")
    return deduped.head(n)


def build_pdf(path: str, date_range: str = DEFAULT_DATE_RANGE):
    days = parse_date_range(date_range)

    top_trends = get_top_trends(days, 10)
    viral = get_predicted_viral(days, 10)

    today = datetime.now()
    range_start = (today - timedelta(days=days)).strftime("%d %b %Y")
    range_end = today.strftime("%d %b %Y")

    os.makedirs(REPORTS_DIR, exist_ok=True)
    doc = SimpleDocTemplate(path, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("India Trend Radar - Report", styles["Title"]))
    story.append(Paragraph(f"{range_start} - {range_end}  (range: {date_range})", styles["Normal"]))
    story.append(Spacer(1, 20))

    story.append(Paragraph("Top Trending Topics", styles["Heading2"]))
    trend_data = [["Rank", "Topic", "Trend Score"]]
    for i, row in enumerate(top_trends.itertuples(), 1):
        trend_data.append([str(i), row.display_name, f"{row.score_100}"])
    trend_table = Table(trend_data, colWidths=[0.7 * inch, 3 * inch, 1.5 * inch])
    trend_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2c3e50")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f2f2f2")]),
    ]))
    story.append(trend_table)
    story.append(Spacer(1, 20))

    story.append(Paragraph("Predicted Viral Topics", styles["Heading2"]))
    if not viral.empty:
        viral_data = [["Topic", "Viral Probability"]]
        for row in viral.itertuples():
            viral_data.append([row.display_name, f"{row.viral_probability:.4f}"])
        viral_table = Table(viral_data, colWidths=[3.5 * inch, 1.7 * inch])
        viral_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#c0392b")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f2f2f2")]),
        ]))
        story.append(viral_table)
    else:
        story.append(Paragraph(f"No topics predicted viral in the last {days} day(s).", styles["Normal"]))
    story.append(Spacer(1, 20))

    if not top_trends.empty:
        best = top_trends.iloc[0]
        story.append(Paragraph("Highest India Trend Score", styles["Heading2"]))
        story.append(Paragraph(f"{best['display_name']} - {best['score_100']}", styles["Normal"]))
        story.append(Spacer(1, 20))

    story.append(Paragraph(f"Generated: {today.strftime('%d %b %Y')}", styles["Normal"]))

    doc.build(story)
    logger.info(f"PDF report saved: {path} (date_range={date_range})")


def send_telegram_document(path: str, caption: str):
    if not BOT_TOKEN or not CHAT_ID:
        logger.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env.txt")
        return
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendDocument"
    with open(path, "rb") as f:
        files = {"document": f}
        data = {"chat_id": CHAT_ID, "caption": caption}
        resp = requests.post(url, data=data, files=files, timeout=30)
    if resp.status_code == 200:
        logger.info("Report sent successfully via Telegram")
    else:
        logger.error(f"Failed to send report: {resp.status_code} {resp.text}")


def run(date_range: str = DEFAULT_DATE_RANGE):
    today_str = datetime.now().strftime("%Y-%m-%d")
    pdf_path = os.path.join(REPORTS_DIR, f"report_{date_range}_{today_str}.pdf")

    logger.info(f"Building trend report for date_range={date_range}")
    build_pdf(pdf_path, date_range=date_range)
    send_telegram_document(pdf_path, f"India Trend Radar - Report ({date_range})")


if __name__ == "__main__":
    # Accept date_range as a command-line argument, e.g.:
    #   python -m scripts.weekly_report 30d
    # Falls back to the 7-day default if none is given.
    arg_date_range = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_DATE_RANGE
    run(date_range=arg_date_range)
