# ── PsycheFlow API v2 ─────────────────────────────────────
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
from dotenv import load_dotenv

load_dotenv(dotenv_path="/mnt/d/Projects/PsycheFlow/.env")

from journal_analysis import analyze_journal
from report_generator import generate_full_report

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

cond_model  = joblib.load("models/condition_classifier.pkl")
cond_tfidf  = joblib.load("models/condition_tfidf.pkl")
cond_labels = joblib.load("models/condition_labels.pkl")

print("✓ All models loaded")

label_map = {0: "Low", 1: "Medium", 2: "High"}

# ── Input Models ──────────────────────────────────────────
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

class JournalInput(BaseModel):
    text: str

class TextInput(BaseModel):
    text: str

class ReportInput(BaseModel):
    predictions: dict
    phq_score: int
    gad_score: int
    age: float
    gender: int

# ── Endpoints ─────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "PsycheFlow API v2 running", "models": targets}

@app.post("/predict")
def predict(data: ProfileInput):
    results = {}
    d = data.dict()

    scale_map = {
        'Extraversion': 10, 'Neuroticism': 10, 'Agreeableness': 10,
        'Conscientiousness': 10, 'Openness': 10,
        'Machiavellianism': 9, 'Narcissism': 9, 'Psychopathy': 9
    }

    for trait in targets:
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

@app.post("/analyze-journal")
def journal_endpoint(data: JournalInput):
    if len(data.text.strip()) < 20:
        return {"error": "Please write at least a few sentences."}

    result = analyze_journal(data.text)

    X = cond_tfidf.transform([data.text])
    pred  = cond_model.predict(X)[0]
    proba = cond_model.predict_proba(X)[0]
    label = cond_labels.inverse_transform([pred])[0]
    top3  = sorted(zip(cond_labels.classes_, proba),
                   key=lambda x: -x[1])[:3]

    result['condition_detection'] = {
        "primary_condition": label,
        "confidence": round(float(max(proba)) * 100, 1),
        "top3": [{"condition": c, "probability": round(p*100,1)}
                 for c, p in top3],
        "alert": label in ["Suicidal"] and max(proba) > 0.5
    }

    return result

@app.post("/classify-condition")
def classify_condition(data: TextInput):
    if len(data.text.strip()) < 5:
        return {"error": "Text too short"}
    X = cond_tfidf.transform([data.text])
    pred  = cond_model.predict(X)[0]
    proba = cond_model.predict_proba(X)[0]
    label = cond_labels.inverse_transform([pred])[0]
    top3  = sorted(zip(cond_labels.classes_,
                       proba), key=lambda x: -x[1])[:3]
    return {
        "condition":  label,
        "confidence": round(float(max(proba)) * 100, 1),
        "top3": [{"condition": c, "probability": round(p*100,1)}
                 for c, p in top3]
    }

@app.post("/generate-report")
def report_endpoint(data: ReportInput):
    result = generate_full_report(data.dict())
    return result

# ── Clinical Interview ────────────────────────────────────
class InterviewInput(BaseModel):
    messages: list
    turn: int

@app.post("/clinical-interview")
def clinical_interview(data: InterviewInput):
    messages = data.messages
    turn     = data.turn

    system_prompt = """You are Dr. PsycheFlow, a senior clinical psychologist conducting an initial intake interview. You are warm, empathetic, professional, and deeply skilled at drawing out clinically relevant information through natural conversation.

Your role:
- Conduct a thorough psychological intake interview over 10-12 turns
- Ask ONE focused question per response (never multiple questions at once)
- Build on what the person shares — ask natural follow-ups
- Cover these clinical domains progressively:
  1. Presenting problem (what brings them here)
  2. Duration and severity of symptoms  
  3. Mood and emotional state (depression, anxiety, stress)
  4. Sleep, appetite, energy levels
  5. Daily functioning (work, relationships, activities)
  6. Trauma history (gently, if relevant)
  7. Suicidal ideation (sensitively, if risk signals present)
  8. Social support and relationships
  9. Coping strategies (healthy and unhealthy)
  10. Goals for therapy — what they hope to achieve
  11. Family history of mental health
  12. Previous therapy or treatment

Clinical guidelines:
- Never give diagnoses — only gather information
- If suicidal ideation is mentioned, take it seriously and ask directly but gently
- Frame all questions conversationally, not like a form
- Reflect back what you hear to show understanding
- Use clinical curiosity — go deeper when something important emerges
- After turn 10, if you have enough information, end with a warm closing and generate assessment

After turn 10 or when you have sufficient information, respond with:
ASSESSMENT_READY: [your clinical summary]

The assessment should include:
- Primary presenting concerns
- Key symptoms identified
- Risk level (low/medium/high)
- Strengths observed
- Recommended focus areas
- Suggested therapeutic approach"""

    # Build message history for Claude
    claude_messages = []
    for msg in messages:
        if msg['role'] in ['user', 'assistant']:
            claude_messages.append({
                'role': msg['role'],
                'content': msg['content']
            })

    # Add turn guidance
    if turn >= 10:
        claude_messages.append({
            'role': 'user',
            'content': '[SYSTEM: You have gathered sufficient information. Wrap up warmly and generate the clinical assessment using ASSESSMENT_READY: format]'
        })

    import anthropic as _anthropic
    import os as _os
    _client = _anthropic.Anthropic(api_key=_os.getenv("CLAUDE_API_KEY"))

    response = _client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1000,
        system=system_prompt,
        messages=claude_messages[1:]  # skip the initial assistant message
    )

    reply = response.content[0].text.strip()

    # Check if assessment is ready
    if 'ASSESSMENT_READY:' in reply:
        parts = reply.split('ASSESSMENT_READY:')
        closing = parts[0].strip()
        assessment = parts[1].strip()
        return {
            'reply': closing if closing else "Thank you for sharing all of this with me. I've completed your clinical assessment.",
            'finished': True,
            'assessment': assessment
        }

    return {
        'reply': reply,
        'finished': False,
        'assessment': None
    }