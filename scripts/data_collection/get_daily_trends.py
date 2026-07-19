import feedparser


def get_daily_trends():

    url = "https://trends.google.com/trending/rss?geo=IN"

    feed = feedparser.parse(url)

    keywords = []

    for entry in feed.entries[:20]:
        keywords.append(entry.title)

    return keywords


if __name__ == "__main__":

    trends = get_daily_trends()

    print("Today's Top 20 Trending Searches in India\n")

    for i, trend in enumerate(trends, start=1):
        print(f"{i}. {trend}")