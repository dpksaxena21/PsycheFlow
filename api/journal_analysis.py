# ── Journal NLP Analysis via Claude ──────────────────────
import anthropic
import json

from dotenv import load_dotenv
import os
load_dotenv(dotenv_path="/mnt/d/Projects/PsycheFlow/.env")

client = anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))

def analyze_journal(text: str) -> dict:
    prompt = f"""You are a clinical psychologist AI assistant. Analyze this journal entry and return ONLY a JSON object with no extra text.

Journal entry:
\"\"\"{text}\"\"\"

Return this exact JSON structure:
{{
  "emotions": {{
    "primary": "string (joy/sadness/anger/fear/disgust/surprise/trust/anticipation)",
    "secondary": ["list", "of", "other", "emotions", "detected"],
    "intensity": "low/medium/high"
  }},
  "cognitive_distortions": [
    {{
      "type": "distortion name",
      "evidence": "quote from text",
      "severity": "mild/moderate/severe"
    }}
  ],
  "risk_signals": {{
    "depression_indicators": "none/mild/moderate/severe",
    "anxiety_indicators": "none/mild/moderate/severe",
    "isolation_indicators": "none/mild/moderate/severe",
    "self_harm_risk": "none/low/medium/high"
  }},
  "linguistic_markers": {{
    "self_referential_language": "low/medium/high",
    "negative_word_density": "low/medium/high",
    "hopelessness_language": true/false,
    "help_seeking_language": true/false
  }},
  "psychological_themes": ["theme1", "theme2", "theme3"],
  "clinical_summary": "2-3 sentence professional summary of psychological state",
  "recommended_focus": "one key area the person should focus on"
}}"""

    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text.strip()
    # Clean markdown if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())