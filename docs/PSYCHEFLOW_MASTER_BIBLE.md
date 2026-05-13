# PsycheFlow — Master Product Bible
## Auto-Updated: 2026-05-13 08:37
## Builder: Deepak Saxena | github.com/dpksaxena21/PsycheFlow

---

## CURRENT BUILD STATUS

### LAYER 1 — CLINICAL ASSESSMENT
✅ FastAPI backend
✅ Big Five ML models (XGBoost)
✅ Dark Triad ML models
✅ Condition classifier (7 conditions)
✅ Workplace mental health model
✅ Student mental health models
✅ Treatment risk model
❌ Adaptive questionnaire
✅ Journal NLP (Claude AI)
✅ Full psychological report generator
✅ User dashboard
✅ Supabase authentication
✅ Supabase database connection

### LAYER 2 — ACT ENGINE
❌ Cognitive defusion tool
❌ Values discovery module
❌ Acceptance coach
❌ Mindfulness library
❌ Committed action planner
❌ Psychological flexibility dashboard

### LAYER 3 — JITAI ENGINE
❌ Stress detection model
❌ Intervention recommendation engine
❌ Micro-exercise library
❌ Stress ML model

### LAYER 4 — WEARABLE INTEGRATION
❌ Wearable API endpoints
❌ Wearable sync UI
❌ Apple HealthKit integration
❌ Fitbit API integration

### LAYER 5 — PSYCHOLOGIST PORTAL
❌ Psychologist dashboard
❌ Patient roster
❌ Session note generator (SOAP/DAP)
❌ Treatment plan builder
❌ Clinical report generator
❌ Crisis management system
❌ SOAP note AI generator

### LAYER 6 — PLATFORM
❌ PDF report export
❌ Hindi/Hinglish support
❌ Mobile app
❌ Share code system (patient→doctor)
❌ Push notifications

---

## DATASETS

### Downloaded
✅ BIG5 (19,720 rows)
✅ SD3 Dark Triad (18,192 rows)
✅ MACH (73,489 rows)
✅ NPI Narcissism (11,243 rows)
✅ RSE Self-esteem (47,975 rows)
✅ HEXACO (22,787 rows)
✅ SENTIMENT_MH (53,043 rows)
✅ MH_GENERAL (292,364 rows)
✅ OSMI (1,259 rows)
✅ GoEmotions (43,410 rows)

---

## MODELS TRAINED
✅ Extraversion
✅ Neuroticism
✅ Agreeableness
✅ Conscientiousness
✅ Openness
✅ Machiavellianism
✅ Narcissism
✅ Psychopathy
✅ Condition Classifier (7 conditions)
✅ TF-IDF Vectorizer
✅ Workplace Mental Health
✅ Student Depression
✅ Student Anxiety
✅ Student Panic
✅ Treatment Risk

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
