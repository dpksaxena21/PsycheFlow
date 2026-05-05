"""
PsycheFlow — Notebook 02
Proper Big Five Scoring with Reverse Scoring
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# ── Load & Clean ───────────────────────────────────────────
df = pd.read_csv("data/raw/cat_d_personality/BIG5/BIG5/data.csv", sep="\t")
df = df[(df['age'] >= 10) & (df['age'] <= 100)].copy()
df = df.dropna(subset=['country'])

print(f"Dataset loaded: {len(df):,} people")

# ── Reverse Scoring ────────────────────────────────────────
# Formula: reversed = 6 - original
# These questions are negatively worded — higher score = lower trait

reverse_questions = {
    'E': ['E2', 'E4', 'E6', 'E8', 'E10'],
    'N': ['N2', 'N4'],
    'A': ['A1', 'A3', 'A5', 'A7'],
    'C': ['C2', 'C4', 'C6', 'C8'],
    'O': ['O2', 'O4', 'O6']
}

# Apply reverse scoring
df_scored = df.copy()
for trait, questions in reverse_questions.items():
    for q in questions:
        # Replace 0 (missed) with NaN first
        df_scored[q] = df_scored[q].replace(0, np.nan)
        # Reverse score: 6 - score
        df_scored[q] = 6 - df_scored[q]

# Also replace 0 with NaN in non-reversed questions
all_questions = [f'{t}{i}' for t in ['E','N','A','C','O'] for i in range(1,11)]
for q in all_questions:
    df_scored[q] = df_scored[q].replace(0, np.nan)

# ── Compute Trait Scores ───────────────────────────────────
traits = {
    'Extraversion':      [f'E{i}' for i in range(1,11)],
    'Neuroticism':       [f'N{i}' for i in range(1,11)],
    'Agreeableness':     [f'A{i}' for i in range(1,11)],
    'Conscientiousness': [f'C{i}' for i in range(1,11)],
    'Openness':          [f'O{i}' for i in range(1,11)],
}

for trait, questions in traits.items():
    # Mean across questions, ignoring NaN (missed answers)
    df_scored[trait] = df_scored[questions].mean(axis=1)

print("\n--- PROPERLY SCORED PERSONALITY TRAITS ---")
for trait in traits:
    mean = df_scored[trait].mean()
    std  = df_scored[trait].std()
    print(f"  {trait:20s}: {mean:.2f} (±{std:.2f})")

# ── India vs USA (Properly Scored) ────────────────────────
print("\n--- INDIA vs USA (PROPERLY SCORED) ---")
india = df_scored[df_scored['country'] == 'IN']
usa   = df_scored[df_scored['country'] == 'US']

for trait in traits:
    india_mean = india[trait].mean()
    usa_mean   = usa[trait].mean()
    diff       = india_mean - usa_mean
    direction  = "higher" if diff > 0 else "lower"
    print(f"  {trait:20s}: India={india_mean:.2f}  USA={usa_mean:.2f}  ({abs(diff):.2f} {direction})")

# ── Save Cleaned Dataset ───────────────────────────────────
output_cols = ['age', 'gender', 'country'] + list(traits.keys())
df_scored[output_cols].to_csv('data/processed/big5_scored.csv', index=False)
print(f"\nSaved cleaned dataset: data/processed/big5_scored.csv")
print(f"Shape: {df_scored[output_cols].shape}")
