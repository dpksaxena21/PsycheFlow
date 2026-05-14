# ── PsycheFlow ACT Engine ─────────────────────────────────
import os
import json
import random
from datetime import datetime
from dotenv import load_dotenv

load_dotenv("/mnt/d/Projects/PsycheFlow/.env")

# ── ACT EXERCISE LIBRARY ──────────────────────────────────
ACT_EXERCISES = {
    "defusion": [
        {
            "id": "def_001",
            "title": "Leaves on a Stream",
            "duration": 5,
            "description": "Observe your thoughts like leaves floating on a stream",
            "steps": [
                "Close your eyes and imagine a gently flowing stream",
                "Picture leaves floating on the surface of the water",
                "As each thought arises, place it on a leaf",
                "Watch the leaf float downstream — no need to grab it",
                "If you get caught up in a thought, gently return to watching",
                "Continue for 5 minutes"
            ],
            "suitable_for": ["anxiety", "depression", "rumination"],
            "difficulty": "beginner"
        },
        {
            "id": "def_002",
            "title": "I Notice I'm Having the Thought That...",
            "duration": 2,
            "description": "Create distance from thoughts by labeling them",
            "steps": [
                "Notice a thought that is bothering you",
                "Instead of 'I am worthless', say 'I notice I'm having the thought that I am worthless'",
                "Add: 'My mind is telling me that...'",
                "Notice how the thought feels different with this distance",
                "You don't have to believe every thought your mind produces"
            ],
            "suitable_for": ["depression", "self-criticism", "anxiety"],
            "difficulty": "beginner"
        },
        {
            "id": "def_003",
            "title": "Thank Your Mind",
            "duration": 1,
            "description": "Acknowledge thoughts without fighting them",
            "steps": [
                "When a difficult thought appears, say 'Thank you mind, for that thought'",
                "Or: 'There goes my mind again, doing its worry thing'",
                "Acknowledge the thought without arguing with it",
                "Your mind is trying to protect you — it just overdoes it sometimes",
                "Return your attention to what you were doing"
            ],
            "suitable_for": ["anxiety", "worry", "self-criticism"],
            "difficulty": "beginner"
        }
    ],
    "acceptance": [
        {
            "id": "acc_001",
            "title": "Expansion Exercise",
            "duration": 5,
            "description": "Make room for difficult feelings without fighting them",
            "steps": [
                "Notice where you feel the emotion in your body",
                "Breathe into that space — imagine creating more room",
                "Observe the sensation: size, shape, temperature, weight",
                "Don't try to make it go away — just make room for it",
                "Say to yourself: 'I can have this feeling and still do what matters'",
                "The feeling may not go away, but your relationship with it changes"
            ],
            "suitable_for": ["anxiety", "depression", "anger", "grief"],
            "difficulty": "intermediate"
        },
        {
            "id": "acc_002",
            "title": "Urge Surfing",
            "duration": 10,
            "description": "Ride the wave of urges without acting on them",
            "steps": [
                "Notice the urge or craving you are experiencing",
                "Don't act on it — just observe it",
                "Urges are like waves — they build, peak, then subside",
                "Rate the intensity 0-10 every minute",
                "Notice: where do you feel it? What does it look like?",
                "Most urges peak within 10-20 minutes",
                "You have survived every urge you've ever faced so far"
            ],
            "suitable_for": ["addiction", "anger", "self-harm urges", "anxiety"],
            "difficulty": "intermediate"
        },
        {
            "id": "acc_003",
            "title": "DARE Response",
            "duration": 5,
            "description": "Defuse, Allow, Run toward, Engage",
            "steps": [
                "DEFUSE: Label the anxiety — 'I feel anxious'",
                "ALLOW: Say 'I allow this feeling to be here'",
                "RUN TOWARD: Move toward the feeling, not away",
                "ENGAGE: Bring attention back to present moment activity",
                "Repeat as needed — anxiety cannot hurt you"
            ],
            "suitable_for": ["anxiety", "panic", "avoidance"],
            "difficulty": "intermediate"
        }
    ],
    "present_moment": [
        {
            "id": "pres_001",
            "title": "5-4-3-2-1 Grounding",
            "duration": 3,
            "description": "Anchor yourself in the present using your senses",
            "steps": [
                "5 things you can SEE right now",
                "4 things you can TOUCH — feel their texture",
                "3 things you can HEAR",
                "2 things you can SMELL",
                "1 thing you can TASTE",
                "Take a slow breath. You are here, now, safe."
            ],
            "suitable_for": ["anxiety", "dissociation", "panic", "stress"],
            "difficulty": "beginner"
        },
        {
            "id": "pres_002",
            "title": "Mindful Breathing",
            "duration": 5,
            "description": "Use breath as an anchor to the present moment",
            "steps": [
                "Sit comfortably and close your eyes",
                "Breathe naturally — don't control it",
                "Place attention on the sensation of breathing",
                "Notice: the air entering, the pause, the air leaving",
                "When mind wanders (it will), gently return to breath",
                "Every return is a rep — you are training your mind"
            ],
            "suitable_for": ["anxiety", "stress", "depression", "rumination"],
            "difficulty": "beginner"
        },
        {
            "id": "pres_003",
            "title": "Body Scan",
            "duration": 10,
            "description": "Systematically bring awareness to each part of your body",
            "steps": [
                "Lie down or sit comfortably",
                "Start with your feet — notice any sensation",
                "Slowly move attention up: calves, knees, thighs",
                "Continue: abdomen, chest, hands, arms, shoulders",
                "Finish: neck, face, top of head",
                "No need to change anything — just notice",
                "Observe without judgment"
            ],
            "suitable_for": ["stress", "anxiety", "depression", "sleep"],
            "difficulty": "beginner"
        }
    ],
    "values": [
        {
            "id": "val_001",
            "title": "Values Compass",
            "duration": 15,
            "description": "Identify what truly matters to you across life domains",
            "steps": [
                "Rate each life domain 0-10 for importance:",
                "• Relationships (family, friends, partner)",
                "• Work/Career",
                "• Health & Body",
                "• Personal Growth & Learning",
                "• Spirituality/Meaning",
                "• Community & Contribution",
                "For your top 3: What does living this value look like?",
                "What small action today moves toward this value?"
            ],
            "suitable_for": ["depression", "low motivation", "life transitions"],
            "difficulty": "intermediate"
        },
        {
            "id": "val_002",
            "title": "Eulogy Exercise",
            "duration": 10,
            "description": "Clarify values by imagining your legacy",
            "steps": [
                "Imagine you are 90 years old, looking back at your life",
                "What do you want to have stood for?",
                "What do you want people to say about you?",
                "Write 3 sentences: 'He/She was someone who...'",
                "These sentences reveal your core values",
                "Ask: Is how I'm living today aligned with this?"
            ],
            "suitable_for": ["depression", "meaning crisis", "life direction"],
            "difficulty": "advanced"
        }
    ],
    "committed_action": [
        {
            "id": "com_001",
            "title": "Tiny Action Commitment",
            "duration": 5,
            "description": "Commit to one small values-aligned action today",
            "steps": [
                "Pick ONE value that matters to you",
                "Think of the SMALLEST possible action toward it",
                "Not 'exercise more' — but '5 minute walk after lunch'",
                "Not 'be a better friend' — but 'text one friend today'",
                "Write it down: 'Today I will _____ because I value _____'",
                "Do it. Then notice how it feels."
            ],
            "suitable_for": ["depression", "avoidance", "low motivation"],
            "difficulty": "beginner"
        },
        {
            "id": "com_002",
            "title": "If-Then Planning",
            "duration": 5,
            "description": "Create implementation intentions to follow through",
            "steps": [
                "Choose a valued action you've been avoiding",
                "Create an if-then plan:",
                "'IF [situation], THEN I will [action]'",
                "Example: 'If I feel anxious at work, then I will take 3 slow breaths before responding'",
                "Write 3 if-then plans for this week",
                "Research shows if-then planning doubles follow-through rates"
            ],
            "suitable_for": ["avoidance", "procrastination", "anxiety management"],
            "difficulty": "beginner"
        }
    ],
    "self_as_context": [
        {
            "id": "sac_001",
            "title": "The Observer Self",
            "duration": 8,
            "description": "Connect with the part of you that observes all experience",
            "steps": [
                "Close your eyes and notice: you are aware of your thoughts",
                "There is a part of you that NOTICES thoughts — it is not the thoughts",
                "You have had thousands of thoughts — but the NOTICER remains constant",
                "This is your Observer Self — it cannot be damaged or destroyed",
                "Even at your worst moments, this observer was there, watching",
                "Connect with this stable, consistent part of you",
                "From here, thoughts and feelings are just weather passing through"
            ],
            "suitable_for": ["identity crisis", "trauma", "depression", "anxiety"],
            "difficulty": "advanced"
        }
    ]
}

# ── JITAI ALGORITHM (Multi-Armed Bandit / UCB) ────────────
class JITAIEngine:
    """
    Just-In-Time Adaptive Intervention Engine
    Uses Upper Confidence Bound (UCB) algorithm to select
    optimal interventions based on past effectiveness
    """

    def __init__(self):
        self.exercise_stats = {}  # {exercise_id: {plays, total_reward}}

    def compute_stress_score(self, phq: int, gad: int,
                              journal_risk: dict, days_since_last: int) -> float:
        """Weighted stress score using clinical thresholds"""
        score = 0.0

        # PHQ-9 contribution (0-27 → 0-40 points)
        score += (phq / 27) * 40

        # GAD-7 contribution (0-21 → 0-30 points)
        score += (gad / 21) * 30

        # Journal risk signals (0-20 points)
        risk_weights = {
            'suicidal_ideation': 20,
            'self_harm_risk':    15,
            'depression':        8,
            'anxiety':           6,
            'isolation':         5
        }
        for signal, weight in risk_weights.items():
            val = journal_risk.get(signal, 'none')
            if val in ['high', 'severe', 'present']:
                score += weight
            elif val in ['medium', 'mild']:
                score += weight * 0.5

        # Time since last intervention bonus (max 10 points)
        score += min(days_since_last * 2, 10)

        return min(score, 100)

    def should_intervene(self, stress_score: float) -> bool:
        """Trigger intervention if stress score exceeds threshold"""
        return stress_score >= 35

    def select_exercise(self, condition: str, process: str = None) -> dict:
        """
        UCB Algorithm for exercise selection
        Balances exploitation (known good) vs exploration (try new)
        """
        # Filter by process if specified
        if process and process in ACT_EXERCISES:
            candidates = ACT_EXERCISES[process]
        else:
            # Select process based on condition
            process_map = {
                'anxiety':    ['defusion', 'acceptance', 'present_moment'],
                'depression': ['committed_action', 'values', 'acceptance'],
                'stress':     ['present_moment', 'acceptance', 'defusion'],
                'anger':      ['acceptance', 'defusion', 'present_moment'],
                'normal':     ['values', 'committed_action', 'self_as_context']
            }
            processes = process_map.get(condition, ['present_moment', 'defusion'])
            selected_process = random.choice(processes)
            candidates = ACT_EXERCISES.get(selected_process, ACT_EXERCISES['present_moment'])

        # UCB selection
        import math
        total_plays = sum(
            self.exercise_stats.get(e['id'], {}).get('plays', 0)
            for e in candidates
        )

        best_score = -1
        best_exercise = candidates[0]

        for exercise in candidates:
            stats = self.exercise_stats.get(exercise['id'], {'plays': 0, 'total_reward': 0})
            plays = stats['plays']

            if plays == 0:
                # Unexplored — prioritize exploration
                ucb_score = float('inf')
            else:
                avg_reward = stats['total_reward'] / plays
                exploration = math.sqrt(2 * math.log(max(total_plays, 1)) / plays)
                ucb_score = avg_reward + exploration

            if ucb_score > best_score:
                best_score = ucb_score
                best_exercise = exercise

        return best_exercise

    def record_feedback(self, exercise_id: str, helpful: bool):
        """Update UCB weights based on user feedback"""
        if exercise_id not in self.exercise_stats:
            self.exercise_stats[exercise_id] = {'plays': 0, 'total_reward': 0}

        self.exercise_stats[exercise_id]['plays'] += 1
        self.exercise_stats[exercise_id]['total_reward'] += 1 if helpful else 0

# Global JITAI instance
jitai = JITAIEngine()

def get_recommended_exercise(condition: str, phq: int, gad: int,
                              journal_risk: dict = None,
                              days_since_last: int = 1) -> dict:
    """Main function to get recommended ACT exercise"""
    risk = journal_risk or {}
    stress = jitai.compute_stress_score(phq, gad, risk, days_since_last)
    exercise = jitai.select_exercise(condition)
    return {
        'exercise': exercise,
        'stress_score': round(stress, 1),
        'should_intervene': jitai.should_intervene(stress)
    }