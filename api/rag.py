# ── PsycheFlow RAG Pipeline ───────────────────────────────
import os
import json
import numpy as np
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from supabase import create_client

load_dotenv("/mnt/d/Projects/PsycheFlow/.env")

_model    = None
_supabase = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def get_supabase():
    global _supabase
    if _supabase is None:
        _supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_KEY")
        )
    return _supabase

def cosine_similarity(a, b):
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def search_knowledge(query: str, top_k: int = 3) -> list:
    try:
        model    = get_model()
        supabase = get_supabase()

        query_embedding = model.encode(query).tolist()

        # Fetch all records and compute similarity in Python
        result = supabase.table('psychology_knowledge').select(
            'id,category,subcategory,content,source,embedding'
        ).execute()

        if not result.data:
            return []

        scored = []
        for row in result.data:
            try:
                emb = row['embedding']
                if isinstance(emb, str):
                    emb = json.loads(emb)
                sim = cosine_similarity(query_embedding, emb)
                scored.append({ **row, 'similarity': sim })
            except:
                continue

        scored.sort(key=lambda x: x['similarity'], reverse=True)
        return scored[:top_k]

    except Exception as e:
        print(f"RAG search error: {e}")
        return []

def get_relevant_context(query: str, top_k: int = 3) -> str:
    results = search_knowledge(query, top_k)
    if not results:
        return ""

    context = "RELEVANT CLINICAL KNOWLEDGE:\n"
    for r in results:
        context += f"\n[{r.get('category','')}: {r.get('subcategory','')}]\n"
        context += f"{r.get('content','')}\n"
        context += f"Source: {r.get('source','')}\n"

    return context