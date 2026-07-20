
from bs4 import BeautifulSoup
import feedparser
import os
import csv
import pandas as pd
from gnews import GNews
from datetime import datetime
from langdetect import detect, LangDetectException
from utils.utils import( logger, extract_keywords)
from scripts.Cleaning.news_cleaning import clean_news
# RSS Collector
class RSSCollector:

    RSS_FEEDS = {
        "Times of India": "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
        "NDTV": "https://feeds.feedburner.com/ndtvnews-top-stories",
        "Hindustan Times": "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml",
        "India Today": "https://www.indiatoday.in/rss/home"
    }

    def fetch_news(self):
        news = []

        for source, url in self.RSS_FEEDS.items():

            feed = feedparser.parse(url)

            for entry in feed.entries:

                title = entry.get("title", "") or ""

                description = self._build_description(entry, title)

                url_link = entry.get("link")

                news.append({
                    "source_name": source,

                    "author": (
                        entry.get("author")
                        or entry.get("dc_creator")
                        or entry.get("creator")
                    ),

                    "title": title.strip(),

                    "description": description.strip() if description else None,

                    "url": url_link,

                    "keyword": self._extract_keyword(title),

                    "language": self._detect_language(title, description or ""),

                    "published_date": self._parse_date(entry),

                    "collected_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })

        return news

    def _extract_keyword(self, title: str):
        if not title:
            return None
        words = title.split()
        return words[0].lower() if words else None

    def _detect_language(self, title: str, description: str):
        text = f"{title} {description}".strip()

        if not text:
            return "unknown"

        try:
            return detect(text)
        except LangDetectException:
            return "unknown"

    def _parse_date(self, entry):
        try:
            if hasattr(entry, "published_parsed") and entry.published_parsed:
                return datetime(*entry.published_parsed[:6]).strftime("%Y-%m-%d %H:%M:%S")
        except:
            pass

        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def _build_description(self, entry, title):

        desc = entry.get("summary") or entry.get("description")

        if not desc and entry.get("content"):
            try:
                content_list = entry.get("content")
                if isinstance(content_list, list) and len(content_list) > 0:
                    desc = content_list[0].get("value")
            except:
                desc = None
        if desc:
            desc = BeautifulSoup(desc, "html.parser").get_text(" ", strip=True)

        return desc if desc else f"News article about: {title}"


# GNews Collector
class GNewsCollector:

    def __init__(self):
        self.client = GNews(language="en", country="IN", max_results=50)

    def fetch_news(self, query="India"):
        articles = self.client.get_news(query)

        news = []

        for item in articles:

            title = item.get("title", "") or ""

            description = self._build_description(item, title)

            news.append({
                "source_name": "GNews",
                "author": None,
                "title": title.strip(),
                "description": description.strip() if description else None,
                "url": item.get("url"),
                "keyword": query.lower(),
                "language": self._detect_language(title, description or ""),
                "published_date": self._parse_date(item.get("published date")),
                "collected_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })

        return news

    def _build_description(self, item, title):
        return item.get("description") or f"News article about: {title}"

    def _detect_language(self, title: str, description: str):
        text = f"{title} {description}".strip()

        if not text:
            return "unknown"

        try:
            return detect(text)
        except LangDetectException:
            return "unknown"

    def _parse_date(self, date_str):
        try:
            if date_str:
                return datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
        except:
            pass

        return datetime.now()


# News Manager
class NewsManager:

    def __init__(self):
        self.rss = RSSCollector()
        self.gnews = GNewsCollector()

    def fetch_all_news(self, query="India"):
        rss_news = self.rss.fetch_news()
        gnews_news = self.gnews.fetch_news(query)

        combined = rss_news + gnews_news

        seen = set()
        unique = []

        for article in combined:
            url = article.get("url")
            if not url or url in seen:
                continue
            seen.add(url)
            unique.append(article)

        return unique


# Pipeline
class NewsPipeline:

    def __init__(self):
        self.seen_urls = set()

    def is_trending(self, article):

        title = (article.get("title") or "").lower()
        desc = (article.get("description") or "").lower()
        text = f"{title} {desc}"

        if len(title.split()) < 5:
            return False

        junk_patterns = ["how to", "what is", "why does", "guide", "tips"]
        if any(p in text for p in junk_patterns):
            return False

        strong_words = [
            "breaking", "war", "crash", "attack",
            "india", "economy", "ai",
            "stock", "election", "court",
            "minister", "russia", "china", "budget"
        ]

        score = sum(2 for w in strong_words if w in text)

        if len(text.split()) > 12:
            score += 1

        return score >= 3

    def insert_bulk(self, articles):

        inserted = 0
        skipped = 0
        clean_articles = []

        if not articles:
            logger.warning("No articles received")
            return []

        trending = []

        for article in articles:

            title = article.get("title")
            url = article.get("url")

            if not title or not url:
                skipped += 1
                continue

            if url in self.seen_urls:
                skipped += 1
                continue

            self.seen_urls.add(url)

            if self.is_trending(article):
                trending.append(article)
            else:
                skipped += 1

        #trending = trending[:100]

        for article in trending:

            article["author"] = article.get("author") or None

            full_text = f"{article.get('title')} {article.get('description') or ''}"
            keywords = extract_keywords(full_text)
            article["keyword"] = keywords or "general, news"

            inserted += 1
            clean_articles.append(article)

        logger.info(f"Inserted: {inserted}")
        logger.info(f"Skipped: {skipped}")

        return clean_articles


# CSV Exporter
class CSVExporter:

    def __init__(self, output_dir="data/raw"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def export(self, articles):

        if not articles:
            logger.warning("No data to export.")
            return None

        file_path = os.path.join(self.output_dir, "news_raw.csv")

        df_new = pd.DataFrame(articles)

        if "id" in df_new.columns:
            df_new.drop(columns=["id"], inplace=True)

        df_new["author"] = df_new["author"].fillna("NaN")

        if os.path.exists(file_path):

            df_old = pd.read_csv(
                file_path,
                encoding="utf-8-sig",
                keep_default_na=False,
                on_bad_lines="skip"
            )

            # Clean column names
            df_old.columns = df_old.columns.str.strip().str.replace('"', '', regex=False)
            df_new.columns = df_new.columns.str.strip().str.replace('"', '', regex=False)

            # Keep only common columns
            common_cols = [col for col in df_new.columns if col in df_old.columns]

            df_old = df_old[common_cols]
            df_new = df_new[common_cols]

            df = pd.concat([df_old, df_new], ignore_index=True)


            df.drop_duplicates(subset=["url"], keep="last", inplace=True)

        else:
            df = df_new
        
        df = df.loc[:, ~df.columns.duplicated()]

        df.drop_duplicates(subset=["url"], keep="last", inplace=True)

        df.reset_index(drop=True, inplace=True)

        df["collected_at"] = pd.to_datetime(
            df["collected_at"],
            format="%Y-%m-%d %H:%M:%S",
            errors="coerce"
        )

        df.dropna(subset=["collected_at"], inplace=True)

        current_date = datetime.now()

        start_of_month = pd.Timestamp(
            year=current_date.year,
            month=current_date.month,
            day=1
        )

        next_month = start_of_month + pd.offsets.MonthBegin(1)

        df = df[
            (df["collected_at"] >= start_of_month) &
            (df["collected_at"] < next_month)
        ]

        df["published_date"] = pd.to_datetime(
            df["published_date"],
            errors="coerce"
        )
        df["published_date"] = df["published_date"].dt.strftime("%Y-%m-%d %H:%M:%S")

        df.sort_values(
            by="published_date",
            ascending=False,
            inplace=True
            )
        
        print("Before to_csv:", len(df))

        df.to_csv(
            file_path,
            index=False,
            encoding="utf-8-sig",
            quoting=csv.QUOTE_ALL
            )

        logger.info(f"CSV Exported : {len(df)} articles")

        return file_path

# MAIN RUN
def run():

    logger.info("Pipeline started")

    manager = NewsManager()

    articles = manager.fetch_all_news(query="India")

    logger.info(f"Fetched unified articles: {len(articles)}")

    pipeline = NewsPipeline()

    clean_articles = pipeline.insert_bulk(articles)

    exporter = CSVExporter()

    file_path = exporter.export(clean_articles)

    logger.info(f"CSV exported: {file_path}")
    
    clean_news()

    logger.info("Pipeline completed")


if __name__ == "__main__":
    run()

