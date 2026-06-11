# ── Journal NLP Analysis — Full Intelligence Layer ────────
import anthropic
import json
import os
from dotenv import load_dotenv
load_dotenv(dotenv_path="/mnt/d/Projects/PsycheFlow/.env")

client = anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))

THEMES = ['Work Stress','Relationships','Family','Finance','Career','Health','Loneliness',
          'Self-Esteem','Trauma','Sleep','Academic','Grief','Identity','Purpose','Burnout',
          'Social Anxiety','Anger','Substance Use','Parenting','Physical Health']

COGNITIVE_DISTORTIONS = ['Catastrophizing','Overgeneralization','Black-and-white thinking',
                          'Mind reading','Personalization','Emotional reasoning','Should statements',
                          'Magnification','Mental filter','Jumping to conclusions','Labeling',
                          'Discounting positives']

RISK_PHRASES = ['dont want to live','don\'t want to live','end my life','kill myself',
                'no reason to live','better off dead','want to die','suicidal',
                'hurt myself','self harm','cut myself','overdose']

def detect_risk_phrases(text: str) -> dict:
    text_lower = text.lower()
    found = [p for p in RISK_PHRASES if p in text_lower]
    level = 'high' if len(found) >= 2 else 'medium' if len(found) == 1 else 'none'
    return {'level': level, 'phrases_detected': found, 'immediate_action': level in ['high','medium']}

def analyze_journal(text: str) -> dict:
    # First do fast local risk check
    local_risk = detect_risk_phrases(text)

    prompt = f"""You are a clinical psychologist AI. Analyze this journal entry with full clinical depth.
Return ONLY valid JSON, no markdown, no extra text.

Journal entry:
\"\"\"{text}\"\"\"

Return this exact JSON:
{{
  "emotions": {{
    "primary": "one of: joy/sadness/anger/fear/disgust/surprise/trust/anticipation/anxiety/shame/guilt/hopelessness",
    "secondary": ["list of other emotions detected, max 4"],
    "intensity": "low/medium/high",
    "valence": "positive/negative/mixed"
  }},
  "themes": [
    {{
      "theme": "theme name from: {', '.join(THEMES[:12])}",
      "confidence": 0.0,
      "evidence": "brief quote or reason"
    }}
  ],
  "cognitive_distortions": [
    {{
      "type": "distortion type",
      "evidence": "exact quote from text showing distortion",
      "severity": "mild/moderate/severe",
      "reframe": "how to reframe this thought"
    }}
  ],
  "risk_signals": {{
    "depression_indicators": "none/mild/moderate/severe",
    "anxiety_indicators": "none/mild/moderate/severe",
    "isolation_indicators": "none/mild/moderate/severe",
    "self_harm_risk": "none/low/medium/high",
    "hopelessness_level": "none/low/medium/high",
    "crisis_indicators": []
  }},
  "sentiment": {{
    "overall": "very_negative/negative/neutral/positive/very_positive",
    "score": 0.0,
    "trajectory": "improving/stable/worsening/unknown"
  }},
  "linguistic_markers": {{
    "self_referential_language": "low/medium/high",
    "negative_word_density": "low/medium/high",
    "hopelessness_language": true,
    "help_seeking_language": false,
    "future_orientation": "absent/present/strong"
  }},
  "clinical_summary": "2-3 sentence professional clinical summary",
  "recommended_focus": "single most important therapeutic focus area",
  "session_preparation_brief": "what a psychologist should know before the next session",
  "positive_indicators": ["any protective factors or strengths observed"],
  "homework_suggestions": ["1-2 specific therapeutic exercises based on themes"]
}}"""

    try:
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = message.content[0].text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw.strip())

        # Merge local risk detection (more reliable for explicit phrases)
        if local_risk['level'] != 'none':
            result['risk_signals']['self_harm_risk'] = local_risk['level']
            result['risk_signals']['crisis_indicators'] = local_risk['phrases_detected']
            result['_immediate_crisis'] = True

        # Normalize themes to just list of strings for backward compat
        result['psychological_themes'] = [t['theme'] for t in result.get('themes', [])]

        return result
    except Exception as e:
        # Fallback minimal response
        return {
            "emotions": {"primary": "unknown", "secondary": [], "intensity": "medium", "valence": "negative"},
            "themes": [],
            "psychological_themes": [],
            "cognitive_distortions": [],
            "risk_signals": {"depression_indicators": "mild", "anxiety_indicators": "mild",
                           "isolation_indicators": "none", "self_harm_risk": local_risk['level'],
                           "hopelessness_level": "none", "crisis_indicators": local_risk['phrases_detected']},
            "sentiment": {"overall": "negative", "score": -0.3, "trajectory": "unknown"},
            "linguistic_markers": {"self_referential_language": "medium", "negative_word_density": "medium",
                                  "hopelessness_language": False, "help_seeking_language": False, "future_orientation": "absent"},
            "clinical_summary": "Analysis temporarily unavailable. Manual review recommended.",
            "recommended_focus": "General emotional support",
            "session_preparation_brief": "Review journal entry manually before session.",
            "positive_indicators": [],
            "homework_suggestions": [],
            "_immediate_crisis": local_risk['immediate_action'],
            "_error": str(e)
        }


def extract_population_themes(journal_texts: list) -> dict:
    """Aggregate themes across multiple journals for hospital population analytics"""
    all_themes = {}
    all_emotions = {}
    risk_count = 0

    for text in journal_texts:
        try:
            result = analyze_journal(text)
            for theme in result.get('psychological_themes', []):
                all_themes[theme] = all_themes.get(theme, 0) + 1
            emotion = result.get('emotions', {}).get('primary', '')
            if emotion:
                all_emotions[emotion] = all_emotions.get(emotion, 0) + 1
            if result.get('risk_signals', {}).get('self_harm_risk') not in ['none', None]:
                risk_count += 1
        except:
            continue

    total = max(len(journal_texts), 1)
    return {
        "top_themes": sorted(all_themes.items(), key=lambda x: -x[1])[:10],
        "emotion_distribution": sorted(all_emotions.items(), key=lambda x: -x[1])[:8],
        "risk_percentage": round(risk_count / total * 100, 1),
        "total_analyzed": total
    }
