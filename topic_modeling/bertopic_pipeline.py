import pandas as pd
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

topics, probabilities = topic_model.fit_transform(documents)

# Assign topics
df["topic"] = topics

# Get topic information
topic_info = topic_model.get_topic_info()

# Save outputs
df.to_csv("topic_modeling/output/topic_assignments.csv", index=False)
topic_info.to_csv("topic_modeling/output/topic_info.csv", index=False)

print("BERTopic training completed.")
print("Files saved successfully.")