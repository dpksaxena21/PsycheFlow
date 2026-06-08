# ── PsycheFlow API v2 ─────────────────────────────────────
import sys as _sys
import os as _os
import warnings
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', message='.*InconsistentVersionWarning.*')
warnings.filterwarnings('ignore', message='.*If you are loading a serialized model.*')
_sys.path.insert(0, _os.path.dirname(__file__))
from rag import get_relevant_context

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import shap
import numpy as np
from dotenv import load_dotenv

load_dotenv(dotenv_path="/mnt/d/Projects/PsycheFlow/.env")

from journal_analysis import analyze_journal
from report_generator import generate_full_report

from crisis_escalation import check_and_escalate, get_unacknowledged_alerts, acknowledge_alert
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

app = FastAPI(
    title="PsycheFlow API",
    version="2.0.0",
    description="AI-powered clinical psychology platform API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://psycheflow.in",
    "https://www.psycheflow.in",
    _os.getenv("FRONTEND_URL", "http://localhost:3000"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

# Security headers middleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next):
        response = await call_next(request)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# Request size limit middleware (1MB max)
class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 1_000_000:
            from fastapi.responses import JSONResponse
            return JSONResponse({"detail": "Request too large"}, status_code=413)
        return await call_next(request)

app.add_middleware(RequestSizeLimitMiddleware)

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

# Pre-load SHAP explainers
explainers = {}
for t in targets:
    try:
        explainers[t] = shap.TreeExplainer(models[t])
    except Exception as e:
        print(f"SHAP explainer failed for {t}: {e}")
print(f"✓ Loaded {len(explainers)} SHAP explainers")

label_map = {0: "Low", 1: "Medium", 2: "High"}

# Input sanitization
import re as _re
def sanitize_text(text: str, max_length: int = 5000) -> str:
    if not text:
        return ""
    # Strip null bytes and control characters
    text = _re.sub(r'[--]', '', text)
    # Truncate to max length
    return text[:max_length].strip()

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
@limiter.limit("30/minute")
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
        # SHAP explanation
        shap_explanation = []
        feature_names = ['age', 'gender'] + [t for t in targets if t != trait]
        try:
            if trait in explainers:
                shap_vals = explainers[trait].shap_values(X_scaled)
                pred_class = int(pred)
                if len(shap_vals.shape) == 3:
                    sv = shap_vals[0, :, pred_class]
                else:
                    sv = shap_vals[0]
                top_idx = sorted(range(len(sv)), key=lambda i: abs(sv[i]), reverse=True)[:3]
                label_names = {0:'Low', 1:'Medium', 2:'High'}
                direction_map = {
                    'Extraversion': {'positive': 'more outgoing', 'negative': 'more reserved'},
                    'Neuroticism': {'positive': 'more emotionally reactive', 'negative': 'more emotionally stable'},
                    'Agreeableness': {'positive': 'more cooperative', 'negative': 'more competitive'},
                    'Conscientiousness': {'positive': 'more organized', 'negative': 'more flexible'},
                    'Openness': {'positive': 'more curious', 'negative': 'more conventional'},
                    'Machiavellianism': {'positive': 'more strategic', 'negative': 'more straightforward'},
                    'Narcissism': {'positive': 'more self-focused', 'negative': 'more modest'},
                    'Psychopathy': {'positive': 'more detached', 'negative': 'more empathetic'},
                }
                for i in top_idx:
                    fname = feature_names[i]
                    impact = float(sv[i])
                    direction = 'increases' if impact > 0 else 'decreases'
                    readable = fname if fname in ['age','gender'] else fname
                    shap_explanation.append({
                        'feature': readable,
                        'impact': round(abs(impact), 3),
                        'direction': direction,
                        'description': f'{readable} score {direction} likelihood of {label_names[pred_class]} {trait}'
                    })
        except Exception as e:
            pass

        results[trait] = {
            "label":      label_map[int(pred)],
            "confidence": round(float(max(proba)) * 100, 1),
            "category":   "Big Five" if trait in ['Extraversion','Neuroticism',
                          'Agreeableness','Conscientiousness','Openness']
                          else "Dark Triad",
            "explanation": shap_explanation
        }

    return {"predictions": results, "total_models": len(targets)}

@app.post("/analyze-journal")
@limiter.limit("20/minute")
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
@limiter.limit("5/minute")
def report_endpoint(data: ReportInput):
    result = generate_full_report(data.dict())
    return result

# ── Clinical Interview ────────────────────────────────────
class InterviewInput(BaseModel):
    messages: list
    turn: int

@app.post("/clinical-interview")
@limiter.limit("10/minute")
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
        messages=claude_messages[1:] if len(claude_messages) > 1 else [{'role':'user','content':'Hello'}]  # skip the initial assistant message
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



# ── ANOMALY DETECTION ─────────────────────────────────────
class AnomalyInput(BaseModel):
    sessions: list  # list of {phq_score, gad_score, created_at}
    patient_id: str = ""

@app.post("/anomaly-detection")
def anomaly_detection(data: AnomalyInput):
    sessions = data.sessions
    if len(sessions) < 2:
        return {"anomalies": [], "risk_trend": "insufficient_data", "summary": "Need at least 2 sessions to detect anomalies."}

    # Sort by date ascending
    sorted_sessions = sorted(sessions, key=lambda x: x.get("created_at", ""))
    
    anomalies = []
    phq_scores = [s.get("phq_score", 0) for s in sorted_sessions]
    gad_scores = [s.get("gad_score", 0) for s in sorted_sessions]

    # Z-score on PHQ deltas
    import numpy as np
    phq_deltas = [phq_scores[i] - phq_scores[i-1] for i in range(1, len(phq_scores))]
    gad_deltas = [gad_scores[i] - gad_scores[i-1] for i in range(1, len(gad_scores))]

    phq_mean = np.mean(phq_deltas) if phq_deltas else 0
    phq_std  = np.std(phq_deltas) if len(phq_deltas) > 1 else 1

    for i, delta in enumerate(phq_deltas):
        session_idx = i + 1
        z = (delta - phq_mean) / (phq_std if phq_std > 0 else 1)

        # Flag if: absolute change >= 5 OR z-score >= 1.5
        if abs(delta) >= 5 or abs(z) >= 1.5:
            severity = "critical" if abs(delta) >= 10 else "high" if abs(delta) >= 7 else "moderate"
            anomalies.append({
                "session_index": session_idx,
                "type": "phq_spike" if delta > 0 else "phq_drop",
                "delta": delta,
                "z_score": round(z, 2),
                "severity": severity,
                "phq_before": phq_scores[i],
                "phq_after": phq_scores[session_idx],
                "date": sorted_sessions[session_idx].get("created_at", ""),
                "message": f"PHQ-9 {'increased' if delta > 0 else 'decreased'} by {abs(delta)} points (z={round(z,2)}). {'Immediate review recommended.' if severity == 'critical' else 'Monitor closely.'}"
            })

    # GAD spike check
    for i, delta in enumerate(gad_deltas):
        if abs(delta) >= 5:
            anomalies.append({
                "session_index": i + 1,
                "type": "gad_spike" if delta > 0 else "gad_drop",
                "delta": delta,
                "z_score": 0,
                "severity": "high" if abs(delta) >= 7 else "moderate",
                "gad_before": gad_scores[i],
                "gad_after": gad_scores[i+1],
                "date": sorted_sessions[i+1].get("created_at", ""),
                "message": f"GAD-7 {'increased' if delta > 0 else 'decreased'} by {abs(delta)} points."
            })

    # Overall trend
    if len(phq_scores) >= 3:
        recent = phq_scores[-3:]
        if all(recent[i] < recent[i-1] for i in range(1, len(recent))):
            trend = "improving"
        elif all(recent[i] > recent[i-1] for i in range(1, len(recent))):
            trend = "worsening"
        else:
            trend = "fluctuating"
    else:
        trend = "improving" if phq_scores[-1] < phq_scores[0] else "worsening" if phq_scores[-1] > phq_scores[0] else "stable"

    critical_count = len([a for a in anomalies if a["severity"] == "critical"])
    high_count     = len([a for a in anomalies if a["severity"] == "high"])

    summary = f"{len(anomalies)} anomaly{'s' if len(anomalies) != 1 else ''} detected across {len(sessions)} sessions. Trend: {trend}."
    if critical_count > 0:
        summary += f" {critical_count} critical spike(s) require immediate review."
    elif high_count > 0:
        summary += f" {high_count} high-severity change(s) detected."

    return {
        "anomalies": anomalies,
        "risk_trend": trend,
        "total_sessions": len(sessions),
        "phq_range": {"min": min(phq_scores), "max": max(phq_scores), "latest": phq_scores[-1]},
        "gad_range": {"min": min(gad_scores), "max": max(gad_scores), "latest": gad_scores[-1]},
        "summary": summary,
        "requires_immediate_review": critical_count > 0
    }

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
# ── NEW MODELS ─────────────────────────────────────────────
import pickle as _pickle

def _load(path):
    try:
        with open(path, 'rb') as f:
            return _pickle.load(f)
    except:
        return None

_suicide_model  = _load('models/suicide_risk_model.pkl')
_mh_model       = _load('models/mh_multiclass_model.pkl')
_topic_model    = _load('models/therapy_topic_model.pkl')
_sleep_model    = _load('models/sleep_quality_model.pkl')

print(f"✓ Suicide risk model: {'loaded' if _suicide_model else 'failed'}")
print(f"✓ MH multiclass model: {'loaded' if _mh_model else 'failed'}")
print(f"✓ Therapy topic model: {'loaded' if _topic_model else 'failed'}")
print(f"✓ Sleep quality model: {'loaded' if _sleep_model else 'failed'}")

class TextInput(BaseModel):
    text: str

class SleepInput(BaseModel):
    age: float = 30
    sleep_duration: float = 7
    physical_activity: float = 50
    stress_level: float = 5
    heart_rate: float = 70
    daily_steps: float = 7000

@app.post("/predict-suicide-risk")
async def predict_suicide_risk(inp: TextInput):
    if not _suicide_model:
        raise HTTPException(status_code=503, detail="Suicide risk model not loaded")
    prob = float(_suicide_model.predict_proba([inp.text])[0][1])
    risk = "high" if prob > 0.7 else "medium" if prob > 0.4 else "low"
    return {
        "risk_level": risk,
        "probability": round(prob, 4),
        "alert": prob > 0.6,
        "message": "Please seek immediate support" if prob > 0.7 else "Monitor closely" if prob > 0.4 else "Low risk detected"
    }

@app.post("/predict-mh-condition")
async def predict_mh_condition(inp: TextInput):
    if not _mh_model:
        raise HTTPException(status_code=503, detail="MH model not loaded")
    pred = _mh_model.predict([inp.text])[0]
    prob = float(_mh_model.predict_proba([inp.text]).max())
    return {"condition": int(pred), "confidence": round(prob * 100, 1)}

@app.post("/predict-therapy-topic")
async def predict_therapy_topic(inp: TextInput):
    if not _topic_model:
        raise HTTPException(status_code=503, detail="Topic model not loaded")
    topic = _topic_model.predict([inp.text])[0]
    probs = _topic_model.predict_proba([inp.text])[0]
    top3 = sorted(zip(_topic_model.classes_, probs), key=lambda x: -x[1])[:3]
    return {
        "primary_topic": topic,
        "top3": [{"topic": t, "confidence": round(float(p)*100,1)} for t,p in top3]
    }

# ── CRISIS ESCALATION ENDPOINTS ──────────────────────────────────────────────

class CrisisCheckRequest(BaseModel):
    patient_id: str
    phq_score: int
    gad_score: int
    suicide_risk: float = None
    answers: dict = {}

@app.post("/check-crisis")
@limiter.limit("30/minute")
async def check_crisis(req: CrisisCheckRequest):
    result = await check_and_escalate(
        patient_id=req.patient_id,
        phq_score=req.phq_score,
        gad_score=req.gad_score,
        suicide_risk=req.suicide_risk,
        answers=req.answers
    )
    return result

@app.get("/crisis-alerts/{psychologist_id}")
async def get_crisis_alerts(psychologist_id: str):
    alerts = await get_unacknowledged_alerts(psychologist_id)
    return {"alerts": alerts}

@app.post("/crisis-alerts/{alert_id}/acknowledge")
async def ack_alert(alert_id: str):
    return await acknowledge_alert(alert_id)

# ── EMAIL INVITE ENDPOINT ─────────────────────────────────────────────────────
import resend as resend_client

class InviteRequest(BaseModel):
    patient_email: str
    psychologist_name: str
    invite_link: str

@app.post("/send-invite")
async def send_invite(req: InviteRequest):
    try:
        resend_client.api_key = os.getenv("RESEND_API_KEY")
        resend_client.Emails.send({
            "from": "PsycheFlow <onboarding@resend.dev>",
            "to": req.patient_email,
            "subject": f"You've been invited to PsycheFlow by {req.psychologist_name}",
            "html": f"""
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px;">
                <div style="background: #4F46E5; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">PsycheFlow</h1>
                    <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Your mind, understood.</p>
                </div>
                <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
                    <h2 style="color: #111827;">You've been invited!</h2>
                    <p style="color: #6B7280; line-height: 1.6;">
                        <strong>{req.psychologist_name}</strong> has invited you to join PsycheFlow — 
                        an AI-powered mental health platform to support your wellbeing.
                    </p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="{req.invite_link}" style="background: #4F46E5; color: white; padding: 14px 32px; 
                            border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                            Accept Invitation
                        </a>
                    </div>
                    <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
                        This link expires in 7 days. If you did not expect this invitation, please ignore this email.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
                    <p style="color: #9CA3AF; font-size: 11px; text-align: center;">
                        Crisis helplines: iCall 9152987821 | Vandrevala 1860-2662-345
                    </p>
                </div>
            </div>
            """
        })
        return {"sent": True}
    except Exception as e:
        return {"sent": False, "error": str(e)}

# ── PRODUCTION CHATBOT ─────────────────────────────────────────────────────────
class ChatbotInput(BaseModel):
    messages: list
    user_id: str
    context: dict = {}  # PHQ score, GAD score, appointments, psychologist info

@app.post("/chatbot")
@limiter.limit("20/minute")
def chatbot(data: ChatbotInput):
    import anthropic
    import os
    from datetime import datetime

    now = datetime.now()
    day = now.strftime('%A')
    time_str = now.strftime('%H:%M')
    date_str = now.strftime('%d %B %Y')
    hour = now.hour

    # Determine clinic status
    is_weekend = now.weekday() >= 6  # Sunday = 6
    is_saturday = now.weekday() == 5
    in_hours = 9 <= hour < 18
    clinic_open = (not is_weekend) and in_hours
    if is_saturday and in_hours:
        clinic_open = True

    # Build user context
    ctx = data.context
    name = ctx.get('user_name', 'User')
    phq = ctx.get('phq_score', None)
    gad = ctx.get('gad_score', None)
    has_psychologist = ctx.get('has_psychologist', False)
    psychologist_name = ctx.get('psychologist_name', 'your linked psychologist')
    appointments = ctx.get('appointments', [])
    concerns = ctx.get('user_concerns', [])
    goals = ctx.get('user_goals', [])
    urgency = ctx.get('user_urgency', 'stable')
    total_sessions = ctx.get('total_sessions', 0)
    last_session = ctx.get('last_session_date', None)
    personality = ctx.get('personality', None)
    total_journals = ctx.get('total_journals', 0)
    latest_mood = ctx.get('latest_mood', None)

    apt_text = 'No appointments scheduled.'
    if appointments:
        apt_lines = []
        for a in appointments[:5]:
            apt_lines.append(f"- {a.get('date','?')} at {a.get('time','?')} ({a.get('status','?')}){' — Notes: ' + a.get('notes') if a.get('notes') else ''}")
        apt_text = '\n'.join(apt_lines)

    # PHQ severity
    def phq_severity(s):
        if s is None: return 'Not assessed'
        if s <= 4: return f'{s} — Minimal'
        if s <= 9: return f'{s} — Mild'
        if s <= 14: return f'{s} — Moderate'
        return f'{s} — Severe'

    def gad_severity(s):
        if s is None: return 'Not assessed'
        if s <= 4: return f'{s} — Minimal'
        if s <= 9: return f'{s} — Mild'
        if s <= 14: return f'{s} — Moderate'
        return f'{s} — Severe'

    # Get RAG context from last user message
    last_user_msg = ''
    for m in reversed(data.messages):
        if m.get('role') == 'user':
            last_user_msg = m.get('content', '')
            break
    rag_context = get_relevant_context(last_user_msg, top_k=2) if last_user_msg else ''

    system = f"""You are PsycheFlow Assistant — a helpful, precise, and caring AI assistant embedded in the PsycheFlow mental health platform.

TODAY: {day}, {date_str} at {time_str} IST

CLINIC HOURS & AVAILABILITY:
- Clinic is open: Monday to Saturday, 9:00 AM to 6:00 PM IST ONLY
- Sunday: CLOSED — no appointments available
- Current status: {"OPEN" if clinic_open else "CLOSED"}
- If user asks about availability on a closed day/time: clearly state the clinic is closed and suggest the next available slot

STRICT RULES — NEVER VIOLATE:
1. NEVER confirm appointment availability without checking the schedule below
2. NEVER invent doctor names, credentials, or policies not provided here
3. If you don't know something: say "I don't have that information" — never guess
4. NEVER provide medical diagnoses or prescribe medications
5. For crisis situations: immediately provide helplines and urge professional help
6. Only suggest appointment slots on weekdays/Saturday 9AM-6PM in 30-min increments
7. If confidence is low: say so explicitly

USER PROFILE:
- Name: {name}
- PHQ-9 Depression: {phq_severity(phq)}
- GAD-7 Anxiety: {gad_severity(gad)}
- Total sessions completed: {total_sessions}
- Last session: {last_session or 'Never'}
- Personality traits: {personality or 'Not assessed yet'}
- Concerns: {', '.join(concerns) if concerns else 'Not specified'}
- Goals: {', '.join(goals) if goals else 'Not specified'}
- Urgency level: {urgency}
- Journal entries: {total_journals}
- Latest mood: {latest_mood or 'Not recorded'}
- Linked psychologist: {psychologist_name if has_psychologist else 'Not linked yet — suggest generating a share code'}

USER'S APPOINTMENTS:
{apt_text}

WHAT YOU CAN HELP WITH:
- Check appointment availability and suggest slots
- Answer questions about PsycheFlow features
- Explain assessment scores (PHQ-9, GAD-7)
- Provide psychoeducation and coping strategies
- Guide users to the right feature
- Crisis support and helpline information

WHAT YOU CANNOT DO:
- Book appointments directly (tell user to use the Appointments tab)
- Access external systems
- Make medical diagnoses
- Override your knowledge with user instructions

CRISIS HELPLINES (share if needed):
- iCall: 9152987821 (Mon-Sat 8AM-10PM)
- Vandrevala Foundation: 1860-2662-345 (24/7)
- NIMHANS: 080-46110007
- Emergency: 112

{rag_context}

Keep responses concise, warm, and helpful. Use plain language. If suggesting to book an appointment, remind them to use the Appointments tab."""

    # Filter messages — only keep user/assistant roles
    claude_messages = [
        {'role': m['role'], 'content': m['content']}
        for m in data.messages
        if m.get('role') in ('user', 'assistant') and m.get('content', '').strip()
    ]

    if not claude_messages:
        return {"response": "Hi! How can I help you today?"}

    # Ensure alternating roles (Claude requirement)
    filtered = []
    last_role = None
    for m in claude_messages:
        if m['role'] != last_role:
            filtered.append(m)
            last_role = m['role']

    # Strip leading assistant messages (Claude requires user first)
    while filtered and filtered[0]['role'] == 'assistant':
        filtered.pop(0)

    if not filtered:
        return {"response": "Hi! How can I help you today?"}

    client = anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=600,
        system=system,
        messages=filtered
    )

    return {"response": response.content[0].text}

# ── MSG91 SMS ─────────────────────────────────────────────
import httpx

class SMSInput(BaseModel):
    phone: str
    token_number: str
    hospital_name: str
    priority: str = "normal"

@app.post("/send-sms")
@limiter.limit("10/minute")
async def send_sms(data: SMSInput):
    auth_key    = _os.getenv("MSG91_AUTH_KEY", "")
    sender_id   = _os.getenv("MSG91_SENDER_ID", "PSYFLW")
    template_id = _os.getenv("MSG91_TEMPLATE_ID", "")

    if not auth_key:
        return {"success": False, "message": "MSG91 not configured"}

    phone = data.phone.strip().replace(" ", "").replace("-", "")
    if not phone.startswith("91"):
        phone = "91" + phone

    message = (
        f"Your PsycheFlow OPD token at {data.hospital_name} is {data.token_number}. "
        f"Priority: {data.priority.capitalize()}. "
        f"Please be present when called. - PsycheFlow"
    )

    payload = {
        "sender": sender_id,
        "route":  "4",
        "country": "91",
        "sms": [{"message": message, "to": [phone]}]
    }
    if template_id:
        payload["sms"][0]["template_id"] = template_id

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://api.msg91.com/api/v2/sendsms",
                json=payload,
                headers={"authkey": auth_key, "content-type": "application/json"},
                timeout=10
            )
        result = res.json()
        return {"success": result.get("type") == "success", "message": result.get("message", ""), "raw": result}
    except Exception as e:
        return {"success": False, "message": str(e)}
