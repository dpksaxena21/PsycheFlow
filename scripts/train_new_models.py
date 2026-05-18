import pandas as pd
import numpy as np
import pickle
import os
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')

os.makedirs('models', exist_ok=True)
BASE = '/mnt/d/Projects/PsycheFlow'

print("="*50)
print("MODEL 1: Suicide Risk Detector")
print("="*50)
df = pd.read_csv(f'{BASE}/data/raw/new_datasets/suicide_detection/Suicide_Detection.csv')
df = df.dropna(subset=['text','class'])
df['label'] = (df['class']=='suicide').astype(int)
print(f"Samples: {len(df)} | Suicide: {df['label'].sum()}")
X,y = df['text'].astype(str), df['label']
X_tr,X_te,y_tr,y_te = train_test_split(X,y,test_size=0.2,random_state=42,stratify=y)
p1 = Pipeline([('tfidf',TfidfVectorizer(max_features=50000,ngram_range=(1,2),min_df=2)),('clf',LogisticRegression(class_weight={0:1,1:3},max_iter=1000))])
p1.fit(X_tr,y_tr)
y_pred = p1.predict(X_te)
y_prob = p1.predict_proba(X_te)[:,1]
print(classification_report(y_te,y_pred,target_names=['Non-Suicide','Suicide']))
print(f"ROC-AUC: {roc_auc_score(y_te,y_prob):.4f}")
with open(f'{BASE}/models/suicide_risk_model.pkl','wb') as f: pickle.dump(p1,f)
print("SAVED: suicide_risk_model.pkl")

print("="*50)
print("MODEL 2: MH Multi-Class Classifier")
print("="*50)
df2 = pd.read_csv(f'{BASE}/data/raw/new_datasets/mental_health_corpus/mental_health.csv')
df2 = df2.dropna(subset=['text','label'])
print(f"Samples: {len(df2)} | Labels: {df2['label'].nunique()}")
print(df2['label'].value_counts().to_dict())
X2,y2 = df2['text'].astype(str),df2['label']
X2_tr,X2_te,y2_tr,y2_te = train_test_split(X2,y2,test_size=0.2,random_state=42,stratify=y2)
p2 = Pipeline([('tfidf',TfidfVectorizer(max_features=30000,ngram_range=(1,2),min_df=2)),('clf',LogisticRegression(class_weight='balanced',max_iter=1000))])
p2.fit(X2_tr,y2_tr)
print(classification_report(y2_te,p2.predict(X2_te)))
with open(f'{BASE}/models/mh_multiclass_model.pkl','wb') as f: pickle.dump(p2,f)
print("SAVED: mh_multiclass_model.pkl")

print("="*50)
print("MODEL 3: Therapy Topic Classifier")
print("="*50)
df3 = pd.read_csv(f'{BASE}/data/raw/new_datasets/counselchat/counselchat.csv')
df3 = df3.dropna(subset=['questionText','topic'])
tc = df3['topic'].value_counts()
df3 = df3[df3['topic'].isin(tc[tc>=5].index)]
print(f"Samples: {len(df3)} | Topics: {df3['topic'].nunique()}")
X3,y3 = df3['questionText'].astype(str),df3['topic']
X3_tr,X3_te,y3_tr,y3_te = train_test_split(X3,y3,test_size=0.2,random_state=42,stratify=y3)
p3 = Pipeline([('tfidf',TfidfVectorizer(max_features=20000,ngram_range=(1,2))),('clf',LogisticRegression(class_weight='balanced',max_iter=1000))])
p3.fit(X3_tr,y3_tr)
print(classification_report(y3_te,p3.predict(X3_te)))
with open(f'{BASE}/models/therapy_topic_model.pkl','wb') as f: pickle.dump(p3,f)
print("SAVED: therapy_topic_model.pkl")

print("="*50)
print("MODEL 4: Sleep Quality Predictor")
print("="*50)
df4 = pd.read_csv(f'{BASE}/data/raw/new_datasets/sleep_health/Sleep_health_and_lifestyle_dataset.csv')
print(f"Columns: {list(df4.columns)}")
le = LabelEncoder()
df4c = df4.copy()
for col in df4c.select_dtypes(include='object').columns:
    df4c[col] = le.fit_transform(df4c[col].astype(str))
df4c['sleep_label'] = pd.cut(df4c['Quality of Sleep'],bins=[0,5,7,10],labels=['poor','fair','good'])
df4c = df4c.dropna(subset=['sleep_label'])
fcols = [c for c in df4c.columns if c not in ['Quality of Sleep','sleep_label','Person ID']]
X4,y4 = df4c[fcols],df4c['sleep_label']
X4_tr,X4_te,y4_tr,y4_te = train_test_split(X4,y4,test_size=0.2,random_state=42)
rf = RandomForestClassifier(n_estimators=100,class_weight='balanced',random_state=42)
rf.fit(X4_tr,y4_tr)
print(classification_report(y4_te,rf.predict(X4_te)))
with open(f'{BASE}/models/sleep_quality_model.pkl','wb') as f: pickle.dump({'model':rf,'feature_cols':fcols},f)
print("SAVED: sleep_quality_model.pkl")

print("\nALL MODELS DONE")
for m in ['suicide_risk_model','mh_multiclass_model','therapy_topic_model','sleep_quality_model']:
    size = os.path.getsize(f'{BASE}/models/{m}.pkl')/1024/1024
    print(f"  {m}: {size:.1f}MB")
