# PsycheFlow — Master Product Bible
## Auto-Updated: 2026-06-16 07:57
## Builder: Deepak Saxena | github.com/dpksaxena21/PsycheFlow
## Domain: psycheflow.in | GitHub: github.com/dpksaxena21/PsycheFlow

---

## VISION
PsycheFlow = Clinical Assessment + ACT Therapy + JITAI + Wearables + Psychologist Portal
"The Operating System for Human Psychological Intelligence"

---

## CURRENT BUILD STATUS

### LAYER 1 — CLINICAL ASSESSMENT
✅ FastAPI backend
✅ Big Five ML models (XGBoost)
✅ Dark Triad ML models
✅ Condition classifier (7 conditions, 76.2% accuracy)
✅ Workplace mental health model
✅ Student mental health models (depression/anxiety/panic)
✅ Treatment risk model
✅ Adaptive questionnaire (PHQ-9, GAD-7, Big Five, Dark Triad, OCD, PTSD, ADHD, Burnout, RSE, Sleep)
✅ Conversational AI interview (Dr. PsycheFlow, 15 turns, 14 clinical domains)
✅ Journal NLP (emotion + cognitive distortion + risk signals)
✅ Full psychological report (2000+ words, 8 sections, DSM-5 grounded)
✅ Patient dashboard (overview, history, journal tabs)
✅ Supabase authentication (email/password)
✅ Supabase PostgreSQL database

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
✅ Cognitive defusion tool
❌ Values discovery module (6 life domains)
❌ Acceptance coach (body scan, urge surfing)
❌ Mindfulness library (2-min exercises)
❌ Committed action planner
❌ Psychological flexibility dashboard (AAQ-II)
❌ ACT journal analysis (fusion, avoidance, values language detection)
❌ Daily mood check-in (2 questions between sessions)

### LAYER 3 — JITAI ENGINE
❌ Stress detection model
❌ Intervention recommendation engine
❌ Micro-exercise library (20-60 sec ACT exercises)
❌ Stress ML model (HR + HRV + behavioral)
❌ Push notification system
❌ Feedback loop (helpful Y/N → personalization)
❌ JITAI trigger logic (stress threshold → intervention)

### LAYER 4 — WEARABLE INTEGRATION
❌ Wearable API endpoints
❌ Wearable sync UI
❌ Apple HealthKit (HR, HRV, sleep, steps, SpO2)
❌ Fitbit API
❌ Google Health Connect (Android)
❌ Garmin API
❌ Digital phenotyping (typing rhythm, response latency, screen time)

### LAYER 5 — PSYCHOLOGIST PORTAL
✅ Psychologist dashboard
❌ Patient roster with risk flags
❌ Session note generator (SOAP/DAP/BIRP)
❌ Treatment plan builder (CBT/DBT/ACT mapping)
❌ Clinical report generator (formal PDF)
✅ Crisis management + safety planning
❌ SOAP note AI generator (Claude)
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
✅ PDF report export (jsPDF)
❌ Hindi/Hinglish support
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
✅ BIG5 (19,720 rows)
✅ SD3 Dark Triad (18,192 rows)
✅ MACH (73,489 rows)
✅ NPI Narcissism (11,243 rows)
✅ RSE Self-esteem (47,975 rows)
✅ HEXACO (22,787 rows)
✅ SENTIMENT_MH (53,043 rows — 7 conditions)
✅ MH_GENERAL (292,364 rows)
✅ OSMI workplace (1,259 rows)
✅ GoEmotions (43,410 rows)

### To Download Still
❌ PHQ-9/GAD-7/PSS validated dataset (Kaggle)
❌ DASS-21 normative dataset
❌ MBI Burnout normative dataset
❌ AAQ-II psychological flexibility dataset
❌ PCL-5 PTSD normative dataset

---

## MODELS TRAINED (15 total)
✅ Extraversion (XGBoost)
✅ Neuroticism (XGBoost)
✅ Agreeableness (XGBoost)
✅ Conscientiousness (XGBoost)
✅ Openness (XGBoost)
✅ Machiavellianism (XGBoost)
✅ Narcissism (XGBoost)
✅ Psychopathy (XGBoost)
✅ Condition Classifier (LogReg + TF-IDF, 76.2%)
✅ TF-IDF Vectorizer
✅ Workplace Mental Health (RandomForest)
✅ Student Depression (LogReg)
✅ Student Anxiety (LogReg)
✅ Student Panic (LogReg)
✅ Treatment Risk (XGBoost)

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
