"""
scripts/Phase_4/telegram_bot.py
---------------------------
Member: Anushka — Daily Telegram Trend Digest

Sends a formatted daily summary to a Telegram chat, pulling from:
  - data/predictions/india_trend_score.csv  (top trends, viral predictions, trend score)
  - data/predictions/prophet_predictions.csv (forecast highlight)

SETUP REQUIRED BEFORE FIRST RUN:
1. Message @BotFather on Telegram, send /newbot, follow the prompts.
   You'll receive a bot token like: 123456789:ABCdefGhIJKlmNoPQRstuVWXyz
2. Add your new bot to the target group (or message it directly for a personal chat).
3. To find your chat_id: send any message to the bot/group, then visit
   https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates in a browser —
   look for "chat":{"id": ...} in the response.
4. Create a file named `.env` in the repo root (NOT committed — it's gitignored)
   containing:
       TELEGRAM_BOT_TOKEN=your_token_here
       TELEGRAM_CHAT_ID=your_chat_id_here

Run from the repo root:
    python -m scripts.Phase_4.telegram_bot
"""

import os
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
from telegram import Bot
import asyncio

from utils.utils import logger

load_dotenv()

TREND_SCORE_PATH = "data/predictions/india_trend_score.csv"
FORECAST_PATH = "data/predictions/prophet_predictions.csv"

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")


def load_trend_data(path: str = TREND_SCORE_PATH) -> pd.DataFrame:
    df = pd.read_csv(path, encoding="utf-8-sig")
    logger.info(f"Loaded {len(df)} rows from {path}")
    return df


def load_forecast(path: str = FORECAST_PATH) -> pd.DataFrame:
    try:
        df = pd.read_csv(path, encoding="utf-8-sig")
        logger.info(f"Loaded {len(df)} forecast rows from {path}")
        return df
    except FileNotFoundError:
        logger.warning(f"Forecast file not found at {path} — skipping forecast section")
        return pd.DataFrame()


def build_digest_message(trend_df: pd.DataFrame, forecast_df: pd.DataFrame) -> str:
    """Builds the formatted digest text, matching the agreed message format."""

    # --- Top 5 trending topics (by trend_rank, lower rank = higher trend) ---
    top5 = trend_df.sort_values("trend_rank").head(5)
    top5_lines = "\n".join(
        f"{i+1}. {row['keyword']}" for i, (_, row) in enumerate(top5.iterrows())
    )

    # --- Predicted viral topics ---
    viral = trend_df[trend_df["predicted_viral"] == 1].sort_values(
        "viral_probability", ascending=False
    ).head(5)
    if len(viral) > 0:
        viral_lines = "\n".join(f"• {kw}" for kw in viral["keyword"])
    else:
        viral_lines = "• None predicted today"

    # --- Highest India Trend Score ---
    top_score_row = trend_df.sort_values("india_trend_score", ascending=False).iloc[0]
    top_score_line = f"• {top_score_row['keyword']} - {top_score_row['india_trend_score']:.1f}"

    # --- Forecast highlight (overall, not per-keyword — see note in load_forecast) ---
    if not forecast_df.empty:
        latest = forecast_df.iloc[-1]
        forecast_line = f"• Next forecast value: {latest['yhat']:.4f} (as of {latest['ds']})"
    else:
        forecast_line = "• Forecast data unavailable"

    today_str = datetime.now().strftime("%d %b %Y")

    message = (
        "📈 *India Trend Radar - Daily Update*\n\n"
        "🔥 *Top Trending Topics*\n"
        f"{top5_lines}\n\n"
        "🚀 *Predicted Viral Topics*\n"
        f"{viral_lines}\n\n"
        "📊 *Highest India Trend Score*\n"
        f"{top_score_line}\n\n"
        "📅 *Forecast Highlight*\n"
        f"{forecast_line}\n\n"
        f"📅 Generated: {today_str}"
    )
    return message


async def send_message(message: str):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        raise ValueError(
            "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing. "
            "Add them to your .env file — see the setup instructions at the top of this file."
        )
    bot = Bot(token=TELEGRAM_BOT_TOKEN)
    await bot.send_message(chat_id=TELEGRAM_CHAT_ID, text=message, parse_mode="Markdown")


def run():
    logger.info("Telegram daily digest — started")

    trend_df = load_trend_data()
    forecast_df = load_forecast()

    message = build_digest_message(trend_df, forecast_df)
    logger.info("Digest message built:\n" + message)

    asyncio.run(send_message(message))
    logger.info("Telegram daily digest — sent successfully")


if __name__ == "__main__":
    run()
