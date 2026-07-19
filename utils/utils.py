import re
from collections import Counter
import sys
import logging

sys.stdout.reconfigure(encoding='utf-8')

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger("IndiaTrendRadar")

STOPWORDS = {
    "the","is","and","a","an","in","on","at","to","for","of","by","with",
    "how","what","why","this","that","after","before","i","pm","am",
    "us","uk","it","as","be","or","we","they","he","she","you","from"
}

def extract_keywords(text: str):
    if not text:
        return ""

    # STEP 1: normalize text (removes encoding garbage)
    text = text.encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip().lower()

    # STEP 2: extract words
    words = text.split()

    cleaned = []
    for w in words:
        # filter noise
        if len(w) < 4:
            continue
        if w in STOPWORDS:
            continue
        if w.isdigit():
            continue
        cleaned.append(w)

    if not cleaned:
        return ""

    # STEP 3: frequency ranking
    freq = Counter(cleaned)
    top = [w for w, _ in freq.most_common(3)]

    return ", ".join(top)

def generate_news_key(title: str):
    if not title:
        return ""

    title = title.lower()
    title = re.sub(r"[^a-zA-Z\s]", "", title)
    title = re.sub(r"\s+", " ", title).strip()

    noise = ["india", "news", "breaking", "live"]
    words = [w for w in title.split() if w not in noise]

    return " ".join(words[:6])