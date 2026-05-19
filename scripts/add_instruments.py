# This script shows the new instrument questions to add to AdaptiveQuestionnaire.js

instruments = {
    "DASS-21": {
        "trigger": "stress > 10 or depression > 10 or anxiety > 10",
        "questions": [
            ("DASS1", "I found it hard to wind down", [0,1,2,3]),
            ("DASS2", "I was aware of dryness of my mouth", [0,1,2,3]),
            ("DASS3", "I couldn't seem to experience any positive feeling at all", [0,1,2,3]),
            ("DASS4", "I experienced breathing difficulty", [0,1,2,3]),
            ("DASS5", "I found it difficult to work up the initiative to do things", [0,1,2,3]),
            ("DASS6", "I tended to over-react to situations", [0,1,2,3]),
            ("DASS7", "I experienced trembling (e.g. in the hands)", [0,1,2,3]),
        ],
        "scoring": "D=sum(3,5,10,13,16,17,21), A=sum(2,4,7,9,15,19,20), S=sum(1,6,8,11,12,14,18)"
    },
    "WHO-5": {
        "trigger": "always show in wellbeing track",
        "questions": [
            ("WHO1", "I have felt cheerful and in good spirits", [0,1,2,3,4,5]),
            ("WHO2", "I have felt calm and relaxed", [0,1,2,3,4,5]),
            ("WHO3", "I have felt active and vigorous", [0,1,2,3,4,5]),
            ("WHO4", "I woke up feeling fresh and rested", [0,1,2,3,4,5]),
            ("WHO5", "My daily life has been filled with things that interest me", [0,1,2,3,4,5]),
        ],
        "scoring": "score = sum * 4, range 0-100, <50 = poor wellbeing"
    },
    "AUDIT": {
        "trigger": "user selects addiction concern",
        "questions": [
            ("AUD1", "How often do you have a drink containing alcohol?", ["Never","Monthly","2-4x/month","2-3x/week","4+x/week"]),
            ("AUD2", "How many drinks do you have on a typical day?", ["1-2","3-4","5-6","7-9","10+"]),
            ("AUD3", "How often do you have 6 or more drinks on one occasion?", ["Never","Less than monthly","Monthly","Weekly","Daily"]),
        ],
        "scoring": "0-7 low risk, 8-15 medium, 16-19 high, 20+ severe"
    },
    "ISI": {
        "trigger": "sleep problems selected or PSQI > 5",
        "questions": [
            ("ISI1", "Difficulty falling asleep", [0,1,2,3,4]),
            ("ISI2", "Difficulty staying asleep", [0,1,2,3,4]),
            ("ISI3", "Problems waking up too early", [0,1,2,3,4]),
            ("ISI4", "How satisfied are you with your sleep?", [0,1,2,3,4]),
            ("ISI5", "How noticeable to others is your sleep problem?", [0,1,2,3,4]),
            ("ISI6", "How worried are you about your sleep problem?", [0,1,2,3,4]),
            ("ISI7", "How much does your sleep problem interfere with daily functioning?", [0,1,2,3,4]),
        ],
        "scoring": "0-7 no insomnia, 8-14 mild, 15-21 moderate, 22-28 severe"
    },
    "WHO-5": {
        "trigger": "always",
        "questions": [
            ("WHO1", "I have felt cheerful and in good spirits", [0,1,2,3,4,5]),
            ("WHO2", "I have felt calm and relaxed", [0,1,2,3,4,5]),
            ("WHO3", "I have felt active and vigorous", [0,1,2,3,4,5]),
            ("WHO4", "I woke up feeling fresh and rested", [0,1,2,3,4,5]),
            ("WHO5", "My daily life has been filled with things that interest me", [0,1,2,3,4,5]),
        ],
        "scoring": "score = sum * 4, range 0-100, <50 poor wellbeing"
    }
}

for name, data in instruments.items():
    print(f"\n{name}: {len(data['questions'])} questions")
    print(f"Trigger: {data['trigger']}")
    print(f"Scoring: {data['scoring']}")

print("\nTotal new questions:", sum(len(d['questions']) for d in instruments.values()))
