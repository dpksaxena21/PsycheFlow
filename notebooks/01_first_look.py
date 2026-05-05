"""
PsycheFlow — Notebook 01
First Look at the Data
"""

import pandas as pd
import numpy as np

# ── Load the Big Five dataset ──────────────────────────────
print("Loading BIG5 dataset...")
df = pd.read_csv("data/raw/cat_d_personality/BIG5/BIG5/data.csv", sep="\t")

print(f"\nShape: {df.shape}")
print(f"That means: {df.shape[0]:,} people, {df.shape[1]} columns")
print(f"\nFirst 5 rows:")
print(df.head())
print(f"\nColumn names:")
print(df.columns.tolist())
print(f"\nBasic statistics:")
print(df.describe())
# ── Data Quality Check ─────────────────────────────────────
print("\n--- DATA QUALITY CHECK ---")
print(f"Age - suspicious values (>100): {(df['age'] > 100).sum()}")
print(f"Age - valid range (10-100): {((df['age'] >= 10) & (df['age'] <= 100)).sum()}")
print(f"Missing values per column:\n{df.isnull().sum()[df.isnull().sum() > 0]}")
print(f"\nCountry distribution (top 10):")
print(df['country'].value_counts().head(10))
print(f"\nGender distribution:")
print(df['gender'].value_counts())
# ── Data Cleaning ──────────────────────────────────────────
print("\n--- CLEANING DATA ---")

# Remove invalid ages
df_clean = df[(df['age'] >= 10) & (df['age'] <= 100)].copy()
print(f"Rows before cleaning: {len(df)}")
print(f"Rows after cleaning:  {len(df_clean)}")

# Remove rows with missing country
df_clean = df_clean.dropna(subset=['country'])
print(f"Rows after dropping missing country: {len(df_clean)}")

# ── Compute Personality Scores ─────────────────────────────
print("\n--- COMPUTING PERSONALITY SCORES ---")

# Each trait has 10 questions scored 1-5
# We average them to get a trait score between 1-5
# Some questions are REVERSE scored (higher answer = lower trait)
# For now we do simple average — we'll handle reverse scoring next

df_clean['Extraversion']     = df_clean[['E1','E2','E3','E4','E5','E6','E7','E8','E9','E10']].mean(axis=1)
df_clean['Neuroticism']      = df_clean[['N1','N2','N3','N4','N5','N6','N7','N8','N9','N10']].mean(axis=1)
df_clean['Agreeableness']    = df_clean[['A1','A2','A3','A4','A5','A6','A7','A8','A9','A10']].mean(axis=1)
df_clean['Conscientiousness']= df_clean[['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10']].mean(axis=1)
df_clean['Openness']         = df_clean[['O1','O2','O3','O4','O5','O6','O7','O8','O9','O10']].mean(axis=1)

print("\nAverage personality scores (1-5 scale):")
traits = ['Extraversion','Neuroticism','Agreeableness','Conscientiousness','Openness']
for trait in traits:
    mean = df_clean[trait].mean()
    std  = df_clean[trait].std()
    print(f"  {trait:20s}: {mean:.2f} (±{std:.2f})")

# ── India vs US Comparison ─────────────────────────────────
print("\n--- INDIA vs US PERSONALITY COMPARISON ---")
india = df_clean[df_clean['country'] == 'IN']
usa   = df_clean[df_clean['country'] == 'US']

print(f"India sample: {len(india)} people")
print(f"USA sample:   {len(usa)} people")
print()
for trait in traits:
    india_mean = india[trait].mean()
    usa_mean   = usa[trait].mean()
    diff       = india_mean - usa_mean
    direction  = "higher" if diff > 0 else "lower"
    print(f"  {trait:20s}: India={india_mean:.2f}  USA={usa_mean:.2f}  India is {abs(diff):.2f} {direction}")
    # ── Visualisation ──────────────────────────────────────────
import matplotlib.pyplot as plt
import numpy as np

print("\n--- CREATING CHART ---")

traits = ['Extraversion','Neuroticism','Agreeableness','Conscientiousness','Openness']
india_scores = [india[t].mean() for t in traits]
usa_scores   = [usa[t].mean() for t in traits]

x = np.arange(len(traits))
width = 0.35

fig, ax = plt.subplots(figsize=(10, 6))
bars1 = ax.bar(x - width/2, india_scores, width, label='India', color='#FF9933', alpha=0.85)
bars2 = ax.bar(x + width/2, usa_scores,   width, label='USA',   color='#3C3B6E', alpha=0.85)

ax.set_xlabel('Personality Trait', fontsize=12)
ax.set_ylabel('Average Score (1-5)', fontsize=12)
ax.set_title('Big Five Personality: India vs USA\nPsycheFlow EDA — Real Data from 10,188 people', fontsize=13)
ax.set_xticks(x)
ax.set_xticklabels(traits, rotation=15)
ax.set_ylim(2.5, 4.0)
ax.legend()
ax.grid(axis='y', alpha=0.3)

# Add value labels on bars
for bar in bars1:
    ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.01,
            f'{bar.get_height():.2f}', ha='center', va='bottom', fontsize=9)
for bar in bars2:
    ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.01,
            f'{bar.get_height():.2f}', ha='center', va='bottom', fontsize=9)

plt.tight_layout()
plt.savefig('notebooks/india_vs_usa_personality.png', dpi=150)
print("Chart saved: notebooks/india_vs_usa_personality.png")
print("Open this file in VS Code to see it!")