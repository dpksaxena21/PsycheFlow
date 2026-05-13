cat > /mnt/d/Projects/PsycheFlow/docs/PSYCHEFLOW_MASTER_BIBLE.md << 'EOF'
# PsycheFlow — Master Product Bible
## Version 2.0 | Updated: May 2026
## Builder: Deepak Saxena | github.com/dpksaxena21/PsycheFlow

---

## ONE LINE PITCH
"The Operating System for Human Psychological Intelligence — Clinical assessment, ACT therapy, real-time interventions, and psychologist tools in one platform."

---

## VISION
PsycheFlow is not an app. It is a Clinical Decision Intelligence Infrastructure that:
- Builds a living cognitive-emotional model of each user
- Delivers ACT therapy via JITAI (Just-In-Time Adaptive Interventions)
- Gives psychologists an AI co-pilot for clinical work
- Integrates wearables for real-time stress detection
- Tracks longitudinal psychological trajectory over months

---

## THE 6 LAYERS

### LAYER 1 — CLINICAL ASSESSMENT ✅ BUILT
- Adaptive questionnaire (PHQ-9, GAD-7, Big Five, Dark Triad, OCD, PTSD, ADHD, Burnout, Bipolar, RSE, Sleep)
- 13 ML models (XGBoost + LogReg)
- Claude AI full psychological report (2000+ words, 8 sections)
- Journal NLP (emotion detection, cognitive distortions, risk signals)
- Condition classifier (7 conditions: Anxiety, Depression, Bipolar, Stress, Suicidal, Normal, Personality disorder)
- Supabase auth + PostgreSQL database
- Session history dashboard

### LAYER 2 — ACT ENGINE ❌ NOT BUILT
ACT = Acceptance and Commitment Therapy (modern CBT)
6 Core Processes:
1. Acceptance — Allow feelings without suppression
2. Cognitive Defusion — See thoughts as just thoughts
3. Present Moment — Mindfulness grounding
4. Self-as-Context — Observer perspective
5. Values — Clarify what truly matters
6. Committed Action — Act aligned with values

Features to build:
- Cognitive Defusion Tool ("I am having the thought that...")
- Acceptance Coach (body scan, urge surfing)
- Mindfulness Library (2-min exercises)
- Values Discovery Module (rank across 6 life domains)
- Committed Action Planner (weekly goals per value)
- Psychological Flexibility Dashboard (AAQ-II score)
- ACT Journal Analysis (detect fusion, avoidance, values language)

### LAYER 3 — JITAI ENGINE ❌ NOT BUILT
JITAI = Just-In-Time Adaptive Interventions
- Monitor stress signals (HR, HRV, sleep, location, phone usage)
- Detect high-stress moments
- Deliver 20-60 second ACT micro-interventions
- Collect feedback (helpful Y/N)
- Personalize over time via ML

Trigger → Intervention examples:
- HR spike + workplace → 30-sec breathing + defusion
- Poor sleep + Monday morning → acceptance exercise
- Rumination detected in journal → mindfulness prompt
- Low activity + low mood → values reminder + committed action

ML Models needed:
- Stress Detection (XGBoost/LSTM on wearable data)
- Intervention Recommender (contextual bandits)
- Mood Prediction (time series)
- Risk Detection (NLP)

### LAYER 4 — WEARABLE INTEGRATION ❌ NOT BUILT
APIs to integrate:
- Apple HealthKit (HR, HRV, sleep, steps, SpO2)
- Google Health Connect (Android equivalent)
- Fitbit API
- Garmin API

Physiological signals:
- Heart rate (current vs baseline)
- Heart rate variability (HRV)
- Respiratory rate
- Sleep duration + quality
- Step count
- Skin temperature
- Blood oxygen (SpO2)

Contextual signals:
- GPS location patterns
- Time of day
- Calendar events
- App usage patterns
- Screen time

### LAYER 5 — PSYCHOLOGIST PORTAL ❌ NOT BUILT
Full 20-stage clinical workflow:

Stage 1: Appointment booking
Stage 2: Registration + intake forms
Stage 3: Risk screening (CSSRS)
Stage 4: Clinical interview (adaptive questionnaire) ✅
Stage 5: Case history (personal, family, medical, psychiatric, trauma)
Stage 6: Mental Status Examination (MSE)
Stage 7: Psychological testing (20+ instruments) ✅ partial
Stage 8: Case formulation
Stage 9: Condition detection ✅
Stage 10: Treatment planning
Stage 11: Therapy sessions
Stage 12: Homework + between-session tasks
Stage 13: Progress monitoring ✅ partial
Stage 14: Crisis management
Stage 15: Multi-professional collaboration
Stage 16: Clinical documentation (SOAP/DAP/BIRP notes)
Stage 17: Treatment review
Stage 18: Relapse prevention
Stage 19: Termination + discharge summary
Stage 20: Follow-up scheduling

Psychologist features:
- Patient roster with risk flags
- Pre-session patient summary (AI generated)
- Session note generator (rough notes → SOAP/DAP/BIRP)
- Treatment plan builder (CBT/DBT/ACT mapping)
- Clinical report generator (full formal assessment)
- Between-session check-ins
- Cognitive pattern detector across sessions
- Progress charts (PHQ-9 trend, GAD-7 trend, mood arc)
- RCI verification badge (rehabcouncil.nic.in)
- Share code system (patient → psychologist linking)

### LAYER 6 — PLATFORM ❌ NOT BUILT
- Mobile app (React Native)
- Hindi/Hinglish support
- PDF report export (jsPDF)
- Share code system
- Crisis management + safety planning
- Push notifications (JITAI)
- Longitudinal tracking (Prophet forecasting)
- Data export (JSON/PDF)
- Account deletion + data sovereignty

---

## CURRENT BUILD STATUS

### ✅ DONE
- FastAPI backend (api/main.py)
- 13 ML models trained and saved to models/
- Adaptive questionnaire (AdaptiveQuestionnaire.js)
- PHQ-9, GAD-7, Big Five, Dark Triad, OCD, PTSD, ADHD, Burnout, RSE, Sleep instruments
- Condition classifier (76.2% accuracy, 7 conditions)
- Claude AI full report generator (2000+ words, 8 sections)
- Journal NLP (emotion + cognitive distortion + risk signals)
- Supabase auth (email/password)
- PostgreSQL schema (profiles, sessions, journal_entries)
- Dashboard (overview, history, journal tabs)
- GitHub: github.com/dpksaxena21/PsycheFlow
- Domain: psycheflow.in

### ❌ TODO (in order)
1. ACT Engine (Layer 2)
2. Psychologist Portal (Layer 5)
3. JITAI Engine (Layer 3)
4. Wearable Integration (Layer 4)
5. Mobile App (Layer 6)
6. Hindi/Hinglish support
7. PDF export
8. Crisis management
9. Deploy to Vercel + psycheflow.in

---

## TECH STACK

### Current (built)
- Backend: FastAPI + Python
- Frontend: React (CRA)
- Database: Supabase (PostgreSQL, Singapore region)
- Auth: Supabase Auth
- ML: XGBoost, LogReg, RandomForest, scikit-learn, SHAP
- NLP: Claude API (journal analysis + report generation)
- Condition Detection: TF-IDF + LogReg

### Planned upgrades
- Frontend: Migrate to Next.js + TailwindCSS
- Mobile: React Native
- Time series: Facebook Prophet (longitudinal mood)
- Voice: AssemblyAI (voice journal)
- Emotion (voice): Hume AI API
- Crisis detection: Perspective API
- NLP models: mental-roberta, emotion-distilroberta
- MLOps: MLflow + DVC + GitHub Actions
- Deployment: Vercel (frontend) + Render (API) + Supabase

---

## DATASETS

### Downloaded and used
- BIG5 (19,720 rows) — Big Five personality
- SD3 (18,192 rows) — Dark Triad
- MACH (73,489 rows) — Machiavellianism
- NPI (11,243 rows) — Narcissism
- RSE (47,975 rows) — Self-esteem
- HEXACO (22,787 rows) — Six-factor personality
- SENTIMENT_MH (53,043 rows) — 7 mental health conditions
- MH_GENERAL (292,364 rows) — Workplace mental health
- OSMI (1,259 rows) — Tech industry mental health
- STUDENT (101 rows) — Student mental health
- GoEmotions (43,410 rows) — 27 emotion labels
- HappyDB — 100K happy moments

### To download
- PHQ-9/GAD-7/PSS dataset (Kaggle)
- DASS-21 normative
- PCL-5 PTSD normative
- MBI Burnout normative
- AAQ-II (psychological flexibility)
- Valued Living Questionnaire

---

## REGULATORY POSITION
- Class B SaMD (Software as Medical Device) — India MDR 2017
- All outputs framed as screening/decision support NOT diagnosis
- Legal output formula: "Patterns consistent with..." never "You have..."
- Crisis resources always visible: iCall 9152987821

---

## CLINICAL ADVISOR
- Deepak's psychologist friend (name TBD)
- Role: Review ACT exercises, validate features, first portal user
- Recommended: Formal clinical advisory agreement

---

## BUSINESS MODEL
### B2C (individuals)
- Free: Basic assessment + journal
- Premium (₹499/month): Full report + ACT engine + history

### B2B (psychologists)
- Per psychologist (₹2,000-10,000/month)
- Clinic packages

### Enterprise
- Hospitals, universities, corporates
- Annual SaaS contracts

---

## BUILD ORDER (remaining)
Week 4  → Finish adaptive questionnaire + ACT Engine
Week 5  → Psychologist Portal (patient roster, SOAP notes)
Week 6  → JITAI intervention engine
Week 7  → Wearable API integration
Week 8  → Crisis management + safety planning
Week 9  → Mobile app (React Native)
Week 10 → UI/UX redesign (professional clinical design)
Week 11 → Deploy to Vercel + psycheflow.in
Week 12 → Clinical pilot with psychologist advisor

---

## HOW TO USE THIS DOCUMENT IN A NEW CHAT
Paste this at the start of any new Claude conversation:

"I am Deepak Saxena building PsycheFlow — an AI psychological intelligence platform.
GitHub: github.com/dpksaxena21/PsycheFlow
Domain: psycheflow.in
Project: /mnt/d/Projects/PsycheFlow on WSL Ubuntu
Stack: Python + FastAPI + React + PostgreSQL (Supabase)
Master Bible: docs/PSYCHEFLOW_MASTER_BIBLE.md

Current status: Adaptive questionnaire built, 13 ML models trained,
Claude AI report working, Supabase auth + database live.

Next task: [whatever we are doing next]

Rules:
- You write code, I type it and run it
- I paste only last 15 lines of output
- No re-explaining what is already done
- Continue directly from where we left off"

EOF