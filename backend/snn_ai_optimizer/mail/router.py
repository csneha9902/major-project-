from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from .service import send_diagnostic_report, send_stress_alert, get_outbox_history, is_smtp_configured

router = APIRouter(prefix="/mail", tags=["mail"])

class SendReportRequest(BaseModel):
    upload_id: str
    recipient_email: EmailStr
    recipient_name: Optional[str] = "Patient / Clinician"
    notes: Optional[str] = None

class SendAlertRequest(BaseModel):
    patient_id: str
    patient_name: str
    doctor_email: EmailStr
    snn_risk_score: float
    beta_alpha_ratio: float
    doctor_name: Optional[str] = "Attending Physician"

@router.get("/config")
def get_mail_config():
    """Returns the active mail delivery mode."""
    return {
        "smtp_configured": is_smtp_configured(),
        "delivery_mode": "SMTP Service" if is_smtp_configured() else "Local Outbox Simulation",
        "description": "Emails are saved locally in results/mail_outbox/ when SMTP is not configured."
    }

@router.post("/send-report")
def api_send_diagnostic_report(
    req: SendReportRequest,
    background_tasks: BackgroundTasks
):
    """
    Emails the generated SNN Diagnostic PDF report to a patient or doctor.
    """
    try:
        result = send_diagnostic_report(
            to_email=str(req.recipient_email),
            recipient_name=req.recipient_name or "Patient / Clinician",
            upload_id=req.upload_id,
            notes=req.notes
        )
        return {
            "status": "success",
            "message": f"Report successfully dispatched to {req.recipient_email}",
            "details": result
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to dispatch email report: {str(e)}")

@router.post("/send-alert")
def api_send_stress_alert(req: SendAlertRequest):
    """
    Sends an urgent clinical neural stress overload alert to a physician.
    """
    try:
        result = send_stress_alert(
            doctor_email=str(req.doctor_email),
            patient_name=req.patient_name,
            patient_id=req.patient_id,
            snn_risk_score=req.snn_risk_score,
            beta_alpha_ratio=req.beta_alpha_ratio,
            doctor_name=req.doctor_name
        )
        return {
            "status": "success",
            "message": f"Stress alert dispatched to {req.doctor_email}",
            "details": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send stress alert: {str(e)}")

@router.get("/outbox")
def api_get_outbox(limit: int = 50):
    """
    Returns recent emails dispatched to the local outbox.
    """
    return {
        "outbox": get_outbox_history(limit=limit)
    }
