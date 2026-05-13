#!/usr/bin/env python3
import os
from datetime import datetime

def check(path):
    return os.path.exists(f"/mnt/d/Projects/PsycheFlow/{path}")

def status(condition):
    return "✅" if condition else "❌"

now = datetime.now().strftime("%Y-%m-%d %H:%M")

bible = f"""# PsycheFlow — Master Product Bible
## Auto-Updated: {now}
## Builder: Deepak Saxena | github.com/dpksaxena21/PsycheFlow
## Domain: psycheflow.in | GitHub: github.com/dpksaxena21/PsycheFlow

---

## VISION
PsycheFlow = Clinical Assessment + ACT Therapy + JITAI + Wearables + Psychologist Portal
"The Operating System for Human Psychological Intelligence"

---

## CURRENT BUILD STATUS

### LAYER 1 — CLINICAL ASSESSMENT
{status(check('api/main.py'))} FastAPI backend
{status(check('models/Extraversion_xgb.pkl'))} Big Five ML models (XGBoost)
{status(check('models/Machiavellianism_xgb.pkl'))} Dark Triad ML models
{status(check('models/condition_classifier.pkl'))} Condition classifier (7 conditions, 76.2% accuracy)
{status(check('models/workplace_mh_model.pkl'))} Workplace mental health model
{status(check('models/student_depression_model.pkl'))} Student mental health models (depression/anxiety/panic)
{status(check('models/treatment_risk_model.pkl'))} Treatment risk model
{status(check('frontend/src/AdaptiveQuestionnaire.js'))} Adaptive questionnaire (PHQ-9, GAD-7, Big Five, Dark Triad, OCD, PTSD, ADHD, Burnout, RSE, Sleep)
{status(check('frontend/src/ClinicalInterview.js'))} Conversational AI interview (Dr. PsycheFlow, 15 turns, 14 clinical domains)
{status(check('api/journal_analysis.py'))} Journal NLP (emotion + cognitive distortion + risk signals)
{status(check('api/report_generator.py'))} Full psychological report (2000+ words, 8 sections, DSM-5 grounded)
{status(check('frontend/src/Dashboard.js'))} Patient dashboard (overview, history, journal tabs)
{status(check('frontend/src/Auth.js'))} Supabase authentication (email/password)
{status(check('frontend/src/supabase.js'))} Supabase PostgreSQL database

### LAYER 1B — CLINICAL INSTRUMENTS COVERED
✅ PHQ-9 (Depression — 9 items)
✅ GAD-7 (Anxiety — 7 items)
✅ Big Five OCEAN (10 items)
✅ Dark Triad SD3 (6 items)
✅ RSE Self-Esteem (4 items)
✅ PSQI Sleep Quality (4 items, triggered)
✅ OCI-R OCD (5 items, triggered)
✅ PCL-5 PTSD (5 items, triggered)
✅ ASRS ADHD (5 items, triggered)
✅ MBI Burnout (5 items, triggered)
✅ MDQ Bipolar (5 items, triggered)
❌ AAQ-II Psychological Flexibility
❌ WHO-5 Wellbeing
❌ AUDIT Substance Use
❌ LSAS Social Anxiety
❌ STAXI Anger
❌ EDE-Q Eating Disorders
❌ PSS Perceived Stress

### LAYER 1C — CONVERSATIONAL INTERVIEW DOMAINS
✅ Presenting problem
✅ Mood and emotional state
✅ Anxiety and stress
✅ Sleep and physical health
✅ Suicidal ideation (triggered)
✅ Trauma history (triggered)
✅ Relationships and social functioning
✅ Family background
✅ Substance use (triggered)
✅ Daily functioning
✅ Psychiatric history
✅ Strengths and coping
✅ Values and goals (ACT)
✅ Therapy preferences

### LAYER 2 — ACT ENGINE
{status(check('frontend/src/ACTEngine.js'))} Cognitive defusion tool
{status(check('frontend/src/ValuesModule.js'))} Values discovery module (6 life domains)
{status(check('frontend/src/AcceptanceCoach.js'))} Acceptance coach (body scan, urge surfing)
{status(check('frontend/src/MindfulnessLibrary.js'))} Mindfulness library (2-min exercises)
{status(check('frontend/src/CommittedAction.js'))} Committed action planner
{status(check('frontend/src/FlexibilityDashboard.js'))} Psychological flexibility dashboard (AAQ-II)
❌ ACT journal analysis (fusion, avoidance, values language detection)
❌ Daily mood check-in (2 questions between sessions)

### LAYER 3 — JITAI ENGINE
{status(check('api/jitai_engine.py'))} Stress detection model
{status(check('api/intervention_engine.py'))} Intervention recommendation engine
{status(check('api/intervention_library.py'))} Micro-exercise library (20-60 sec ACT exercises)
{status(check('models/stress_detector.pkl'))} Stress ML model (HR + HRV + behavioral)
❌ Push notification system
❌ Feedback loop (helpful Y/N → personalization)
❌ JITAI trigger logic (stress threshold → intervention)

### LAYER 4 — WEARABLE INTEGRATION
{status(check('api/wearables.py'))} Wearable API endpoints
{status(check('frontend/src/WearableSync.js'))} Wearable sync UI
{status(check('api/healthkit.py'))} Apple HealthKit (HR, HRV, sleep, steps, SpO2)
{status(check('api/fitbit.py'))} Fitbit API
❌ Google Health Connect (Android)
❌ Garmin API
❌ Digital phenotyping (typing rhythm, response latency, screen time)

### LAYER 5 — PSYCHOLOGIST PORTAL
{status(check('frontend/src/PsychologistPortal.js'))} Psychologist dashboard
{status(check('frontend/src/PatientRoster.js'))} Patient roster with risk flags
{status(check('frontend/src/SessionNotes.js'))} Session note generator (SOAP/DAP/BIRP)
{status(check('frontend/src/TreatmentPlan.js'))} Treatment plan builder (CBT/DBT/ACT mapping)
{status(check('frontend/src/ClinicalReport.js'))} Clinical report generator (formal PDF)
{status(check('frontend/src/CrisisManagement.js'))} Crisis management + safety planning
{status(check('api/soap_generator.py'))} SOAP note AI generator (Claude)
❌ Pre-session patient summary (AI generated before each session)
❌ Patient invitation link system
❌ Share code (patient → psychologist linking)
❌ RCI/MCI verification
❌ Between-session check-ins
❌ Cognitive pattern detector across sessions
❌ Appointment scheduling
❌ Medication notes
❌ Discharge summary generator
❌ Relapse prevention plan

### LAYER 6 — PLATFORM
{status(check('frontend/src/PDFExport.js'))} PDF report export (jsPDF)
{status(check('frontend/src/HindiSupport.js'))} Hindi/Hinglish support
❌ Mobile app (React Native)
❌ Power BI connector (Supabase → Power BI)
❌ Consent management system
❌ Data export (JSON/PDF download)
❌ Account deletion + data sovereignty
❌ Crisis resources always visible (iCall 9152987821)
❌ Frontend migration to Next.js + TailwindCSS

---

## DATABASE SCHEMA (Supabase)

### Tables Created
✅ profiles (user demographics)
✅ sessions (assessment data + scores)
✅ journal_entries (text + NLP analysis)
✅ treatment_plans (therapy goals)
✅ progress_notes (SOAP notes)
✅ psychologists (clinician profiles)
✅ patient_psychologist (linking table)
✅ psychology_knowledge (RAG vector store)

### Missing Columns in Sessions
❌ interview_transcript (full conversation JSON)
❌ interview_assessment (AI clinical summary)
❌ risk_level (low/medium/high)
❌ session_type (assessment/followup/checkin)

---

## DATASETS

### Downloaded and Used in Models
{status(check('data/raw/cat_d_personality/BIG5/BIG5/data.csv'))} BIG5 (19,720 rows)
{status(check('data/raw/cat_d_personality/SD3/SD3/data.csv'))} SD3 Dark Triad (18,192 rows)
{status(check('data/raw/cat_d_personality/MACH_data/MACH_data/data.csv'))} MACH (73,489 rows)
{status(check('data/raw/cat_d_personality/NPI/NPI/data.csv'))} NPI Narcissism (11,243 rows)
{status(check('data/raw/cat_d_personality/RSE/RSE/data.csv'))} RSE Self-esteem (47,975 rows)
{status(check('data/raw/cat_d_personality/HEXACO/HEXACO/data.csv'))} HEXACO (22,787 rows)
{status(check('data/raw/cat_h_specialist/SENTIMENT_MH/Combined Data.csv'))} SENTIMENT_MH (53,043 rows — 7 conditions)
{status(check('data/raw/cat_h_specialist/MH_GENERAL/Mental Health Dataset.csv'))} MH_GENERAL (292,364 rows)
{status(check('data/raw/cat_h_specialist/OSMI/survey.csv'))} OSMI workplace (1,259 rows)
{status(check('data/raw/cat_e_nlp_social/go_emotions'))} GoEmotions (43,410 rows)

### To Download Still
❌ PHQ-9/GAD-7/PSS validated dataset (Kaggle)
❌ DASS-21 normative dataset
❌ MBI Burnout normative dataset
❌ AAQ-II psychological flexibility dataset
❌ PCL-5 PTSD normative dataset

---

## MODELS TRAINED (15 total)
{status(check('models/Extraversion_xgb.pkl'))} Extraversion (XGBoost)
{status(check('models/Neuroticism_xgb.pkl'))} Neuroticism (XGBoost)
{status(check('models/Agreeableness_xgb.pkl'))} Agreeableness (XGBoost)
{status(check('models/Conscientiousness_xgb.pkl'))} Conscientiousness (XGBoost)
{status(check('models/Openness_xgb.pkl'))} Openness (XGBoost)
{status(check('models/Machiavellianism_xgb.pkl'))} Machiavellianism (XGBoost)
{status(check('models/Narcissism_xgb.pkl'))} Narcissism (XGBoost)
{status(check('models/Psychopathy_xgb.pkl'))} Psychopathy (XGBoost)
{status(check('models/condition_classifier.pkl'))} Condition Classifier (LogReg + TF-IDF, 76.2%)
{status(check('models/condition_tfidf.pkl'))} TF-IDF Vectorizer
{status(check('models/workplace_mh_model.pkl'))} Workplace Mental Health (RandomForest)
{status(check('models/student_depression_model.pkl'))} Student Depression (LogReg)
{status(check('models/student_anxiety_model.pkl'))} Student Anxiety (LogReg)
{status(check('models/student_panic_model.pkl'))} Student Panic (LogReg)
{status(check('models/treatment_risk_model.pkl'))} Treatment Risk (XGBoost)

### Models To Train
❌ Stress Detection (XGBoost/LSTM on wearable data)
❌ Intervention Recommender (contextual bandits)
❌ Mood Prediction (Prophet time series)
❌ AAQ-II Psychological Flexibility classifier

---

## TECH STACK

### Current (Built)
- Backend:     FastAPI + Python 3.12
- Frontend:    React 18 (CRA)
- Database:    Supabase PostgreSQL (Singapore ap-southeast-1)
- Auth:        Supabase Auth (email/password)
- ML:          XGBoost, LogReg, RandomForest, scikit-learn, SHAP
- NLP:         Claude API claude-opus-4-5
- Condition:   TF-IDF + LogReg (53k training samples)
- Embeddings:  sentence-transformers (planned for RAG)
- Domain:      psycheflow.in
- GitHub:      github.com/dpksaxena21/PsycheFlow

### Planned Upgrades
- Frontend:    Next.js + TailwindCSS + Framer Motion
- Mobile:      React Native
- Time Series: Facebook Prophet (longitudinal mood)
- Voice:       AssemblyAI (speech to text) + Hume AI (48 emotions)
- Crisis:      Perspective API (Google)
- NLP Models:  mental-roberta, emotion-distilroberta (HuggingFace)
- MLOps:       MLflow + DVC + GitHub Actions
- Deploy:      Vercel (frontend) + Render (API) + Supabase
- Analytics:   Power BI (Supabase connector) + Recharts (built-in)
- PDF:         jsPDF

---

## COMPLETE CLINICAL WORKFLOW (20 Stages)

### Patient Side
✅ Stage 1:  Appointment/access (link or tablet)
✅ Stage 2:  Registration + demographics
❌ Stage 3:  Informed consent form
✅ Stage 4:  Risk screening (PHQ-9 suicidal item + condition classifier)
✅ Stage 5:  Adaptive questionnaire (10 instruments)
✅ Stage 6:  Conversational interview (14 domains, 15 turns)
❌ Stage 7:  Mental Status Examination
✅ Stage 8:  Psychological testing (15 ML models)
✅ Stage 9:  Case formulation (Claude AI report)
✅ Stage 10: Condition detection (7 conditions)
❌ Stage 11: Treatment planning (collaborative)
✅ Stage 12: Journal entries (ongoing)
❌ Stage 13: Between-session homework
✅ Stage 14: Progress monitoring (score trends)
❌ Stage 15: Crisis management protocol
❌ Stage 16: SOAP note documentation
❌ Stage 17: Treatment review (every 4 sessions)
❌ Stage 18: Relapse prevention plan
❌ Stage 19: Discharge summary
❌ Stage 20: Follow-up scheduling

### Psychologist Side
❌ Patient roster management
❌ Pre-session AI summary (before each session)
❌ Live session view (see patient completing assessment)
❌ SOAP/DAP/BIRP note generator
❌ Treatment plan builder
❌ Formal clinical report (PDF)
❌ Risk alerts and notifications
❌ Cognitive pattern detector (across sessions)
❌ Progress charts (PHQ trend, GAD trend, personality stability)
❌ Power BI analytics dashboard
❌ RCI/MCI verification system
❌ Patient invitation system

---

## BUSINESS MODEL
### B2C (Individuals)
- Free: Basic assessment + journal
- Premium ₹499/month: Full report + ACT engine + history

### B2B (Psychologists)
- Solo psychologist: ₹2,000/month
- Clinic (5 psychologists): ₹8,000/month
- Hospital: Annual enterprise contract

### Enterprise
- Corporate wellness programs
- University mental health centers
- Government health programs (NIMHANS, AIIMS pilots)

---

## REGULATORY
- Class B SaMD — India MDR 2017
- All outputs: "patterns consistent with..." never "you have..."
- Crisis resources: iCall 9152987821 | Vandrevala 1860-2662-345
- DISHA compliance (India health data law)
- Consent: explicit, visible, revocable

---

## BUILD ORDER (remaining — in priority)
1. [ ] Save interview transcript to database
2. [ ] Psychologist Portal (patient roster, session view)
3. [ ] SOAP note generator (Claude AI)
4. [ ] Treatment plan builder
5. [ ] Progress charts (Recharts line charts)
6. [ ] PDF export (jsPDF)
7. [ ] Share code system (patient → psychologist)
8. [ ] ACT Engine (defusion, acceptance, values, mindfulness)
9. [ ] RAG pipeline (psychology knowledge base)
10. [ ] Crisis management system
11. [ ] Power BI connector
12. [ ] Voice journal (AssemblyAI)
13. [ ] JITAI engine
14. [ ] Wearable integration
15. [ ] Mobile app (React Native)
16. [ ] Hindi/Hinglish support
17. [ ] UI/UX redesign (Next.js + TailwindCSS)
18. [ ] Deploy to Vercel + psycheflow.in
19. [ ] Clinical pilot with psychologist advisor
20. [ ] Research validation study

---

## HOW TO USE IN NEW CHAT
Paste this at start of new Claude conversation:

I am Deepak Saxena building PsycheFlow — AI psychological intelligence platform.
GitHub: github.com/dpksaxena21/PsycheFlow
Project: /mnt/d/Projects/PsycheFlow on WSL Ubuntu
Stack: Python + FastAPI + React + PostgreSQL (Supabase)
Master Bible: docs/PSYCHEFLOW_MASTER_BIBLE.md

Read the master bible first, then continue from where we left off.

Rules:
- You write code, I type it and run it
- I paste only last 15 lines of output  
- No re-explaining what is already done
- Continue directly from where we left off
"""

output_path = "/mnt/d/Projects/PsycheFlow/docs/PSYCHEFLOW_MASTER_BIBLE.md"
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, "w") as f:
    f.write(bible)

print(f"✓ Bible updated: {now}")
print(f"✓ Saved to: {output_path}")

lines = bible.split('\n')
done  = sum(1 for l in lines if '✅' in l)
todo  = sum(1 for l in lines if '❌' in l)
print(f"✓ Complete: {done} | Remaining: {todo}")