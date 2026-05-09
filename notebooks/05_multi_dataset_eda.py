# ── Master Dataset Builder ────────────────────────────────
import pandas as pd
import numpy as np
import os

# ── BIG5 ──────────────────────────────────────────────────
b5 = pd.read_csv("data/raw/cat_d_personality/BIG5/BIG5/data.csv",
                 sep='\t', low_memory=False)
b5['Extraversion']      = b5[['E'+str(i) for i in range(1,11)]].sum(axis=1)
b5['Neuroticism']       = b5[['N'+str(i) for i in range(1,11)]].sum(axis=1)
b5['Agreeableness']     = b5[['A'+str(i) for i in range(1,11)]].sum(axis=1)
b5['Conscientiousness'] = b5[['C'+str(i) for i in range(1,11)]].sum(axis=1)
b5['Openness']          = b5[['O'+str(i) for i in range(1,11)]].sum(axis=1)
b5 = b5[['age','gender','Extraversion','Neuroticism',
          'Agreeableness','Conscientiousness','Openness']].copy()
b5 = b5[(b5['age'] > 10) & (b5['age'] < 100)].dropna()

# ── SD3 ───────────────────────────────────────────────────
sd3 = pd.read_csv("data/raw/cat_d_personality/SD3/SD3/data.csv",
                  sep='\t', low_memory=False)
sd3['Machiavellianism'] = sd3[['M'+str(i) for i in range(1,10)]].sum(axis=1)
sd3['Narcissism']       = sd3[['N'+str(i) for i in range(1,10)]].sum(axis=1)
sd3['Psychopathy']      = sd3[['P'+str(i) for i in range(1,10)]].sum(axis=1)
sd3 = sd3[['Machiavellianism','Narcissism','Psychopathy']].dropna()

# ── MACH ──────────────────────────────────────────────────
mach = pd.read_csv("data/raw/cat_d_personality/MACH_data/MACH_data/data.csv",
                   sep='\t', low_memory=False)
a_cols = [c for c in ['Q'+str(i)+'A' for i in range(1,21)] if c in mach.columns]
mach['MACH_score'] = mach[a_cols].sum(axis=1)
mach = mach[['MACH_score']].dropna()

# ── NPI ───────────────────────────────────────────────────
npi = pd.read_csv("data/raw/cat_d_personality/NPI/NPI/data.csv",
                  sep=None, engine='python')
npi.columns = [c.strip('"') for c in npi.columns]
npi = npi[['score','gender','age']].dropna()
npi.columns = ['NPI_score','gender','age']
npi = npi[(npi['age'] > 10) & (npi['age'] < 100)]

# ── MASTER DATASET ────────────────────────────────────────
# Align SD3 + BIG5 by index (same size approx)
min_rows = min(len(b5), len(sd3))
b5_r  = b5.reset_index(drop=True).iloc[:min_rows]
sd3_r = sd3.reset_index(drop=True).iloc[:min_rows]

master = pd.concat([b5_r, sd3_r], axis=1)

# Add MACH score (sample to match)
mach_sample = mach.sample(min_rows, random_state=42).reset_index(drop=True)
master['MACH_score'] = mach_sample['MACH_score']

os.makedirs("data/processed", exist_ok=True)
master.to_csv("data/processed/master_dataset.csv", index=False)

print(f"✓ Master dataset shape: {master.shape}")
print(f"✓ Columns: {list(master.columns)}")
print(f"✓ Saved to data/processed/master_dataset.csv")
print(f"\nSample:\n{master.head(3)}")