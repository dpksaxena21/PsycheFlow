# ── PsycheFlow API v2 ─────────────────────────────────────
import sys as _sys
import os as _os
_sys.path.insert(0, _os.path.dirname(__file__))
from rag import get_relevant_context

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

    system_prompt = """You are Dr. PsycheFlow, a senior clinical psychologist conducting a comprehensive intake assessment. You have 20+ years experience. You are warm, empathetic, non-judgmental, and clinically precise.

MISSION: Conduct a thorough psychological intake covering all major clinical domains through natural conversation. This is NOT a form — it's a real clinical interview.

CONVERSATION RULES:
- Ask ONE focused question per response
- Build naturally on what the person shares
- Ask follow-up questions when something important emerges
- Never rush — depth over breadth
- Mirror the person's language and emotional tone
- Validate before probing deeper

CLINICAL DOMAINS TO COVER (adapt based on relevance):

DOMAIN 1 — PRESENTING PROBLEM
- What brings them here today
- Duration, severity, frequency
- What makes it worse/better
- Impact on daily life
- What they hope to achieve

DOMAIN 2 — MOOD & EMOTIONAL STATE
- Sadness, emptiness, hopelessness
- Guilt, worthlessness
- Mood fluctuations
- Emotional numbness
- Crying spells

DOMAIN 3 — ANXIETY & STRESS
- Worry patterns
- Physical anxiety symptoms
- Panic attacks
- Avoidance behaviors
- Current stressors

DOMAIN 4 — SLEEP & PHYSICAL
- Sleep quality and duration
- Appetite and weight changes
- Energy levels
- Physical health conditions
- Medications

DOMAIN 5 — SUICIDAL & SELF-HARM RISK
(Only ask if risk signals present — do so gently)
- Passive death wishes
- Active suicidal thoughts
- Plans or means
- Previous attempts
- Self-harm behaviors

DOMAIN 6 — TRAUMA HISTORY
(Introduce gently — "Some people find past experiences affect their current wellbeing")
- Childhood experiences
- Abuse (physical, emotional, sexual)
- Loss and grief
- Accidents or violence
- PTSD symptoms if trauma present

DOMAIN 7 — RELATIONSHIPS & SOCIAL
- Current relationship status
- Quality of relationships
- Family dynamics
- Social support
- Loneliness and isolation
- Work relationships

DOMAIN 8 — FAMILY & BACKGROUND
- Family mental health history
- Childhood environment
- Parental relationships
- Developmental history

DOMAIN 9 — SUBSTANCE USE
(Ask matter-of-factly, no judgment)
- Alcohol use
- Smoking
- Cannabis or other drugs
- Impact on functioning

DOMAIN 10 — DAILY FUNCTIONING
- Work/study performance
- Daily routine
- Exercise and diet
- Screen time and habits
- Financial stress

DOMAIN 11 — PSYCHIATRIC HISTORY
- Previous therapy
- Previous diagnoses
- Medications tried
- What helped and what didn't
- Hospitalizations

DOMAIN 12 — STRENGTHS & COPING
- Current coping strategies
- Personal strengths
- Support system
- Reasons for living
- Hobbies and interests

DOMAIN 13 — VALUES & GOALS (ACT-oriented)
- What matters most to them
- What kind of person they want to be
- What they would do if fear wasn't in charge
- Life areas most important to them

DOMAIN 14 — THERAPY PREFERENCES
- What they're hoping to get from this
- Preferred approach (structured vs exploratory)
- Motivation to change (0-10)
- Potential barriers

ADAPTIVE RULES:
- If PHQ-style answers suggest depression → probe Domain 2 and 5 deeper
- If anxiety mentioned → probe Domain 3 and panic attacks
- If trauma hinted → gently explore Domain 6
- If substance use mentioned → explore impact
- If suicidal ideation appears → prioritize safety assessment immediately

TURN MANAGEMENT:
- Turns 1-3: Presenting problem and immediate symptoms
- Turns 4-6: Deeper symptom exploration and history
- Turns 7-9: Background, relationships, trauma (if relevant)
- Turns 10-12: Strengths, coping, goals
- Turns 13-15: Psychiatric history, therapy preferences
- Turn 16+: Wrap up and generate assessment

After turn 15 OR when sufficient information gathered across all relevant domains:
Generate assessment using format: ASSESSMENT_READY: [assessment]

ASSESSMENT FORMAT:
Primary Presenting Concerns: [list]
Key Symptoms Identified: [list with severity]
Risk Level: [Low/Medium/High] — [brief rationale]
Trauma Indicators: [present/absent/suspected]
Substance Use: [present/absent/level]
Social Support: [strong/moderate/limited]
Strengths Observed: [list]
Recommended Therapeutic Approach: [CBT/ACT/DBT/Psychodynamic/Integrative]
Recommended Next Steps: [list]
Priority Focus Areas: [list]

CRITICAL SAFETY RULE:
If ANY suicidal ideation is expressed — immediately acknowledge, assess severity, provide crisis resources (iCall: 9152987821), and flag in assessment as HIGH RISK."""

    # Build message history for Claude
    claude_messages = []
    for msg in messages:
        if msg['role'] in ['user', 'assistant']:
            claude_messages.append({
                'role': msg['role'],
                'content': msg['content']
            })

    # Add turn guidance
    if turn >= 15:
        claude_messages.append({
            'role': 'user',
            'content': '[SYSTEM: You have gathered sufficient information. Wrap up warmly and generate the clinical assessment using ASSESSMENT_READY: format]'
        })

    import anthropic as _anthropic
    import os as _os
    _client = _anthropic.Anthropic(api_key=_os.getenv("CLAUDE_API_KEY"))

    response = _client.messages.create(
        model="claude-haiku-4-5-20251001",
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
    
class SOAPInput(BaseModel):
    session_data: dict
    patient_concern: str
    interview_assessment: str

@app.post("/generate-soap")
def generate_soap(data: SOAPInput):
    import anthropic as _anthropic
    import os as _os
    _client = _anthropic.Anthropic(api_key=_os.getenv("CLAUDE_API_KEY"))

    s = data.session_data
    phq = s.get('phq_score', 0)
    gad = s.get('gad_score', 0)

    prompt = f"""You are a clinical psychologist. Generate a professional SOAP note based on this session data.

Session Data:
- PHQ-9 Score: {phq} ({'Minimal' if phq<=4 else 'Mild' if phq<=9 else 'Moderate' if phq<=14 else 'Severe'})
- GAD-7 Score: {gad} ({'Minimal' if gad<=4 else 'Mild' if gad<=9 else 'Moderate' if gad<=14 else 'Severe'})
- Patient Concern: {data.patient_concern or 'Not specified'}
- Interview Assessment: {data.interview_assessment or 'Structured questionnaire only'}
- Session Date: {s.get('created_at', 'Unknown')}

Generate a complete SOAP note:

S (Subjective):
[Patient's reported symptoms, concerns, mood in their own words]

O (Objective):
[Clinician observations, test scores, mental status]

A (Assessment):
[Clinical formulation, risk level, progress]

P (Plan):
[Interventions, homework, next session focus, referrals if needed]

Keep it professional, concise, and clinically appropriate."""

    response = _client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=800,
        messages=[{"role":"user","content":prompt}]
    )
    return {"soap_note": response.content[0].text.strip()}

# ── Pre-Session Brief ─────────────────────────────────────
class BriefInput(BaseModel):
    patient_email: str
    sessions_count: int
    latest_phq: int
    latest_gad: int
    prev_phq: int
    prev_gad: int
    interview_assessment: str
    recent_journals: str
    risk_level: str

@app.post("/pre-session-brief")
def pre_session_brief(data: BriefInput):
    import anthropic as _a, os as _o
    client = _a.Anthropic(api_key=_o.getenv("CLAUDE_API_KEY"))

    phq_change = data.latest_phq - data.prev_phq
    gad_change = data.latest_gad - data.prev_gad

    prompt = f"""You are a senior clinical psychologist preparing for a therapy session.
Generate a concise pre-session brief for the following patient:

Sessions completed: {data.sessions_count}
Latest PHQ-9: {data.latest_phq} (change from last: {phq_change:+d})
Latest GAD-7: {data.latest_gad} (change from last: {gad_change:+d})
Risk Level: {data.risk_level}
Last Interview Assessment: {data.interview_assessment[:500] if data.interview_assessment else 'None'}
Recent Journal Entries: {data.recent_journals[:500] if data.recent_journals else 'None'}

Generate a structured pre-session brief with:
1. CLINICAL STATUS SUMMARY (2-3 sentences)
2. KEY CHANGES SINCE LAST SESSION
3. RISK FLAGS TO MONITOR (if any)
4. SUGGESTED FOCUS AREAS FOR TODAY
5. RECOMMENDED OPENING QUESTIONS (3 specific questions)
6. CLINICAL REMINDERS

Keep it concise, practical, and clinically focused."""

    res = client.messages.create(
        model="claude-haiku-4-5-20251001", max_tokens=800,
        messages=[{"role":"user","content":prompt}]
    )
    return {"brief": res.content[0].text.strip()}


# ── Cognitive Pattern Detector ────────────────────────────
class PatternInput(BaseModel):
    journals: list

@app.post("/detect-patterns")
def detect_patterns(data: PatternInput):
    import anthropic as _a, os as _o
    client = _a.Anthropic(api_key=_o.getenv("CLAUDE_API_KEY"))

    journal_text = "\n---\n".join([
        f"Date: {j.get('date','')}\nEmotion: {j.get('emotion','')}\nCondition: {j.get('condition','')}\nText: {j.get('text','')}"
        for j in data.journals[:10]
    ])

    prompt = f"""Analyze these patient journal entries and identify cognitive patterns:

{journal_text}

Respond in JSON format:
{{
  "dominant_patterns": ["pattern1", "pattern2", "pattern3"],
  "risk_trend": "improving/stable/worsening with brief explanation",
  "clinical_observations": "2-3 sentence clinical observation about recurring themes, cognitive distortions, and emotional patterns"
}}

Only respond with valid JSON, no other text."""

    res = client.messages.create(
        model="claude-haiku-4-5-20251001", max_tokens=500,
        messages=[{"role":"user","content":prompt}]
    )
    import json as _json
    try:
        return _json.loads(res.content[0].text.strip())
    except:
        return {"dominant_patterns":[],"risk_trend":"Unable to analyze","clinical_observations":res.content[0].text}


# ── Longitudinal Narrative ────────────────────────────────
class NarrativeInput(BaseModel):
    patient_email: str
    sessions: list
    journals: list

@app.post("/longitudinal-narrative")
def longitudinal_narrative(data: NarrativeInput):
    import anthropic as _a, os as _o
    client = _a.Anthropic(api_key=_o.getenv("CLAUDE_API_KEY"))

    sessions_text = "\n".join([
        f"Session {i+1} ({s.get('date','')[:10]}): PHQ={s.get('phq',0)}, GAD={s.get('gad',0)}. {s.get('interview','')[:200]}"
        for i, s in enumerate(data.sessions)
    ])

    journals_text = "\n".join([
        f"Journal ({j.get('date','')[:10]}): {j.get('emotion','')} — {j.get('text','')}"
        for j in data.journals
    ])

    prompt = f"""You are a senior clinical psychologist writing a living case formulation.

Patient Sessions:
{sessions_text}

Recent Journal Entries:
{journals_text}

Write a comprehensive case formulation covering:

PREDISPOSING FACTORS:
[Biological, psychological, social vulnerability factors]

PRECIPITATING FACTORS:
[What triggered the current presentation]

PERPETUATING FACTORS:
[What maintains the current difficulties]

PROTECTIVE FACTORS & STRENGTHS:
[Resilience factors, support systems, personal strengths]

CLINICAL TRAJECTORY:
[How the patient has progressed across sessions — improving, stable, or declining]

FORMULATION SUMMARY:
[2-3 paragraph clinical narrative integrating all factors]

Keep it professional, evidence-based, and clinically precise."""

    res = client.messages.create(
        model="claude-haiku-4-5-20251001", max_tokens=1000,
        messages=[{"role":"user","content":prompt}]
    )
    return {"narrative": res.content[0].text.strip()}


# ── ACT Engine Endpoints ──────────────────────────────────
from act_engine import ACT_EXERCISES, jitai, get_recommended_exercise

class ACTRecommendInput(BaseModel):
    condition: str = "normal"
    phq_score: int = 0
    gad_score: int = 0
    journal_risk: dict = {}
    days_since_last: int = 1

@app.post("/act/recommend")
def act_recommend(data: ACTRecommendInput):
    result = get_recommended_exercise(
        condition=data.condition,
        phq=data.phq_score,
        gad=data.gad_score,
        journal_risk=data.journal_risk,
        days_since_last=data.days_since_last
    )
    return result

@app.get("/act/exercises")
def get_all_exercises():
    return ACT_EXERCISES

@app.get("/act/exercises/{process}")
def get_exercises_by_process(process: str):
    return ACT_EXERCISES.get(process, {})

class FeedbackInput(BaseModel):
    exercise_id: str
    helpful: bool

@app.post("/act/feedback")
def act_feedback(data: FeedbackInput):
    jitai.record_feedback(data.exercise_id, data.helpful)
    return {"status": "recorded"}

class AAQInput(BaseModel):
    answers: list  # 7 answers, scale 1-7

@app.post("/act/aaq-score")
def aaq_score(data: AAQInput):
    """
    AAQ-II Psychological Flexibility Score
    7 items, 1-7 scale, higher = more inflexible
    """
    if len(data.answers) != 7:
        return {"error": "Need exactly 7 answers"}

    total = sum(data.answers)
    # AAQ-II: score >= 28 indicates psychological inflexibility
    flexible = total < 28
    level = "High Flexibility" if total < 18 \
        else "Moderate Flexibility" if total < 28 \
        else "Low Flexibility (ACT indicated)"

    return {
        "total_score": total,
        "level": level,
        "psychologically_flexible": flexible,
        "interpretation": f"Score of {total}/49. {level}.",
        "act_indicated": total >= 28
    }