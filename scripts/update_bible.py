#!/usr/bin/env python3
# ── PsycheFlow Bible Auto-Updater ────────────────────────
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

---

## CURRENT BUILD STATUS

### LAYER 1 — CLINICAL ASSESSMENT
{status(check('api/main.py'))} FastAPI backend
{status(check('models/Extraversion_xgb.pkl'))} Big Five ML models (XGBoost)
{status(check('models/Machiavellianism_xgb.pkl'))} Dark Triad ML models
{status(check('models/condition_classifier.pkl'))} Condition classifier (7 conditions)
{status(check('models/workplace_mh_model.pkl'))} Workplace mental health model
{status(check('models/student_depression_model.pkl'))} Student mental health models
{status(check('models/treatment_risk_model.pkl'))} Treatment risk model
{status(check('frontend/src/AdaptiveQuestionnaire.js'))} Adaptive questionnaire
{status(check('api/journal_analysis.py'))} Journal NLP (Claude AI)
{status(check('api/report_generator.py'))} Full psychological report generator
{status(check('frontend/src/Dashboard.js'))} User dashboard
{status(check('frontend/src/Auth.js'))} Supabase authentication
{status(check('frontend/src/supabase.js'))} Supabase database connection

### LAYER 2 — ACT ENGINE
{status(check('frontend/src/ACTEngine.js'))} Cognitive defusion tool
{status(check('frontend/src/ValuesModule.js'))} Values discovery module
{status(check('frontend/src/AcceptanceCoach.js'))} Acceptance coach
{status(check('frontend/src/MindfulnessLibrary.js'))} Mindfulness library
{status(check('frontend/src/CommittedAction.js'))} Committed action planner
{status(check('frontend/src/FlexibilityDashboard.js'))} Psychological flexibility dashboard

### LAYER 3 — JITAI ENGINE
{status(check('api/jitai_engine.py'))} Stress detection model
{status(check('api/intervention_engine.py'))} Intervention recommendation engine
{status(check('api/intervention_library.py'))} Micro-exercise library
{status(check('models/stress_detector.pkl'))} Stress ML model

### LAYER 4 — WEARABLE INTEGRATION
{status(check('api/wearables.py'))} Wearable API endpoints
{status(check('frontend/src/WearableSync.js'))} Wearable sync UI
{status(check('api/healthkit.py'))} Apple HealthKit integration
{status(check('api/fitbit.py'))} Fitbit API integration

### LAYER 5 — PSYCHOLOGIST PORTAL
{status(check('frontend/src/PsychologistPortal.js'))} Psychologist dashboard
{status(check('frontend/src/PatientRoster.js'))} Patient roster
{status(check('frontend/src/SessionNotes.js'))} Session note generator (SOAP/DAP)
{status(check('frontend/src/TreatmentPlan.js'))} Treatment plan builder
{status(check('frontend/src/ClinicalReport.js'))} Clinical report generator
{status(check('frontend/src/CrisisManagement.js'))} Crisis management system
{status(check('api/soap_generator.py'))} SOAP note AI generator

### LAYER 6 — PLATFORM
{status(check('frontend/src/PDFExport.js'))} PDF report export
{status(check('frontend/src/HindiSupport.js'))} Hindi/Hinglish support
{status(check('frontend/src/MobileApp.js'))} Mobile app
{status(check('api/share_code.py'))} Share code system (patient→doctor)
{status(check('api/notifications.py'))} Push notifications

---

## DATASETS

### Downloaded
{status(check('data/raw/cat_d_personality/BIG5/BIG5/data.csv'))} BIG5 (19,720 rows)
{status(check('data/raw/cat_d_personality/SD3/SD3/data.csv'))} SD3 Dark Triad (18,192 rows)
{status(check('data/raw/cat_d_personality/MACH_data/MACH_data/data.csv'))} MACH (73,489 rows)
{status(check('data/raw/cat_d_personality/NPI/NPI/data.csv'))} NPI Narcissism (11,243 rows)
{status(check('data/raw/cat_d_personality/RSE/RSE/data.csv'))} RSE Self-esteem (47,975 rows)
{status(check('data/raw/cat_d_personality/HEXACO/HEXACO/data.csv'))} HEXACO (22,787 rows)
{status(check('data/raw/cat_h_specialist/SENTIMENT_MH/Combined Data.csv'))} SENTIMENT_MH (53,043 rows)
{status(check('data/raw/cat_h_specialist/MH_GENERAL/Mental Health Dataset.csv'))} MH_GENERAL (292,364 rows)
{status(check('data/raw/cat_h_specialist/OSMI/survey.csv'))} OSMI (1,259 rows)
{status(check('data/raw/cat_e_nlp_social/go_emotions'))} GoEmotions (43,410 rows)

---

## MODELS TRAINED
{status(check('models/Extraversion_xgb.pkl'))} Extraversion
{status(check('models/Neuroticism_xgb.pkl'))} Neuroticism
{status(check('models/Agreeableness_xgb.pkl'))} Agreeableness
{status(check('models/Conscientiousness_xgb.pkl'))} Conscientiousness
{status(check('models/Openness_xgb.pkl'))} Openness
{status(check('models/Machiavellianism_xgb.pkl'))} Machiavellianism
{status(check('models/Narcissism_xgb.pkl'))} Narcissism
{status(check('models/Psychopathy_xgb.pkl'))} Psychopathy
{status(check('models/condition_classifier.pkl'))} Condition Classifier (7 conditions)
{status(check('models/condition_tfidf.pkl'))} TF-IDF Vectorizer
{status(check('models/workplace_mh_model.pkl'))} Workplace Mental Health
{status(check('models/student_depression_model.pkl'))} Student Depression
{status(check('models/student_anxiety_model.pkl'))} Student Anxiety
{status(check('models/student_panic_model.pkl'))} Student Panic
{status(check('models/treatment_risk_model.pkl'))} Treatment Risk

---

## TECH STACK
- Backend:   FastAPI + Python
- Frontend:  React (planned: Next.js + TailwindCSS)
- Database:  Supabase PostgreSQL (Singapore)
- Auth:      Supabase Auth
- ML:        XGBoost, LogReg, RandomForest, scikit-learn
- NLP:       Claude API (claude-opus-4-5)
- Condition: TF-IDF + LogReg (76.2% accuracy)
- Domain:    psycheflow.in
- GitHub:    github.com/dpksaxena21/PsycheFlow

---

## BUILD ORDER (remaining)
- [ ] ACT Engine — defusion, acceptance, values, mindfulness
- [ ] Psychologist Portal — roster, SOAP notes, treatment plan
- [ ] JITAI Engine — stress detection, interventions
- [ ] Wearable Integration — Apple Watch, Fitbit
- [ ] Crisis Management — safety planning, escalation
- [ ] Mobile App — React Native
- [ ] Hindi/Hinglish support
- [ ] PDF export
- [ ] UI/UX redesign (professional clinical design)
- [ ] Deploy to Vercel + psycheflow.in
- [ ] Clinical pilot with psychologist advisor

---

## HOW TO USE IN NEW CHAT
Paste this at start of new Claude conversation:

I am Deepak Saxena building PsycheFlow.
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

# Count status
lines = bible.split('\n')
done  = sum(1 for l in lines if '✅' in l)
todo  = sum(1 for l in lines if '❌' in l)
print(f"✓ Complete: {done} | Remaining: {todo}")