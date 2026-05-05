"""
PsycheFlow — Notebook 03
Dark Triad (SD3) Analysis
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# ── Load Data ──────────────────────────────────────────────
df = pd.read_csv("data/raw/cat_d_personality/SD3/SD3/data.csv", sep="\t")
print(f"Dark Triad dataset: {df.shape}")
print(f"\nFirst 3 rows:")
print(df.head(3))
print(f"\nCountries (top 5):")
print(df['country'].value_counts().head())

# ── Reverse Scoring ────────────────────────────────────────
df_scored = df.copy()

# Replace 0 (missed) with NaN
all_q = [f'M{i}' for i in range(1,10)] + \
        [f'N{i}' for i in range(1,10)] + \
        [f'P{i}' for i in range(1,10)]
for q in all_q:
    df_scored[q] = df_scored[q].replace(0, np.nan)

# Reverse scored questions
reverse = ['N2', 'N6', 'N8', 'P2', 'P7']
for q in reverse:
    df_scored[q] = 6 - df_scored[q]

# ── Compute Scores ─────────────────────────────────────────
df_scored['Machiavellianism'] = df_scored[[f'M{i}' for i in range(1,10)]].mean(axis=1)
df_scored['Narcissism']       = df_scored[[f'N{i}' for i in range(1,10)]].mean(axis=1)
df_scored['Psychopathy']      = df_scored[[f'P{i}' for i in range(1,10)]].mean(axis=1)

print("\n--- DARK TRIAD SCORES (Global Average) ---")
for trait in ['Machiavellianism', 'Narcissism', 'Psychopathy']:
    mean = df_scored[trait].mean()
    std  = df_scored[trait].std()
    print(f"  {trait:20s}: {mean:.2f} (±{std:.2f})")

# ── India vs USA ───────────────────────────────────────────
india = df_scored[df_scored['country'] == 'IN']
usa   = df_scored[df_scored['country'] == 'US']

print(f"\n--- INDIA vs USA DARK TRIAD ---")
print(f"India sample: {len(india)} | USA sample: {len(usa)}")
for trait in ['Machiavellianism', 'Narcissism', 'Psychopathy']:
    i_mean = india[trait].mean()
    u_mean = usa[trait].mean()
    diff   = i_mean - u_mean
    direction = "higher" if diff > 0 else "lower"
    print(f"  {trait:20s}: India={i_mean:.2f}  USA={u_mean:.2f}  ({abs(diff):.2f} {direction})")

# ── Save ───────────────────────────────────────────────────
out_cols = ['country', 'Machiavellianism', 'Narcissism', 'Psychopathy']
df_scored[out_cols].to_csv('data/processed/dark_triad_scored.csv', index=False)
print(f"\nSaved: data/processed/dark_triad_scored.csv")
