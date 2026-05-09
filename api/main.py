# ── PsycheFlow API v2 — 8 Psychological Models ───────────
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from journal_analysis import analyze_journal
app = FastAPI(title="PsycheFlow API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

targets = ['Extraversion','Neuroticism','Agreeableness',
           'Conscientiousness','Openness',
           'Machiavellianism','Narcissism','Psychopathy']

models, scalers = {}, {}
for t in targets:
    models[t]  = joblib.load(f"models/{t}_xgb.pkl")
    scalers[t] = joblib.load(f"models/{t}_scaler.pkl")

print("✓ All 8 models loaded")

class ProfileInput(BaseModel):
    age: float
    gender: int
    Extraversion: float
    Neuroticism: float
    Agreeableness: float
    Conscientiousness: float
    Openness: float
    Machiavellianism: float
    Narcissism: float
    Psychopathy: float

label_map = {0: "Low", 1: "Medium", 2: "High"}

@app.get("/")
def root():
    return {"status": "PsycheFlow API v2 running", "models": targets}

@app.post("/predict")
def predict(data: ProfileInput):
    results = {}
    d = data.dict()

    # Scale 1-5 scores to match training range (10-50 for Big Five, 9-45 for Dark Triad)
    scale_map = {
        'Extraversion': 10, 'Neuroticism': 10, 'Agreeableness': 10,
        'Conscientiousness': 10, 'Openness': 10,
        'Machiavellianism': 9, 'Narcissism': 9, 'Psychopathy': 9
    }

    for trait in targets:
        feat_cols = ['age','gender'] + [t for t in targets if t != trait]
        scaled_d = {k: v * scale_map.get(k, 1) for k, v in d.items()
                    if k in scale_map}
        scaled_d['age']    = d['age']
        scaled_d['gender'] = d['gender']

        X = np.array([[scaled_d['age'], scaled_d['gender']] +
                      [scaled_d[t] for t in targets if t != trait]])
        X_scaled = scalers[trait].transform(X)
        pred  = models[trait].predict(X_scaled)[0]
        proba = models[trait].predict_proba(X_scaled)[0]
        results[trait] = {
            "label":      label_map[int(pred)],
            "confidence": round(float(max(proba)) * 100, 1),
            "category":   "Big Five" if trait in ['Extraversion','Neuroticism',
                          'Agreeableness','Conscientiousness','Openness']
                          else "Dark Triad"
        }

    return {"predictions": results, "total_models": len(targets)}

class JournalInput(BaseModel):
    text: str

@app.post("/analyze-journal")
def journal_endpoint(data: JournalInput):
    if len(data.text.strip()) < 20:
        return {"error": "Please write at least a few sentences."}
    result = analyze_journal(data.text)
    return result