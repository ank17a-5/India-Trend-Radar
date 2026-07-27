import pandas as pd
import csv
from config import NEWS_DATA
from sentence_transformers import SentenceTransformer
from bertopic import BERTopic

# Load cleaned news data
df = pd.read_csv(
    NEWS_DATA,
    encoding="utf-8",
    skipinitialspace=True,
    on_bad_lines="skip"
)

# Clean column names and string values
df.columns = df.columns.str.strip()

for col in df.columns:
    if df[col].dtype == "object":
        df[col] = df[col].str.strip()

print(f"Total Articles: {len(df)}")

# Create document column
df["document"] = (
    df["title"].fillna("").astype(str)
    + ". "
    + df["description"].fillna("").astype(str)
)

# Remove empty documents
df = df[df["document"].str.strip() != ""]

documents = df["document"].tolist()

print(f"Documents Ready: {len(documents)}")

# Load embedding model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# Initialize BERTopic
topic_model = BERTopic(
    embedding_model=embedding_model,
    calculate_probabilities=True,
    verbose=True
)

print("Running BERTopic...\n")

# Train BERTopic
topics, probabilities = topic_model.fit_transform(documents)

# Reduce outliers
topics = topic_model.reduce_outliers(
    documents,
    topics,
    strategy="embeddings"
)

# Update topic representations
topic_model.update_topics(documents, topics=topics)

# Assign updated topics
df["topic"] = topics

# Check remaining outliers
print(f"Remaining Outliers: {(df['topic'] == -1).sum()}")

# Get topic information
topic_info = topic_model.get_topic_info()

# Merge topic details with each article
final_df = df.merge(
    topic_info[["Topic", "Name", "Count"]],
    left_on="topic",
    right_on="Topic",
    how="left"
)

# Remove duplicate Topic column
final_df.drop(columns=["Topic","document"], inplace=True)

# Remove unwanted newlines/tabs
for col in final_df.select_dtypes(include="object").columns:
    final_df[col] = (
        final_df[col]
        .fillna("")
        .str.replace(r"[\r\n\t]+", " ", regex=True)
        .str.strip()
    )

final_df["keyword"] = final_df["keyword"].str.replace(",", " | ", regex=False)

# Save CSV safely
final_df.to_csv(
    "topic_modeling/output/news_with_topics.csv",
    index=False,
    encoding="utf-8",
    quoting=csv.QUOTE_ALL
)

print("BERTopic training completed.")
print("Output saved: topic_modeling/output/news_with_topics.csv")

print("BERTopic training completed.")
print("Files saved successfully.")