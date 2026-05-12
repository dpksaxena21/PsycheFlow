# ── Expanded Condition Models ─────────────────────────────
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

os.makedirs("models", exist_ok=True)

# ── 1. CONDITION CLASSIFIER (already done, reload) ────────
print("=" * 50)
print("1. Text-Based Condition Classifier (existing)")
print("   Detects: Anxiety, Bipolar, Depression, Normal,")
print("   Personality disorder, Stress, Suicidal")
print("   Accuracy: 76.2% ✓")

# ── 2. WORKPLACE MENTAL HEALTH MODEL ──────────────────────
print("\n" + "=" * 50)
print("2. Workplace Mental Health Model (MH_GENERAL)")
df = pd.read_csv("data/raw/cat_h_specialist/MH_GENERAL/Mental Health Dataset.csv")
df = df.dropna(subset=['treatment'])

# Binary features
binary_cols = ['self_employed','family_history','treatment',
               'Growing_Stress','Changes_Habits','Mental_Health_History',
               'Coping_Struggles','Work_Interest','Social_Weakness']

for col in binary_cols:
    if col in df.columns:
        df[col] = df[col].map({'Yes':1,'No':0}).fillna(0)

# Gender encode
df['Gender_enc'] = df['Gender'].str.lower().map(
    {'male':0,'female':1,'m':0,'f':1}).fillna(0)

# Mood swings encode
mood_map = {'Low':0,'Medium':1,'High':2}
df['Mood_enc'] = df['Mood_Swings'].map(mood_map).fillna(1)

# Days indoors encode
days_map = {'1-14 days':0,'15-30 days':1,'31-60 days':2,
            'More than 2 months':3,'Go out Every day':0}
df['Days_enc'] = df['Days_Indoors'].map(days_map).fillna(0)

feat_cols = ['Gender_enc','self_employed','family_history',
             'Growing_Stress','Changes_Habits','Mental_Health_History',
             'Mood_enc','Coping_Struggles','Work_Interest',
             'Social_Weakness','Days_enc']

X = df[feat_cols].values
y = df['treatment'].values

X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.2, random_state=42)

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_tr, y_tr)
acc = accuracy_score(y_te, rf.predict(X_te))
print(f"   Accuracy: {acc*100:.1f}%")
print(f"   Features: {feat_cols}")

joblib.dump(rf, "models/workplace_mh_model.pkl")
joblib.dump(feat_cols, "models/workplace_mh_features.pkl")
print("   ✓ Saved: models/workplace_mh_model.pkl")

# ── 3. STUDENT MENTAL HEALTH MODEL ────────────────────────
print("\n" + "=" * 50)
print("3. Student Mental Health Model")
df_s = pd.read_csv(
    "data/raw/cat_h_specialist/STUDENT/Student Mental health.csv")
df_s = df_s.dropna(subset=['Do you have Depression?'])

df_s['gender_enc'] = df_s['Choose your gender'].map(
    {'Male':0,'Female':1}).fillna(0)
df_s['depression'] = df_s['Do you have Depression?'].map(
    {'Yes':1,'No':0}).fillna(0)
df_s['anxiety'] = df_s['Do you have Anxiety?'].map(
    {'Yes':1,'No':0}).fillna(0)
df_s['panic'] = df_s['Do you have Panic attack?'].map(
    {'Yes':1,'No':0}).fillna(0)
df_s['married'] = df_s['Marital status'].map(
    {'Yes':1,'No':0}).fillna(0)
df_s['age'] = df_s['Age'].fillna(20)

# Multi-label: predict all 3 conditions
feat_s = ['gender_enc','age','married']
for col in feat_s:
    df_s[col] = pd.to_numeric(df_s[col], errors='coerce').fillna(0)

X_s = df_s[feat_s].values

results_s = {}
for target in ['depression','anxiety','panic']:
    y_s = df_s[target].values
    X_tr, X_te, y_tr, y_te = train_test_split(
        X_s, y_s, test_size=0.2, random_state=42)
    clf = LogisticRegression(random_state=42, max_iter=500)
    clf.fit(X_tr, y_tr)
    acc = accuracy_score(y_te, clf.predict(X_te))
    results_s[target] = acc
    joblib.dump(clf, f"models/student_{target}_model.pkl")
    print(f"   {target}: {acc*100:.1f}%")

print("   ✓ Saved student models")

# ── 4. FAMILY HISTORY RISK MODEL ──────────────────────────
print("\n" + "=" * 50)
print("4. Family History + Risk Model (OSMI)")
df_o = pd.read_csv("data/raw/cat_h_specialist/OSMI/survey.csv")
df_o = df_o.dropna(subset=['treatment'])

df_o['treatment'] = df_o['treatment'].map({'Yes':1,'No':0})
df_o['family_history'] = df_o['family_history'].map({'Yes':1,'No':0})
df_o['self_employed'] = df_o['self_employed'].map({'Yes':1,'No':0}).fillna(0)
df_o['work_interfere'] = df_o['work_interfere'].map(
    {'Never':0,'Rarely':1,'Sometimes':2,'Often':3}).fillna(1)
df_o['age'] = pd.to_numeric(df_o['Age'], errors='coerce').fillna(30)
df_o['gender_enc'] = df_o['Gender'].str.lower().map(
    {'male':0,'female':1,'m':0,'f':1}).fillna(0)

feat_o = ['age','gender_enc','family_history',
          'self_employed','work_interfere']
df_o = df_o.dropna(subset=feat_o)

X_o = df_o[feat_o].values
y_o = df_o['treatment'].values

X_tr, X_te, y_tr, y_te = train_test_split(
    X_o, y_o, test_size=0.2, random_state=42)

xgb = XGBClassifier(n_estimators=100, random_state=42,
                    eval_metric='logloss', verbosity=0)
xgb.fit(X_tr, y_tr)
acc = accuracy_score(y_te, xgb.predict(X_te))
print(f"   Treatment likelihood: {acc*100:.1f}%")

joblib.dump(xgb, "models/treatment_risk_model.pkl")
joblib.dump(feat_o, "models/treatment_risk_features.pkl")
print("   ✓ Saved: models/treatment_risk_model.pkl")

# ── SUMMARY ───────────────────────────────────────────────
print("\n" + "=" * 50)
print("MODELS SUMMARY")
print("=" * 50)
models_list = [
    ("Personality — Big Five",      "8 traits", "XGBoost"),
    ("Dark Triad",                  "3 traits", "XGBoost"),
    ("Text Condition Classifier",   "7 conditions", "LogReg+TF-IDF"),
    ("Workplace Mental Health",     "treatment needed", "RandomForest"),
    ("Student Depression",          "yes/no", "LogReg"),
    ("Student Anxiety",             "yes/no", "LogReg"),
    ("Student Panic",               "yes/no", "LogReg"),
    ("Treatment Risk",              "likelihood", "XGBoost"),
]
for name, output, algo in models_list:
    print(f"  ✓ {name:35s} → {output:20s} [{algo}]")

print(f"\nTotal models: {len(models_list) + 5} (including Big Five individual)")