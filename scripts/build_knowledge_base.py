# ── PsycheFlow RAG Knowledge Base Builder ────────────────
import os
import json
from dotenv import load_dotenv

load_dotenv("/mnt/d/Projects/PsycheFlow/.env")

from sentence_transformers import SentenceTransformer
from supabase import create_client

print("Loading embedding model...")
model = SentenceTransformer('all-MiniLM-L6-v2')

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

# ── KNOWLEDGE BASE ────────────────────────────────────────
knowledge = [

    # DSM-5 CRITERIA
    {
        "category": "DSM-5",
        "subcategory": "Major Depressive Disorder",
        "content": "Major Depressive Disorder (MDD) requires 5+ symptoms during same 2-week period, representing change from previous functioning. Must include depressed mood OR loss of interest/pleasure. Symptoms: depressed mood, diminished interest, weight change, sleep disturbance, psychomotor changes, fatigue, worthlessness/guilt, concentration difficulty, recurrent death thoughts. Causes clinically significant distress or functional impairment.",
        "source": "DSM-5-TR"
    },
    {
        "category": "DSM-5",
        "subcategory": "Generalized Anxiety Disorder",
        "content": "GAD requires excessive anxiety and worry about multiple events for 6+ months, difficult to control. 3+ symptoms: restlessness, fatigue, concentration difficulty, irritability, muscle tension, sleep disturbance. Causes significant distress or functional impairment. Not attributable to substances or medical condition.",
        "source": "DSM-5-TR"
    },
    {
        "category": "DSM-5",
        "subcategory": "PTSD",
        "content": "PTSD requires exposure to actual or threatened death, serious injury, or sexual violence. Symptoms: intrusion (flashbacks, nightmares), avoidance of trauma reminders, negative alterations in cognition/mood, alterations in arousal/reactivity. Duration 1+ month. Significant distress or functional impairment.",
        "source": "DSM-5-TR"
    },
    {
        "category": "DSM-5",
        "subcategory": "Bipolar I Disorder",
        "content": "Bipolar I requires at least one manic episode. Manic episode: elevated/expansive/irritable mood + increased goal-directed activity, 1 week minimum. Symptoms: grandiosity, decreased sleep need, pressured speech, racing thoughts, distractibility, increased goal-directed activity, risky behavior. Severe enough to cause marked impairment or require hospitalization.",
        "source": "DSM-5-TR"
    },
    {
        "category": "DSM-5",
        "subcategory": "OCD",
        "content": "OCD requires obsessions (recurrent intrusive thoughts causing anxiety) and/or compulsions (repetitive behaviors to reduce anxiety). Person recognizes obsessions are excessive. Time-consuming (1+ hour/day) or causes significant distress/impairment. Common obsessions: contamination, harm, symmetry. Common compulsions: washing, checking, counting, ordering.",
        "source": "DSM-5-TR"
    },
    {
        "category": "DSM-5",
        "subcategory": "ADHD",
        "content": "ADHD requires persistent pattern of inattention and/or hyperactivity-impulsivity interfering with functioning. Onset before age 12. Inattention symptoms: careless mistakes, difficulty sustaining attention, not listening, not following through, disorganization, losing things, forgetfulness. Hyperactivity symptoms: fidgeting, leaving seat, running inappropriately, inability to play quietly, talking excessively, interrupting.",
        "source": "DSM-5-TR"
    },
    {
        "category": "DSM-5",
        "subcategory": "Social Anxiety Disorder",
        "content": "Social anxiety disorder involves marked fear of social situations where scrutiny by others may occur. Fear of acting in embarrassing way or showing anxiety symptoms. Social situations almost always provoke anxiety. Situations avoided or endured with distress. Fear disproportionate to actual threat. Duration 6+ months.",
        "source": "DSM-5-TR"
    },
    {
        "category": "DSM-5",
        "subcategory": "Panic Disorder",
        "content": "Panic disorder requires recurrent unexpected panic attacks. Panic attack: abrupt surge of intense fear peaking within minutes. Symptoms: palpitations, sweating, trembling, shortness of breath, chest pain, nausea, dizziness, chills, paresthesias, derealization, fear of losing control, fear of dying. At least one attack followed by 1+ month of concern about additional attacks.",
        "source": "DSM-5-TR"
    },

    # CBT TECHNIQUES
    {
        "category": "CBT",
        "subcategory": "Cognitive Restructuring",
        "content": "Cognitive restructuring identifies and challenges automatic negative thoughts and cognitive distortions. Steps: identify the automatic thought, identify the emotion and its intensity, identify cognitive distortions (catastrophizing, black-and-white thinking, mind reading, fortune telling, personalization, overgeneralization), examine evidence for and against the thought, generate alternative balanced thought, re-rate emotion intensity.",
        "source": "Beck CBT"
    },
    {
        "category": "CBT",
        "subcategory": "Cognitive Distortions",
        "content": "Common cognitive distortions: All-or-nothing thinking (seeing in extremes), Overgeneralization (single event as pattern), Mental filter (focusing on negatives), Disqualifying positives, Mind reading (assuming others thoughts), Fortune telling (predicting negatives), Catastrophizing (magnifying problems), Emotional reasoning (feelings as facts), Should statements (rigid rules), Labeling (negative global judgments), Personalization (self-blame for external events).",
        "source": "Beck CBT"
    },
    {
        "category": "CBT",
        "subcategory": "Behavioral Activation",
        "content": "Behavioral activation treats depression by increasing engagement with rewarding activities. Depression causes withdrawal which maintains depression. Steps: monitor daily activities and mood, identify values and meaningful activities, schedule activities starting with small achievable steps, track mood before and after activities, gradually increase activity level. Particularly effective for anhedonia and low motivation.",
        "source": "CBT for Depression"
    },
    {
        "category": "CBT",
        "subcategory": "Exposure Therapy",
        "content": "Exposure therapy treats anxiety through systematic confrontation of feared stimuli. Types: in vivo (real situations), imaginal (mental imagery), interoceptive (bodily sensations). Create fear hierarchy from least to most anxiety-provoking. Begin with lower items, progress as anxiety reduces. Inhibitory learning model: new safety learning inhibits fear response. Used for PTSD, OCD, phobias, panic disorder, social anxiety.",
        "source": "CBT for Anxiety"
    },

    # ACT TECHNIQUES
    {
        "category": "ACT",
        "subcategory": "Six Core Processes",
        "content": "ACT six core processes of psychological flexibility: 1) Acceptance - willingness to have difficult experiences without avoidance, 2) Cognitive Defusion - observing thoughts as thoughts not facts, 3) Present Moment Awareness - mindful contact with current experience, 4) Self-as-Context - the observing self beyond content of mind, 5) Values - chosen life directions that give meaning, 6) Committed Action - behavior change guided by values despite obstacles.",
        "source": "ACT Hayes"
    },
    {
        "category": "ACT",
        "subcategory": "Cognitive Defusion",
        "content": "Cognitive defusion techniques create distance from thoughts. Exercises: 'I notice I'm having the thought that...', 'My mind is telling me...', Leaves on a stream (observe thoughts passing), Thanking your mind for the thought, Saying thought in silly voice, Repeating word until meaning dissolves. Goal is to change relationship with thought, not eliminate it.",
        "source": "ACT Hayes"
    },
    {
        "category": "ACT",
        "subcategory": "Values Clarification",
        "content": "ACT values are chosen life directions, not goals. Life domains: relationships, parenting, family, friendships, work/career, education, leisure, spirituality, community, health. Values questions: What do you want your life to stand for? What kind of person do you want to be? What matters most to you? Values are different from goals - values are directions, goals are destinations. Committed action means acting according to values even when difficult.",
        "source": "ACT Hayes"
    },
    {
        "category": "ACT",
        "subcategory": "Acceptance",
        "content": "Acceptance in ACT means willingness to experience difficult thoughts, feelings, sensations without defense. Not resignation or liking the experience. Experiential avoidance (trying to control internal experiences) is a primary source of psychological suffering. Acceptance exercises: DARE (Defuse, Allow, Run toward, Engage), expansion exercises, urge surfing, body scan with difficult emotions.",
        "source": "ACT Hayes"
    },

    # DBT TECHNIQUES
    {
        "category": "DBT",
        "subcategory": "Core Skills",
        "content": "DBT four skill modules: 1) Mindfulness - core skill, observe and describe without judgment, 2) Distress Tolerance - crisis survival skills (TIPP, ACCEPTS, self-soothe), 3) Emotion Regulation - reduce vulnerability, increase positive emotions, opposite action, 4) Interpersonal Effectiveness - DEAR MAN (Describe, Express, Assert, Reinforce, Mindful, Appear confident, Negotiate) for asking for things, GIVE for relationships, FAST for self-respect.",
        "source": "DBT Linehan"
    },
    {
        "category": "DBT",
        "subcategory": "Distress Tolerance",
        "content": "DBT distress tolerance skills for crisis survival: TIPP (Temperature - cold water on face, Intense exercise, Paced breathing, Progressive relaxation), ACCEPTS (Activities, Contributing, Comparisons, Emotions opposite, Pushing away, Thoughts, Sensations), Self-soothe with five senses, IMPROVE the moment (Imagery, Meaning, Prayer, Relaxation, One thing in the moment, Vacation, Encouragement).",
        "source": "DBT Linehan"
    },

    # CLINICAL ASSESSMENT
    {
        "category": "Assessment",
        "subcategory": "PHQ-9 Interpretation",
        "content": "PHQ-9 scoring: 0-4 Minimal depression (monitor, no treatment), 5-9 Mild depression (watchful waiting, repeat PHQ-9), 10-14 Moderate depression (treatment plan, counseling), 15-19 Moderately severe depression (active treatment with medication and/or therapy), 20-27 Severe depression (immediate initiation of pharmacotherapy and expedited referral to mental health specialist). PHQ-9 item 9 screens for suicidal ideation.",
        "source": "Kroenke et al. 2001"
    },
    {
        "category": "Assessment",
        "subcategory": "GAD-7 Interpretation",
        "content": "GAD-7 scoring: 0-4 Minimal anxiety, 5-9 Mild anxiety, 10-14 Moderate anxiety (consider counseling, stress management), 15-21 Severe anxiety (active treatment warranted). Sensitivity 89%, specificity 82% for GAD. Also screens for panic disorder, social anxiety, PTSD. Consider further evaluation when score 10+.",
        "source": "Spitzer et al. 2006"
    },
    {
        "category": "Assessment",
        "subcategory": "Risk Assessment",
        "content": "Suicide risk assessment components: Ideation (passive vs active, frequency, intensity, duration), Plan (specificity, lethality), Means (access to lethal means), Intent (intention to act), Behavior (previous attempts, self-harm), Protective factors (reasons for living, social support, religious beliefs, responsibility for children). Risk levels: Low (ideation, no plan, protected), Moderate (ideation with plan, limited intent), High (plan with intent and means).",
        "source": "Columbia CSSRS"
    },

    # INDIAN MENTAL HEALTH CONTEXT
    {
        "category": "India Context",
        "subcategory": "Epidemiology",
        "content": "India mental health statistics: 197 million people need mental health support (WHO). Only 4,309 clinical psychologists for 1.4 billion people. 80-92% treatment gap. NMHS 2015-16 found 13.7% prevalence of mental disorders. Depression prevalence 2.7%, anxiety disorders 3.5%. Suicide rate 12.9 per 100,000. Cultural factors: mental health stigma high, help-seeking low, family-centered society, stress often described as 'tension' or physical symptoms.",
        "source": "NMHS 2015, WHO India"
    },
    {
        "category": "India Context",
        "subcategory": "Cultural Considerations",
        "content": "Indian cultural factors in mental health assessment: Somatization common (physical symptoms expressing emotional distress), Family involvement expected in treatment decisions, Stigma prevents disclosure especially for men, Religious and spiritual explanations for mental illness common, Hierarchical family structures affect autonomy, Arranged marriage context relevant for relationship assessment, Academic and career pressure common stressor especially in youth.",
        "source": "Clinical Guidelines India"
    },

    # THERAPY SELECTION
    {
        "category": "Treatment",
        "subcategory": "Therapy Selection Guide",
        "content": "Evidence-based therapy selection: Depression - CBT (first line), Behavioral Activation, IPT, ACT. Anxiety disorders - CBT with exposure (first line), ACT. PTSD - Prolonged Exposure, CPT, EMDR. OCD - ERP (Exposure Response Prevention). Bipolar - Psychoeducation, CBT, Family Therapy. BPD - DBT (first line). ADHD - CBT, skills training. Eating disorders - CBT-E, FBT. Psychosis - CBT for Psychosis (CBTp).",
        "source": "APA Clinical Guidelines"
    },
    {
        "category": "Treatment",
        "subcategory": "SOAP Note Format",
        "content": "SOAP note format: S (Subjective) - patient's own words about symptoms, concerns, progress since last session. O (Objective) - clinician observations, test scores, mental status examination findings. A (Assessment) - clinical formulation, diagnosis, risk assessment, progress toward goals. P (Plan) - interventions used this session, homework assigned, next session focus, referrals, medication changes. DAP format alternative: D (Data), A (Assessment), P (Plan).",
        "source": "Clinical Documentation"
    },
    {
        "category": "Treatment",
        "subcategory": "Case Formulation",
        "content": "Case formulation 4P model: Predisposing factors (vulnerability factors - genetics, early experiences, personality), Precipitating factors (triggers - recent stressors, life events), Perpetuating factors (maintaining factors - avoidance, unhelpful beliefs, lack of support), Protective factors (resilience - strengths, support, coping skills). Formulation guides treatment selection and helps patient understand their difficulties.",
        "source": "Clinical Psychology"
    },
]

print(f"Creating embeddings for {len(knowledge)} knowledge items...")

for i, item in enumerate(knowledge):
    embedding = model.encode(item['content']).tolist()

    result = supabase.table('psychology_knowledge').insert({
        'category':    item['category'],
        'subcategory': item['subcategory'],
        'content':     item['content'],
        'embedding':   embedding,
        'source':      item['source']
    }).execute()

    print(f"  ✓ [{i+1}/{len(knowledge)}] {item['category']} — {item['subcategory']}")

print(f"\n✓ Knowledge base built: {len(knowledge)} items embedded")
print("✓ Stored in Supabase psychology_knowledge table")