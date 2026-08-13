import os
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


def clean_keyword(raw: str) -> str:
    first = raw.replace(",", "|").split("|")[0].strip()
    return first.title() if first else raw


def get_top_trends(n: int = 10) -> pd.DataFrame:
    df = pd.read_csv(FEATURES_PATH, encoding="utf-8-sig")
    df_sorted = df.sort_values("trend_score", ascending=False).copy()
    df_sorted["display_name"] = df_sorted["keyword"].apply(clean_keyword)
    max_score = df["trend_score"].max()
    df_sorted["score_100"] = (df_sorted["trend_score"] / max_score * 100).round(1)
    deduped = df_sorted.drop_duplicates(subset="display_name", keep="first")
    return deduped.head(n)


def get_predicted_viral(n: int = 10) -> pd.DataFrame:
    df = pd.read_csv(PREDICTIONS_PATH, encoding="utf-8-sig")
    viral = df[df["predicted_viral"] == 1].sort_values("viral_probability", ascending=False).copy()
    viral["display_name"] = viral["keyword"].apply(clean_keyword)
    deduped = viral.drop_duplicates(subset="display_name", keep="first")
    return deduped.head(n)


def build_pdf(path: str):
    top_trends = get_top_trends(10)
    viral = get_predicted_viral(10)

    today = datetime.now()
    week_start = (today - timedelta(days=7)).strftime("%d %b %Y")
    week_end = today.strftime("%d %b %Y")

    os.makedirs(REPORTS_DIR, exist_ok=True)
    doc = SimpleDocTemplate(path, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("India Trend Radar - Weekly Report", styles["Title"]))
    story.append(Paragraph(f"{week_start} - {week_end}", styles["Normal"]))
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
        story.append(Paragraph("No topics predicted viral this week.", styles["Normal"]))
    story.append(Spacer(1, 20))

    if not top_trends.empty:
        best = top_trends.iloc[0]
        story.append(Paragraph("Highest India Trend Score", styles["Heading2"]))
        story.append(Paragraph(f"{best['display_name']} - {best['score_100']}", styles["Normal"]))
        story.append(Spacer(1, 20))

    story.append(Paragraph(f"Generated: {today.strftime('%d %b %Y')}", styles["Normal"]))

    doc.build(story)
    logger.info(f"PDF report saved: {path}")


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
        logger.info("Weekly report sent successfully via Telegram")
    else:
        logger.error(f"Failed to send report: {resp.status_code} {resp.text}")


def run():
    today_str = datetime.now().strftime("%Y-%m-%d")
    pdf_path = os.path.join(REPORTS_DIR, f"weekly_report_{today_str}.pdf")

    logger.info("Building weekly trend report")
    build_pdf(pdf_path)
    send_telegram_document(pdf_path, "India Trend Radar - Weekly Report")


if __name__ == "__main__":
    run()