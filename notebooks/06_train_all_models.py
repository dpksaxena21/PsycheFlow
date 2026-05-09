# ── Train All Psychological Models ───────────────────────
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
from xgboost import XGBClassifier

df = pd.read_csv("data/processed/master_dataset.csv")
os.makedirs("models", exist_ok=True)

targets = ['Extraversion','Neuroticism','Agreeableness',
           'Conscientiousness','Openness',
           'Machiavellianism','Narcissism','Psychopathy']

# Label encode all targets into Low/Medium/High
for t in targets:
    df[t+'_label'] = pd.qcut(df[t], q=3, labels=[0,1,2]).astype(int)

results = {}

for trait in targets:
    feat_cols = ['age','gender'] + [t for t in targets if t != trait]
    X = df[feat_cols].values
    y = df[trait+'_label'].values

    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y)

    sc = StandardScaler()
    X_tr = sc.fit_transform(X_tr)
    X_te  = sc.transform(X_te)

    model = XGBClassifier(
        n_estimators=200, learning_rate=0.05,
        max_depth=6, random_state=42,
        eval_metric='mlogloss', verbosity=0)

    model.fit(X_tr, y_tr)
    acc = accuracy_score(y_te, model.predict(X_te))

    joblib.dump(model, f"models/{trait}_xgb.pkl")
    joblib.dump(sc,    f"models/{trait}_scaler.pkl")

    results[trait] = acc
    print(f"  {trait:20s}: {acc*100:.1f}%")

print("\n--- FINAL RESULTS ---")
for trait, acc in results.items():
    bar = "█" * int(acc * 40)
    print(f"  {trait:20s}: {acc*100:.1f}% {bar}")