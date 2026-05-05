"""
PsycheMap — Kaggle Dataset Downloader
Run AFTER setting up Kaggle credentials: ~/.kaggle/kaggle.json

Setup:
  1. Go to kaggle.com → Account → Create API Token
  2. Save downloaded kaggle.json to ~/.kaggle/kaggle.json
  3. chmod 600 ~/.kaggle/kaggle.json
  4. Run: python scripts/download_kaggle_datasets.py
"""

import os
import json
import zipfile
from pathlib import Path
from datetime import datetime

BASE = Path(__file__).parent.parent
RAW = BASE / "data" / "raw"
LOG_FILE = BASE / "data" / "download_log.json"

KAGGLE_DATASETS = [
    # (kaggle_slug, dest_subdir, local_name, notes)
    # Category D — Personality & Assessment
    ("shahzadaalihassan/phq-9-gad-7-pss-isi-dataset-for-mh",
     "cat_d_personality/phq_gad_pss_isi_students",
     "PHQ9_GAD7_PSS_students_24k",
     "24,292 students — PHQ-9, GAD-7, PSS, ISI scores"),

    ("yamqwe/depression-anxiety-stress-scales-that42k",
     "cat_d_personality/dass21_normative",
     "DASS21_normative_42k",
     "42K respondents — DASS-21 depression/anxiety/stress"),

    ("lucasgreenwell/mbi-burnout-scale",
     "cat_d_personality/mbi_burnout",
     "MBI_Burnout_Scale",
     "Maslach Burnout Inventory normative data"),

    ("kaggle/mental-health-in-tech-survey",
     "cat_e_nlp_social/mental_health_tech",
     "MentalHealth_Tech_Survey_OSMI",
     "OSMI 2014-2019 mental health in tech surveys"),

    # Alternative PHQ/GAD dataset
    ("sid321axn/calm-a-multimodal-dataset-of-alzheimer",
     "cat_d_personality/calm_multimodal",
     "CALM_Alzheimer_multimodal",
     "Multimodal cognitive decline dataset"),

    # Category E — NLP
    ("nikhileswarkomati/suicide-ideation-dataset",
     "cat_e_nlp_social/suicide_ideation",
     "Suicide_Ideation_NLP",
     "Reddit posts — suicide ideation labels"),

    ("welkin17/mental-disorders-identification-reddit-nlp",
     "cat_e_nlp_social/mental_disorders_reddit",
     "Mental_Disorders_Reddit_NLP",
     "Reddit mental health community posts"),

    ("suchintikasarkar/sentiment-analysis-for-mental-health",
     "cat_e_nlp_social/sentiment_mental_health",
     "Sentiment_Mental_Health_NLP",
     "Mental health sentiment labelled dataset"),

    # MBTI
    ("datasnaek/mbti-type",
     "cat_d_personality/mbti_8600",
     "MBTI_8600_Kaggle",
     "8.6K Myers-Briggs posts — 16 types"),

    # Depression tweets/text
    ("infamouscoder/mental-health-social-media",
     "cat_e_nlp_social/depression_social_media",
     "Depression_Social_Media",
     "Depression/anxiety social media posts"),

    # Category H — Specialist
    ("kamauvictorian/covid19-mental-health-dataset",
     "cat_e_nlp_social/covid_mental_health",
     "COVID_Mental_Health_Kaggle",
     "COVID-19 mental health impact data"),

    ("rishidamarla/social-media-bipolar-disorder-dataset",
     "cat_h_specialist/bipolar_social_media",
     "Bipolar_Social_Media_Kaggle",
     "Twitter/Reddit bipolar disorder posts"),

    # Eating disorder
    ("rishidamarla/eating-disorders-prediction",
     "cat_h_specialist/eating_disorder_edeq",
     "EDE_Q_Eating_Disorder",
     "Eating disorder risk dataset"),
]


def load_log():
    if LOG_FILE.exists():
        with open(LOG_FILE) as f:
            return json.load(f)
    return {}


def save_log(log):
    with open(LOG_FILE, "w") as f:
        json.dump(log, f, indent=2)


def download_kaggle(slug, dest_dir, local_name, notes):
    import kaggle
    dest_dir = RAW / dest_dir
    dest_dir.mkdir(parents=True, exist_ok=True)

    if any(dest_dir.iterdir()) if dest_dir.exists() else False:
        print(f"  [SKIP] {local_name} — already downloaded")
        return "done"

    print(f"  [KG]   {slug}")
    try:
        kaggle.api.dataset_download_files(slug, path=str(dest_dir), unzip=True)
        print(f"         Saved → {dest_dir}")
        return "done"
    except Exception as e:
        print(f"         FAILED: {e}")
        return "failed"


def check_credentials():
    cred_path = Path.home() / ".kaggle" / "kaggle.json"
    if not cred_path.exists():
        print("ERROR: Kaggle credentials not found.")
        print()
        print("To set up:")
        print("  1. Go to https://www.kaggle.com/settings → API → Create New Token")
        print("  2. A kaggle.json file will download")
        print("  3. Move it:  mkdir -p ~/.kaggle && mv ~/Downloads/kaggle.json ~/.kaggle/")
        print("  4. chmod 600 ~/.kaggle/kaggle.json")
        print("  5. Re-run this script")
        return False
    return True


def main():
    print("PsycheMap — Kaggle Dataset Downloader")
    print(f"Run started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    if not check_credentials():
        return

    try:
        import kaggle
        kaggle.api.authenticate()
        print("Kaggle authentication: OK\n")
    except Exception as e:
        print(f"Kaggle auth failed: {e}")
        return

    log = load_log()
    done, failed = 0, 0

    for slug, dest, name, notes in KAGGLE_DATASETS:
        if log.get(name, {}).get("status") == "done":
            print(f"  [SKIP] {name} — already in log")
            done += 1
            continue

        status = download_kaggle(slug, dest, name, notes)
        log[name] = {
            "status": status,
            "path": str(RAW / dest),
            "notes": notes,
            "source": f"kaggle:{slug}",
            "timestamp": datetime.now().isoformat(),
        }
        save_log(log)

        if status == "done":
            done += 1
        else:
            failed += 1

    print(f"\n{'='*50}")
    print(f"Kaggle downloads: {done} done, {failed} failed")
    print(f"{'='*50}")

    if failed:
        print("\nFailed — check slug names at kaggle.com/datasets:")
        for slug, dest, name, notes in KAGGLE_DATASETS:
            if log.get(name, {}).get("status") == "failed":
                print(f"  {name}: kaggle.com/datasets/{slug}")


if __name__ == "__main__":
    main()
