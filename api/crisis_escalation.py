import os
from supabase import create_client
from datetime import datetime

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

CRISIS_THRESHOLDS = {
    "phq9_severe": 20,
    "phq9_moderately_severe": 15,
    "gad7_severe": 15,
    "suicide_risk_high": 0.7,
}

async def check_and_escalate(patient_id: str, phq_score: int, gad_score: int, 
                              suicide_risk: float = None, answers: dict = None):
    alerts = []
    severity = None

    # Check PHQ-9 severe
    if phq_score >= CRISIS_THRESHOLDS["phq9_severe"]:
        severity = "critical"
        alerts.append({
            "trigger_type": "phq9_severe",
            "trigger_value": {"phq_score": phq_score},
            "severity": severity
        })
    elif phq_score >= CRISIS_THRESHOLDS["phq9_moderately_severe"]:
        severity = "high"
        alerts.append({
            "trigger_type": "phq9_moderately_severe", 
            "trigger_value": {"phq_score": phq_score},
            "severity": severity
        })

    # Check GAD-7 severe
    if gad_score >= CRISIS_THRESHOLDS["gad7_severe"]:
        severity = severity or "high"
        alerts.append({
            "trigger_type": "gad7_severe",
            "trigger_value": {"gad_score": gad_score},
            "severity": severity
        })

    # Check suicide risk
    if suicide_risk and suicide_risk >= CRISIS_THRESHOLDS["suicide_risk_high"]:
        severity = "critical"
        alerts.append({
            "trigger_type": "suicide_risk_high",
            "trigger_value": {"suicide_risk": suicide_risk},
            "severity": "critical"
        })

    # Check PHQ item 9 (suicidal ideation) directly
    if answers:
        phq9_item9 = answers.get("phq9_9", 0)
        if phq9_item9 >= 1:
            severity = "critical"
            alerts.append({
                "trigger_type": "suicidal_ideation",
                "trigger_value": {"phq9_item9": phq9_item9},
                "severity": "critical"
            })

    if not alerts:
        return {"escalated": False}

    # Find linked psychologist
    link = supabase.from_("patient_psychologist")\
        .select("psychologist_id")\
        .eq("patient_id", patient_id)\
        .eq("active", True)\
        .limit(1)\
        .execute()

    psychologist_id = None
    if link.data:
        psychologist_id = link.data[0].get("psychologist_id")

    # Save alerts to DB
    for alert in alerts:
        supabase.from_("crisis_alerts").insert({
            "patient_id": patient_id,
            "psychologist_id": psychologist_id,
            "trigger_type": alert["trigger_type"],
            "trigger_value": alert["trigger_value"],
            "severity": alert["severity"],
            "acknowledged": False,
            "created_at": datetime.utcnow().isoformat()
        }).execute()

    # Send email alert if psychologist is linked
    if psychologist_id:
        await send_alert_email(patient_id, psychologist_id, alerts)

    return {
        "escalated": True,
        "severity": severity,
        "alerts": alerts,
        "psychologist_notified": psychologist_id is not None
    }

async def send_alert_email(patient_id: str, psychologist_id: str, alerts: list):
    try:
        # Get psychologist email
        psych = supabase.from_("profiles")\
            .select("email")\
            .eq("id", psychologist_id)\
            .single()\
            .execute()
        
        # Get patient name
        patient = supabase.from_("profiles")\
            .select("display_name, full_name")\
            .eq("id", patient_id)\
            .single()\
            .execute()

        if not psych.data:
            return

        psych_email = psych.data.get("email")
        patient_name = None
        if patient.data:
            patient_name = patient.data.get("display_name") or patient.data.get("full_name") or "Your patient"

        alert_details = "\n".join([
            f"- {a['trigger_type'].replace('_', ' ').title()}: {a['trigger_value']}"
            for a in alerts
        ])

        # Use Supabase to send email (via their SMTP)
        supabase.auth.admin.send_email(
            psych_email,
            subject=f"🚨 PsycheFlow Crisis Alert — {patient_name}",
            body=f"""
Dear Psychologist,

A crisis alert has been triggered for your patient: {patient_name}

Alert Details:
{alert_details}

Please log in to PsycheFlow immediately to review this patient's status.

Login: http://localhost:3000

Crisis Helplines:
- iCall: 9152987821
- Vandrevala Foundation: 1860-2662-345
- NIMHANS: 080-46110007

— PsycheFlow Safety System
            """
        )
    except Exception as e:
        print(f"Email alert failed: {e}")

async def get_unacknowledged_alerts(psychologist_id: str):
    result = supabase.from_("crisis_alerts")\
        .select("*, profiles!crisis_alerts_patient_id_fkey(display_name, full_name)")\
        .eq("psychologist_id", psychologist_id)\
        .eq("acknowledged", False)\
        .order("created_at", desc=True)\
        .execute()
    return result.data or []

async def acknowledge_alert(alert_id: str):
    supabase.from_("crisis_alerts")\
        .update({"acknowledged": True, "acknowledged_at": datetime.utcnow().isoformat()})\
        .eq("id", alert_id)\
        .execute()
    return {"acknowledged": True}
