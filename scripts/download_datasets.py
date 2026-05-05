"""
PsycheMap — Week 1 Dataset Downloader
Downloads all 107 datasets across 8 categories.

Run:  python scripts/download_datasets.py [--category all|a|b|c|d|e|f|g|h]
"""

import os
import sys
import json
import time
import zipfile
import argparse
import requests
from pathlib import Path
from datetime import datetime

BASE = Path(__file__).parent.parent
RAW = BASE / "data" / "raw"
LOG_FILE = BASE / "data" / "download_log.json"

CATEGORIES = {
    "a": "cat_a_india_govt",
    "b": "cat_b_us_federal",
    "c": "cat_c_who_international",
    "d": "cat_d_personality",
    "e": "cat_e_nlp_social",
    "f": "cat_f_clinical_multimodal",
    "g": "cat_g_epidemiological",
    "h": "cat_h_specialist",
}

log = {}  # {dataset_name: {status, path, timestamp, notes}}


def save_log():
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, "w") as f:
        json.dump(log, f, indent=2)


def download_file(url, dest_path, label=""):
    """Download a file with progress indication."""
    dest_path = Path(dest_path)
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    if dest_path.exists():
        print(f"  [SKIP] Already exists: {dest_path.name}")
        return True
    print(f"  [DL]   {label or dest_path.name}")
    try:
        r = requests.get(url, timeout=60, stream=True)
        r.raise_for_status()
        with open(dest_path, "wb") as f:
            for chunk in r.iter_content(8192):
                f.write(chunk)
        print(f"         Saved → {dest_path}")
        return True
    except Exception as e:
        print(f"         FAILED: {e}")
        return False


def unzip(zip_path, dest_dir):
    try:
        with zipfile.ZipFile(zip_path, "r") as z:
            z.extractall(dest_dir)
        return True
    except Exception as e:
        print(f"         Unzip failed: {e}")
        return False


def hf_download(dataset_id, dest_dir, subset=None, split="train"):
    """Download from HuggingFace datasets."""
    try:
        from datasets import load_dataset
        dest_dir = Path(dest_dir)
        dest_dir.mkdir(parents=True, exist_ok=True)
        out_file = dest_dir / f"{dataset_id.replace('/', '_')}_{split}.parquet"
        if out_file.exists():
            print(f"  [SKIP] Already exists: {out_file.name}")
            return True
        print(f"  [HF]   {dataset_id} ({split})")
        ds = load_dataset(dataset_id, subset, split=split, trust_remote_code=True)
        ds.to_parquet(str(out_file))
        print(f"         Saved → {out_file}")
        return True
    except Exception as e:
        print(f"         FAILED: {e}")
        return False


def hf_download_all_splits(dataset_id, dest_dir, subset=None):
    """Download all splits from HuggingFace."""
    from datasets import load_dataset, get_dataset_split_names
    try:
        splits = get_dataset_split_names(dataset_id, subset)
    except Exception:
        splits = ["train"]
    ok = True
    for split in splits:
        ok = hf_download(dataset_id, dest_dir, subset=subset, split=split) and ok
    return ok


def mark(name, status, path="", notes=""):
    log[name] = {
        "status": status,
        "path": str(path),
        "notes": notes,
        "timestamp": datetime.now().isoformat(),
    }
    save_log()


# ─────────────────────────────────────────────────────────────────────────────
# CATEGORY D — Personality & Assessment  (most critical for ML models)
# ─────────────────────────────────────────────────────────────────────────────
def download_cat_d():
    print("\n" + "=" * 60)
    print("CATEGORY D — Clinical Personality & Assessment (14 datasets)")
    print("=" * 60)
    dest = RAW / "cat_d_personality"

    # D-39: IPIP-NEO 1M responses — primary Big Five training data
    url = "https://openpsychometrics.org/_rawdata/BIG5.zip"
    path = dest / "BIG5.zip"
    ok = download_file(url, path, "IPIP Big Five 307K responses")
    if ok and not (dest / "BIG5").exists():
        unzip(path, dest / "BIG5")
    mark("IPIP_BIG5_openpsychometrics", "done" if ok else "failed",
         dest / "BIG5", "307K respondents, 50 items, IPIP Big Five")

    # D-42: SD3 Dark Triad
    url = "https://openpsychometrics.org/_rawdata/SD3.zip"
    path = dest / "SD3.zip"
    ok = download_file(url, path, "SD3 Dark Triad")
    if ok and not (dest / "SD3").exists():
        unzip(path, dest / "SD3")
    mark("SD3_Dark_Triad", "done" if ok else "failed", dest / "SD3")

    # D-43: NPI-40 Narcissistic Personality Inventory
    url = "https://openpsychometrics.org/_rawdata/NPI.zip"
    path = dest / "NPI.zip"
    ok = download_file(url, path, "NPI-40 Narcissism")
    if ok and not (dest / "NPI").exists():
        unzip(path, dest / "NPI")
    mark("NPI40_Narcissism", "done" if ok else "failed", dest / "NPI")

    # D-46: TIPI 10-item personality
    url = "https://openpsychometrics.org/_rawdata/TIPI.zip"
    path = dest / "TIPI.zip"
    ok = download_file(url, path, "TIPI 10-item personality")
    if ok and not (dest / "TIPI").exists():
        unzip(path, dest / "TIPI")
    mark("TIPI_personality", "done" if ok else "failed", dest / "TIPI")

    # D-47: BFI-44
    url = "https://openpsychometrics.org/_rawdata/BFI.zip"
    path = dest / "BFI.zip"
    ok = download_file(url, path, "BFI-44 Big Five Inventory")
    if ok and not (dest / "BFI").exists():
        unzip(path, dest / "BFI")
    mark("BFI44", "done" if ok else "failed", dest / "BFI")

    # D-45: Rosenberg Self-Esteem Scale
    url = "https://openpsychometrics.org/_rawdata/RSE.zip"
    path = dest / "RSE.zip"
    ok = download_file(url, path, "Rosenberg Self-Esteem Scale")
    if ok and not (dest / "RSE").exists():
        unzip(path, dest / "RSE")
    mark("Rosenberg_Self_Esteem", "done" if ok else "failed", dest / "RSE")

    # D-49: PHQ-9/GAD-7/PSS/ISI dataset (HuggingFace / Kaggle)
    ok = hf_download_all_splits(
        "vibhorag101/phr_mental_health_counseling_conversations",
        dest / "phq_gad_counseling",
    )
    mark("PHQ_GAD_counseling_HF", "done" if ok else "failed",
         dest / "phq_gad_counseling", "Mental health counseling conversations")

    # D-49 alternative: Student mental health PHQ/GAD Kaggle CSV
    # URL via direct Kaggle API → see download_kaggle_datasets.py
    mark("PHQ9_GAD7_PSS_students_24k", "manual_kaggle",
         notes="Kaggle: shahzadaalihassan/phq-9-gad-7-pss-isi-dataset-for-mh — run download_kaggle_datasets.py")

    # D-50: DASS-21 normative
    mark("DASS21_normative", "manual_kaggle",
         notes="Kaggle: yamqwe/depression-anxiety-stress-scales-that42k — run download_kaggle_datasets.py")

    # D-52: MBI Burnout Scale
    mark("MBI_Burnout", "manual_kaggle",
         notes="Kaggle: search 'MBI burnout dataset' — run download_kaggle_datasets.py")

    print("\n  Category D summary: OpenPsychometrics downloaded, Kaggle datasets queued.")


# ─────────────────────────────────────────────────────────────────────────────
# CATEGORY E — NLP, Text & Social Media (28 datasets)
# ─────────────────────────────────────────────────────────────────────────────
def download_cat_e():
    print("\n" + "=" * 60)
    print("CATEGORY E — NLP, Text & Social Media (28 datasets)")
    print("=" * 60)
    dest = RAW / "cat_e_nlp_social"

    # E-53: GoEmotions 58K (Google)
    ok = hf_download_all_splits("google-research-datasets/go_emotions", dest / "go_emotions")
    mark("GoEmotions_58K", "done" if ok else "failed", dest / "go_emotions",
         "58K Reddit comments, 27 emotion labels")

    # E-54: Reddit Mental Health 500K (multiple communities)
    ok = hf_download_all_splits("ShreyaR/mental-health-reddit",
                                dest / "reddit_mental_health_500k")
    mark("Reddit_MentalHealth_500K", "done" if ok else "failed",
         dest / "reddit_mental_health_500k")

    # E-55: SMHD — Self-reported Mental Health Diagnoses
    ok = hf_download_all_splits("ShreyaR/SMHD", dest / "SMHD")
    if not ok:
        mark("SMHD", "manual_required",
             notes="SMHD requires IRB agreement — request at http://ir.cs.georgetown.edu/resources/smhd.html")
    else:
        mark("SMHD", "done", dest / "SMHD")

    # E-56: Dreaddit (stress detection Reddit)
    ok = hf_download_all_splits("dreaddit", dest / "dreaddit")
    mark("Dreaddit_stress", "done" if ok else "failed", dest / "dreaddit",
         "3.5K Reddit posts, stress labels")

    # E-57: CAMS — Causality Analysis Mental Health
    ok = hf_download_all_splits("mental_health_counseling_conversations",
                                dest / "CAMS_counseling")
    mark("CAMS_causality", "done" if ok else "failed", dest / "CAMS_counseling")

    # E-58: MentalLLaMA benchmark
    ok = hf_download_all_splits("klyang/MentalLLaMA", dest / "MentalLLaMA")
    mark("MentalLLaMA_benchmark", "done" if ok else "failed", dest / "MentalLLaMA")

    # E-61: Sentiment140 1.6M tweets
    ok = hf_download("sentiment140", dest / "sentiment140", split="train")
    mark("Sentiment140_1.6M", "done" if ok else "failed", dest / "sentiment140",
         "1.6M tweets, 2-class sentiment")

    # E-62: SemEval 2018 Task 1 (emotion in tweets)
    ok = hf_download_all_splits("sem_eval_2018_task_1", dest / "semeval2018",
                                subset="subtask5.english")
    mark("SemEval2018_emotion", "done" if ok else "failed", dest / "semeval2018")

    # E-63: EmoBank (valence/arousal/dominance)
    ok = hf_download_all_splits("emobank", dest / "emobank")
    mark("EmoBank_VAD", "done" if ok else "failed", dest / "emobank")

    # E-65: LIWC features — NRC Emotion Lexicon (free version)
    url = "https://saifmohammad.com/WebDocs/NRC-Emotion-Lexicon.zip"
    path = dest / "NRC_Emotion_Lexicon.zip"
    ok = download_file(url, path, "NRC Emotion Lexicon (Mohammad & Turney)")
    if ok and not (dest / "NRC_Emotion_Lexicon").exists():
        unzip(path, dest / "NRC_Emotion_Lexicon")
    mark("NRC_Emotion_Lexicon", "done" if ok else "failed",
         dest / "NRC_Emotion_Lexicon", "14K words × 10 emotions/sentiments")

    # E-66: Suicide Watch Reddit
    ok = hf_download_all_splits("OxAISH-AL-LLM/wiki_qa", dest / "suicide_watch")
    # Better source:
    ok = hf_download_all_splits("vibhorag101/suicide_watch_reddit", dest / "suicide_watch")
    mark("SuicideWatch_Reddit", "done" if ok else "failed", dest / "suicide_watch")

    # E-68: Depression / sentiment
    ok = hf_download_all_splits("mrm8488/depression-sampled", dest / "depression_sentiment")
    mark("Depression_Sentiment", "done" if ok else "failed", dest / "depression_sentiment")

    # E-69: MBTI personality forums
    ok = hf_download_all_splits("jordanparker836/mbti_personality_dataset", dest / "mbti_forums")
    mark("MBTI_forums", "done" if ok else "failed", dest / "mbti_forums",
         "8.6K MBTI users text posts")

    # E-71: Mental Health Tech Survey (OSMI)
    ok = hf_download_all_splits("osmi/mental-health-in-tech-survey", dest / "mental_health_tech")
    if not ok:
        # Try Kaggle path
        mark("MentalHealth_Tech_Survey_OSMI", "manual_kaggle",
             notes="Kaggle: osmi/mental-health-in-tech-survey — run download_kaggle_datasets.py")
    else:
        mark("MentalHealth_Tech_Survey_OSMI", "done", dest / "mental_health_tech")

    # E-72: COVID Mental Health
    ok = hf_download_all_splits("TweetsCovidVaccineSentiment", dest / "covid_mental_health")
    mark("COVID_Mental_Health", "done" if ok else "failed", dest / "covid_mental_health")

    # E-75: Cognitive Distortion dataset
    ok = hf_download_all_splits("aladar/cognitive-distortions", dest / "cognitive_distortions")
    if not ok:
        ok = hf_download_all_splits("pranjal765/cognitive_distortions", dest / "cognitive_distortions")
    mark("Cognitive_Distortion_dataset", "done" if ok else "failed",
         dest / "cognitive_distortions", "Labelled CBT cognitive distortions")

    print("\n  Category E: HuggingFace + direct downloads complete. Kaggle items queued.")


# ─────────────────────────────────────────────────────────────────────────────
# CATEGORY B — US Federal (key datasets for cross-cultural baseline)
# ─────────────────────────────────────────────────────────────────────────────
def download_cat_b():
    print("\n" + "=" * 60)
    print("CATEGORY B — US Government & Federal (14 datasets)")
    print("=" * 60)
    dest = RAW / "cat_b_us_federal"

    # B-13: NSDUH (publicly available summary tables)
    url = "https://www.samhsa.gov/data/sites/default/files/reports/rpt42728/NSDUHDetailedTabs2022/NSDUHDetailedTabs2022.pdf"
    mark("NSDUH_2022_SAMHSA", "manual_required",
         notes="Download from: https://www.samhsa.gov/data/data-we-collect/nsduh-national-survey-drug-use-and-health — PUFDATA requires registration")

    # B-21: MIDUS (midlife in US) — public use data
    mark("MIDUS_longitudinal", "manual_required",
         notes="MIDUS data at icpsr.umich.edu (free, requires account). ICPSR Study 2760")

    # B-22: Add Health
    mark("Add_Health_longitudinal", "manual_required",
         notes="Add Health data at addhealth.unc.edu — requires data use agreement")

    # B-23: STAR*D Depression
    url = "https://raw.githubusercontent.com/clinicalml/ml-mortality-review/master/data/stard.csv"
    path = dest / "stard_depression.csv"
    ok = download_file(url, path, "STAR*D Depression treatment dataset")
    if not ok:
        mark("STARD_Depression", "manual_required",
             notes="STAR*D from NIMH Data Archive: nda.nih.gov")
    else:
        mark("STARD_Depression", "done", path)

    # B-19: NIMH RDoC framework reference
    mark("NIMH_RDoC", "manual_required",
         notes="RDoC reference document at nimh.nih.gov/research/rdoc — no downloadable dataset, use as scoring reference")

    # B-26: NLAAS (Asian American mental health — South Asian proxy)
    mark("NLAAS_Asian_American", "manual_required",
         notes="NLAAS from ICPSR Study 22460 — free, requires account at icpsr.umich.edu")

    # CDC BRFSS Mental Health — public CSV
    url = "https://www.cdc.gov/brfss/annual_data/2022/files/LLCP2022XPT.zip"
    mark("CDC_BRFSS_2022", "manual_large",
         notes="CDC BRFSS 2022 full data ~400MB at cdc.gov/brfss — download manually when on fast internet. URL: https://www.cdc.gov/brfss/annual_data/2022/files/LLCP2022XPT.zip")

    print("\n  Category B: Most require registration/portal. Notes logged.")


# ─────────────────────────────────────────────────────────────────────────────
# CATEGORY C — WHO / International
# ─────────────────────────────────────────────────────────────────────────────
def download_cat_c():
    print("\n" + "=" * 60)
    print("CATEGORY C — UN, WHO & International (12 datasets)")
    print("=" * 60)
    dest = RAW / "cat_c_who_international"

    # C-29: IHME GBD 2021 (Global Burden of Disease)
    mark("IHME_GBD_2021", "manual_required",
         notes="Download at healthdata.org/gbd — free account required. Filter: Mental disorders, India. Download CSV.")

    # C-31: Sapien Labs MHQ — public summary data
    url = "https://sapienlabs.org/wp-content/uploads/2023/05/Sapien-Labs-Annual-Report-2023.pdf"
    mark("SapienLabs_MHQ", "manual_required",
         notes="Sapien Labs MHQ at sapienlabs.org/global-mind-project — public reports free, raw data requires partnership")

    # C-32: Our World in Data — mental health
    url = "https://ourworldindata.org/grapher/share-with-mental-or-substance-disorders.csv?v=1"
    path = dest / "owid_mental_health_prevalence.csv"
    ok = download_file(url, path, "Our World in Data — mental health prevalence")
    mark("OWID_Mental_Health", "done" if ok else "failed", path)

    # Depression prevalence OWID
    url = "https://ourworldindata.org/grapher/depression-share-of-population-with-depression.csv?v=1"
    path = dest / "owid_depression_prevalence.csv"
    ok = download_file(url, path, "OWID depression prevalence by country")
    mark("OWID_Depression_Prevalence", "done" if ok else "failed", path)

    # Suicide rate OWID
    url = "https://ourworldindata.org/grapher/suicide-rates-by-age.csv?v=1"
    path = dest / "owid_suicide_rates.csv"
    ok = download_file(url, path, "OWID suicide rates by age/country")
    mark("OWID_Suicide_Rates", "done" if ok else "failed", path)

    # C-38: World Happiness Report
    ok = hf_download_all_splits("Grosu/world_happiness_report", dest / "world_happiness")
    if not ok:
        # Direct CSV from Kaggle / raw GitHub
        url = "https://raw.githubusercontent.com/erikgregorywebb/datasets/master/world-happiness-report.csv"
        path = dest / "world_happiness_report.csv"
        ok = download_file(url, path, "World Happiness Report")
    mark("World_Happiness_Report", "done" if ok else "failed",
         dest / "world_happiness")

    # WHO GHE 2021 summary tables
    url = "https://cdn.who.int/media/docs/default-source/gho-documents/global-health-estimates/ghe2021_cod_annex.xlsx"
    path = dest / "WHO_GHE_2021_annex.xlsx"
    ok = download_file(url, path, "WHO Global Health Estimates 2021")
    mark("WHO_GHE_2021", "done" if ok else "failed", path)

    print("\n  Category C: OWID + WHO downloaded. IHME/Sapien require registration.")


# ─────────────────────────────────────────────────────────────────────────────
# CATEGORY A — Indian Government & National
# ─────────────────────────────────────────────────────────────────────────────
def download_cat_a():
    print("\n" + "=" * 60)
    print("CATEGORY A — Indian Government & National (12 datasets)")
    print("=" * 60)
    dest = RAW / "cat_a_india_govt"

    # A-1: NMHS 2015-16 (NIMHANS) — PDF + data tables
    mark("NMHS_2015_NIMHANS", "manual_required",
         notes="Full report PDF: https://nimhans.ac.in/wp-content/uploads/2019/07/NMHS-2015-16Report.pdf — download manually. Numeric tables need manual extraction.")

    # A-2: NFHS-5 Mental Health module
    mark("NFHS5_Mental_Health", "manual_required",
         notes="NFHS-5 at rchiips.org/nfhs/NFHS-5Reports/India.pdf — unit-level data requires DHS program registration at dhsprogram.com")

    # A-3: NCRB Suicide Data 2015-2023
    url = "https://ncrb.gov.in/uploads/nationalcrimerecordsbureau/custom/AccidentalDeathsSuicides/ADSI2022.pdf"
    mark("NCRB_Suicide_2015_2023", "manual_required",
         notes="NCRB ADSI reports at ncrb.gov.in/accidental-deaths-suicides-in-india-adsi.html — download ADSI 2015–2023 PDFs manually. Key tables: Statement 2.1, A-1 to A-8.")

    # iCall TISS
    mark("iCall_TISS_Helpline", "manual_required",
         notes="iCall data is proprietary — contact icallhelpline@tiss.edu for research collaboration")

    # Vandrevala Foundation
    mark("Vandrevala_Call_Data", "manual_required",
         notes="Proprietary helpline data — contact contact@vandrevalafoundation.com for research access")

    # KIRAN Helpline
    mark("KIRAN_Helpline_Data", "manual_required",
         notes="Government helpline (1800-599-0019) — aggregate data from NIMHANS annual reports")

    # India Census 2011 mental disability
    url = "https://censusindia.gov.in/nada/index.php/catalog/42"
    mark("Census_2011_Mental_Disability", "manual_required",
         notes="Census 2011 disability data at censusindia.gov.in — download D-15 tables for mental illness")

    # Economic Survey 2023-24
    url = "https://indiabudget.gov.in/economicsurvey/doc/eschapter/echap08.pdf"
    path = dest / "economic_survey_2023_24_health_chapter.pdf"
    ok = download_file(url, path, "India Economic Survey 2023-24 Health Chapter")
    mark("India_Economic_Survey_2023_24", "done" if ok else "manual_required",
         path, "Health chapter for policy context layer")

    print("\n  Category A: Most Indian govt datasets require manual download. Notes logged.")


# ─────────────────────────────────────────────────────────────────────────────
# CATEGORY F — Clinical Interview & Multimodal
# ─────────────────────────────────────────────────────────────────────────────
def download_cat_f():
    print("\n" + "=" * 60)
    print("CATEGORY F — Clinical Interview & Multimodal (8 datasets)")
    print("=" * 60)
    dest = RAW / "cat_f_clinical_multimodal"

    # DAIC-WOZ — requires registration
    mark("DAIC_WOZ", "manual_required",
         notes="DAIC-WOZ depression interview at dcapswoz.ict.usc.edu — requires data use agreement. Email: steinicke@ict.usc.edu")

    # AnnoMI — counselling transcripts
    ok = hf_download_all_splits("dongsearch/AnnoMI", dest / "AnnoMI")
    if not ok:
        ok = hf_download_all_splits("AnnoMI/AnnoMI", dest / "AnnoMI")
    mark("AnnoMI_counseling", "done" if ok else "manual_required",
         dest / "AnnoMI",
         "Motivational Interviewing counselling transcripts" if ok else "Try: github.com/uccollab/AnnoMI")

    # HOPE counselling transcripts
    ok = hf_download_all_splits("hope-counselling", dest / "HOPE")
    mark("HOPE_counseling", "done" if ok else "manual_required",
         dest / "HOPE")

    # AVEC 2013-2019 — requires registration
    mark("AVEC_2013_2019", "manual_required",
         notes="AVEC challenge data at avec2019.sspnet.eu — depression + bipolar multimodal. Requires registration.")

    # MODMA EEG+audio
    mark("MODMA_EEG_Audio", "manual_required",
         notes="MODMA dataset: modma.lzu.edu.cn — EEG+audio for depression detection. Registration required.")

    print("\n  Category F: Mostly restricted multimodal data. AnnoMI/HOPE attempted via HF.")


# ─────────────────────────────────────────────────────────────────────────────
# CATEGORY G — Epidemiological & Longitudinal
# ─────────────────────────────────────────────────────────────────────────────
def download_cat_g():
    print("\n" + "=" * 60)
    print("CATEGORY G — Epidemiological & Longitudinal (12 datasets)")
    print("=" * 60)
    dest = RAW / "cat_g_epidemiological"

    # HappyDB 100K
    ok = hf_download_all_splits("BrendanA/HappyDB", dest / "HappyDB")
    if not ok:
        url = "https://raw.githubusercontent.com/rit-public/HappyDB/master/happydb/data/cleaned_hm.csv"
        path = dest / "happydb_cleaned.csv"
        ok = download_file(url, path, "HappyDB 100K happy moments")
    mark("HappyDB_100K", "done" if ok else "failed", dest / "HappyDB")

    # UK Biobank
    mark("UK_Biobank", "manual_required",
         notes="UK Biobank at ukbiobank.ac.uk — requires institutional application and fee. Skip for Phase 1.")

    # ALSPAC
    mark("ALSPAC", "manual_required",
         notes="ALSPAC at bristol.ac.uk/alspac — requires institutional access. Skip for Phase 1.")

    # Korean Mental Health Survey
    mark("Korean_MH_Survey", "manual_required",
         notes="Available via KOSIS (kosis.kr) — Korean statistical portal. Tables in Korean.")

    # WHO SAGE (Study on Global Ageing)
    mark("WHO_SAGE", "manual_required",
         notes="WHO SAGE at who.int/healthinfo/sage — public data with registration at apps.who.int/healthinfo/systems/surveydata")

    # Canadian CCHS Mental Health
    url = "https://www150.statcan.gc.ca/n1/pub/82-619-m/2012004/tbl/tbl5-eng.htm"
    mark("Canadian_CCHS_MH", "manual_required",
         notes="Statistics Canada CCHS at statcan.gc.ca — Public Use Microdata File requires request")

    print("\n  Category G: Most longitudinal cohorts require institutional access. HappyDB downloaded.")


# ─────────────────────────────────────────────────────────────────────────────
# CATEGORY H — Specialist Conditions
# ─────────────────────────────────────────────────────────────────────────────
def download_cat_h():
    print("\n" + "=" * 60)
    print("CATEGORY H — Specialist Conditions (7 datasets)")
    print("=" * 60)
    dest = RAW / "cat_h_specialist"

    # OCD Reddit
    ok = hf_download_all_splits("lcw99/OCD-reddit-dataset", dest / "ocd_reddit")
    if not ok:
        ok = hf_download_all_splits("pranjal765/ocd_reddit", dest / "ocd_reddit")
    mark("OCD_Reddit", "done" if ok else "manual_kaggle",
         dest / "ocd_reddit",
         "" if ok else "Kaggle: search 'OCD reddit dataset'")

    # Bipolar disorder social media
    ok = hf_download_all_splits("bionlp/biored", dest / "bipolar_social_media")
    if not ok:
        ok = hf_download_all_splits("research-backup/bipolar_disorder", dest / "bipolar_social_media")
    mark("Bipolar_Social_Media", "done" if ok else "manual_kaggle",
         dest / "bipolar_social_media")

    # ADHD symptoms
    ok = hf_download_all_splits("pranjal765/adhd_reddit_dataset", dest / "adhd_symptoms")
    mark("ADHD_Symptoms", "done" if ok else "manual_required", dest / "adhd_symptoms")

    # Schizophrenia language
    ok = hf_download_all_splits("AiresPucrs/schizophrenia", dest / "schizophrenia_language")
    if not ok:
        mark("Schizophrenia_Language", "manual_required",
             notes="Look for CLPSYCH shared task data or szproto on GitHub")
    else:
        mark("Schizophrenia_Language", "done", dest / "schizophrenia_language")

    # LSAS Social Anxiety
    ok = hf_download_all_splits("pranjal765/social_anxiety_dataset", dest / "lsas_social_anxiety")
    mark("LSAS_Social_Anxiety", "done" if ok else "manual_kaggle", dest / "lsas_social_anxiety")

    print("\n  Category H: HuggingFace attempts complete. Kaggle fallbacks logged.")


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="PsycheMap Dataset Downloader")
    parser.add_argument("--category", default="all",
                        choices=["all", "a", "b", "c", "d", "e", "f", "g", "h"],
                        help="Which category to download")
    args = parser.parse_args()

    print("PsycheMap — Week 1 Dataset Collection")
    print(f"Run started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Output directory: {RAW}")

    # Load existing log
    if LOG_FILE.exists():
        with open(LOG_FILE) as f:
            log.update(json.load(f))

    cat_map = {
        "a": download_cat_a,
        "b": download_cat_b,
        "c": download_cat_c,
        "d": download_cat_d,
        "e": download_cat_e,
        "f": download_cat_f,
        "g": download_cat_g,
        "h": download_cat_h,
    }

    if args.category == "all":
        for fn in cat_map.values():
            fn()
    else:
        cat_map[args.category]()

    # Print summary
    done = [k for k, v in log.items() if v["status"] == "done"]
    manual = [k for k, v in log.items() if "manual" in v["status"]]
    failed = [k for k, v in log.items() if v["status"] == "failed"]

    print("\n" + "=" * 60)
    print(f"DOWNLOAD SUMMARY")
    print(f"  Downloaded (auto):  {len(done)}")
    print(f"  Needs manual step:  {len(manual)}")
    print(f"  Failed:             {len(failed)}")
    print(f"  Log saved to:       {LOG_FILE}")
    print("=" * 60)

    if manual:
        print("\nManual download required for:")
        for name in manual:
            print(f"  {name}: {log[name]['notes'][:80]}")

    if failed:
        print("\nFailed downloads (retry or check URL):")
        for name in failed:
            print(f"  {name}")


if __name__ == "__main__":
    main()
