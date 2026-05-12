# ── Mental Health Condition Classifier ───────────────────
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

print("Loading SENTIMENT_MH dataset...")
df = pd.read_csv("data/raw/cat_h_specialist/SENTIMENT_MH/Combined Data.csv")
df = df.dropna(subset=['statement','status'])
df['statement'] = df['statement'].astype(str)

print(f"Shape: {df.shape}")
print(f"Conditions: {df['status'].value_counts().to_dict()}")

# Encode Labels
le = LabelEncoder()
df['label'] = le.fit_transform(df['status'])
print(f"\nLabel mapping: {dict(zip(le.classes_, range(len(le.classes_))))}")

# TF-IDF features
print("\nBuilding TF-IDF features...")
tfidf = TfidfVectorizer(max_features=10000, ngram_range=(1,2),
                        stop_words='english', min_df=2)

X = tfidf.fit_transform(df['statement'])
y = df['label'].values

X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

# Train
print("\nTraining Logistic Regression...")
lr = LogisticRegression(max_iter=1000, random_state=42, C=1.0)
lr.fit(X_tr, y_tr)
acc = accuracy_score(y_te, lr.predict(X_te))
print(f"Accuracy: {acc*100:.1f}%")
print(classification_report(y_te, lr.predict(X_te), target_names=le.classes_))

# Save
os.makedirs("models", exist_ok=True)
joblib.dump(lr,    "models/condition_classifier.pkl")
joblib.dump(tfidf, "models/condition_tfidf.pkl")
joblib.dump(le,    "models/condition_labels.pkl")

print("\n✓ Saved: models/condition_classifier.pkl")
print(f"✓ Detects: {list(le.classes_)}")