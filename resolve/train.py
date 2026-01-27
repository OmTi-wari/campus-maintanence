import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib
import os

# Load dataset
df = pd.read_csv("data/tickets.csv")

# Features and labels
X = df["complaint"]
y_category = df["category"]
y_priority = df["priority"]

# Convert text to numbers
vectorizer = TfidfVectorizer(
    stop_words="english",
    ngram_range=(1, 2)  # improves understanding of phrases
)

X_vec = vectorizer.fit_transform(X)

# Train category model
category_model = LogisticRegression(max_iter=1000)
category_model.fit(X_vec, y_category)

# Train priority model
priority_model = LogisticRegression(max_iter=1000)
priority_model.fit(X_vec, y_priority)

# Create model folder
os.makedirs("model", exist_ok=True)

# Save everything
joblib.dump(vectorizer, "model/vectorizer.pkl")
joblib.dump(category_model, "model/category_model.pkl")
joblib.dump(priority_model, "model/priority_model.pkl")

print("✅ Training complete. Models saved successfully.")
