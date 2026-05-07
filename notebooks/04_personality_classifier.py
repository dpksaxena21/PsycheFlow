""" 
PyscheFLow - Notebook 04 - First ML Model
Predicts Big Five personality traits from questionnaire responses
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, accuracy_score
import warnings
warnings.filterwarnings('ignore')

print("PyscheFlow - Personality Classifier")
print("=" * 50)

# ── Load Processed Data ────────────────────────────────────
# We use the cleaned, properly scored Big Five dataset
# that we created in notebook 02

df = pd.read_csv("data/processed/big5_scored.csv")
print(f"Loaded dataset: {df.shape[0]:,} people, {df.shape[1]} columns")
print(f"Columns: {df.columns.tolist()}")
print(f"\nFirst 3 rows:")
print(df.head(3))

print("PyscheFlow - Personality classifier")
print("=" * 50)

# ── Load Data ──────────────────────────────────────────────
df = pd.read_csv("data/processed/big5_scored.csv")
print(f"Loaded: {df.shape[0]:,} people, {df.shape[1]} columns")
print(f"columns: {df.columns.tolist()}")
print(f"\nSample data:")
print(df.head(3))
print(f"\nMissing values:")
print(df.isnull().sum())

# ── Create Target Labels ───────────────────────────────────
# Convert continuous scores into Low/Medium/High categories
# This is called discretisation

print("\n--- CREATING PERSONALITY LABELS ---")

# Drop the 1 missing value per trait
df = df.dropna()
print(f"After dropping missing: {len(df):,} people")

def score_to_label(score):
    if score < 2.5:
        return 0  # Low
    elif score <= 3.5:
        return 1  # Medium
    else:
        return 2  # High

traits = ['Extraversion', 'Neuroticism', 'Agreeableness',
          'Conscientiousness', 'Openness']

for trait in traits:
    label_col = trait + '_label'
    df[label_col] = df[trait].apply(score_to_label)
    counts = df[label_col].value_counts().sort_index()
    print(f"\n{trait}:")
    print(f"  Low (0):    {counts.get(0, 0):,} people ({counts.get(0,0)/len(df)*100:.1f}%)")
    print(f"  Medium (1): {counts.get(1, 0):,} people ({counts.get(1,0)/len(df)*100:.1f}%)")
    print(f"  High (2):   {counts.get(2, 0):,} people ({counts.get(2,0)/len(df)*100:.1f}%)")
    
# Build The Classifier

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, accuracy_score
import shap

print("\n--- BUILDING PERSONALITY CLASSIFIER ---")

# Features: age and gender help preeict personality
# Target: we predict Extraversion first, then all traits
features = ['age', 'gender', 'Extraversion', 'Neuroticism',
            'Agreeableness', 'Conscientiousness', 'Openness']

# We will train one model per trait
# Start with neuroticism - most important for mental health
target_trait = 'Neuroticism'
target_col = target_trait + '_label'

X = df[features].copy()
y = df[target_col].copy()

# Remove target trait from features when predicting it
# can't use Neuroticism score predict Neuroticism label)

X = df[['age', 'gender', 'Extraversion',
        'Agreeableness', 'Conscientiousness', 'Openness']].copy()

print(f"Predicting: {target_trait}")
print(f"Features: {X.columns.tolist()}")
print(f"Samples: {len(X):,}")

# ── Train/Test Split ───────────────────────────────────────
# 80% training, 20% testing
# random_state=42 means results are reproducible

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"\nTrain size: {len(X_train):,}")
print(f"Test size: {len(X_test):,}")

# ── Scale Features ─────────────────────────────────────────
# StandardScaler: converts all values to same scale
# mean=0, std=1 for each feature

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)
print("\nFeatures scaled successfully")

# ── Train Random Forest ────────────────────────────────────
print("\n---Training Random Forest---")
rf_model = RandomForestClassifier(
    n_estimators=100, 
    class_weight = 'balanced',
    random_state=42,
    n_jobs=-1
)

rf_model.fit(X_train, y_train)
rf_predictions = rf_model.predict(X_test)

rf_accuracy = accuracy_score(y_test, rf_predictions)
print(f"Random Forest Accuracy: {rf_accuracy:.3f} ({rf_accuracy*100:.1f}%)")
print("\nDetailed Report:")
print(classification_report(y_test, rf_predictions,
                            target_names=['Low', 'Medium', 'High']))

# ── Train XGBoost ──────────────────────────────────────────
print("\n--TRAINING XGBOOST---")
xgb_model = XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    random_state=42,
    eval_metric='mlogloss',
    verbosity=0
)
xgb_model.fit(X_train, y_train)
xgb_predictions = xgb_model.predict(X_test)

xgb_accuracy = accuracy_score(y_test, xgb_predictions)
print(f"XGBoost Accuracy: {xgb_accuracy:.3f} ({xgb_accuracy*100:.1f}%)")
print(classification_report(y_test, xgb_predictions,
                            target_names=['Low', 'Medium', 'High']))

# ── Compare Models ─────────────────────────────────────────
print("\n--- MODEL COMPARISON ---")
print(f"Random Forest: {rf_accuracy*100:.1f}%")
print(f"XGBoost: {xgb_accuracy*100:.1f}%")
winner = "Random Forest" if rf_accuracy > xgb_accuracy else "XGBoost"
print(f"Winner: {winner}")

# ── SHAP Explainability ────────────────────────────────────
print("\n--- SHAP EXPLAINABILITY ---")
print("Calculating which features drive Neuroticism predictions...")

feature_names = ['age', 'gender', 'Extraversion',
                 'Agreeableness', 'Conscientiousness', 'Openness']

explainer   = shap.TreeExplainer(xgb_model)
shap_values = explainer.shap_values(X_test[:100])

print("\nFeature Importance (which features matter most):")
importance = np.abs(shap_values).mean(axis=(0, 2)) \
             if len(shap_values.shape) == 3 \
             else np.abs(shap_values).mean(axis=0)

for name, imp in sorted(zip(feature_names, importance),
                        key=lambda x: x[1], reverse=True):
    bar = "█" * int(imp * 50)
    print(f"  {name:20s}: {imp:.3f} {bar}")