import os
import smtplib
import json
import uuid
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from pathlib import Path
from typing import Optional, Dict, Any, List

from .templates import get_diagnostic_report_email_html, get_stress_alert_email_html

OUTBOX_DIR = Path("results/mail_outbox")
OUTBOX_DIR.mkdir(parents=True, exist_ok=True)

# Environment variables for SMTP
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_TLS = os.getenv("SMTP_TLS", "true").lower() in ("true", "1", "yes")
MAIL_FROM = os.getenv("MAIL_FROM", "diagnostics@stjude.health.org")

def is_smtp_configured() -> bool:
    """Check if valid external SMTP credentials are provided."""
    return bool(SMTP_HOST and SMTP_USER and SMTP_PASSWORD)

def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    attachment_bytes: Optional[bytes] = None,
    attachment_filename: Optional[str] = None
) -> Dict[str, Any]:
    """
    Sends an email using configured SMTP, or records to local outbox in development.
    """
    mail_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()

    # Build MIME message
    msg = MIMEMultipart("mixed")
    msg["From"] = MAIL_FROM
    msg["To"] = to_email
    msg["Subject"] = subject
    msg["Date"] = datetime.now().strftime("%a, %d %b %Y %H:%M:%S %z")

    # Add HTML body
    html_part = MIMEText(html_content, "html", "utf-8")
    msg.attach(html_part)

    # Attach file if provided
    if attachment_bytes and attachment_filename:
        attach_part = MIMEApplication(attachment_bytes, _subtype="pdf")
        attach_part.add_header("Content-Disposition", "attachment", filename=attachment_filename)
        msg.attach(attach_part)

    status = "sent"
    delivery_mode = "smtp" if is_smtp_configured() else "local_outbox"
    error_msg = None

    if is_smtp_configured():
        try:
            if SMTP_PORT == 465:
                server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=10)
            else:
                server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10)
                if SMTP_TLS:
                    server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(MAIL_FROM, [to_email], msg.as_string())
            server.quit()
            print(f"[MAIL-SMTP] Delivered email to {to_email} (Subject: {subject})")
        except Exception as e:
            print(f"[MAIL-ERROR] SMTP send failed: {e}")
            status = "failed"
            error_msg = str(e)
    else:
        # Development / Local Simulation Mode: Save to results/mail_outbox
        mail_record = {
            "mail_id": mail_id,
            "timestamp": timestamp,
            "to": to_email,
            "from": MAIL_FROM,
            "subject": subject,
            "has_attachment": bool(attachment_bytes),
            "attachment_filename": attachment_filename,
            "delivery_mode": "local_outbox",
            "status": "delivered_to_outbox"
        }

        # Save record
        record_file = OUTBOX_DIR / f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{mail_id}.json"
        with open(record_file, "w", encoding="utf-8") as f:
            json.dump(mail_record, f, indent=2)

        # Save HTML preview
        html_file = OUTBOX_DIR / f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{mail_id}.html"
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(html_content)

        # Save attachment copy if present
        if attachment_bytes and attachment_filename:
            att_file = OUTBOX_DIR / f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{attachment_filename}"
            with open(att_file, "wb") as f:
                f.write(attachment_bytes)

        print(f"[MAIL-OUTBOX] Recorded email dispatch to {to_email} (Saved to {record_file.name})")

    return {
        "mail_id": mail_id,
        "recipient": to_email,
        "subject": subject,
        "status": status,
        "delivery_mode": delivery_mode,
        "timestamp": timestamp,
        "error": error_msg
    }

def send_diagnostic_report(
    to_email: str,
    recipient_name: str,
    upload_id: str,
    notes: Optional[str] = None
) -> Dict[str, Any]:
    """Generates PDF and sends the clinical diagnostic report via email."""
    analysis_file = Path("results/analysis") / f"{upload_id}.json"
    if not analysis_file.exists():
        raise FileNotFoundError(f"Analysis dataset not found for ID: {upload_id}")

    with open(analysis_file, "r", encoding="utf-8") as f:
        analysis_data = json.load(f)

    # Generate the PDF report
    from snn_ai_optimizer.analysis import analyze_uploaded_data
    from snn_ai_optimizer.export import generate_pdf_report

    extended_analysis = analyze_uploaded_data(upload_id)
    pdf_bytes = generate_pdf_report(extended_analysis)

    filename = analysis_data.get("filename", "EEG_Session.edf")
    patterns = extended_analysis.get("extended_analysis", {}).get("patterns", {})
    dominant_state = patterns.get("dominant_state", "Neutral")
    
    # Calculate simple SNN risk metric
    stress_count = patterns.get("stress_event_count", 0)
    total_samples = analysis_data.get("features", {}).get("n_samples", 1) or 1
    snn_risk_score = min(100.0, (stress_count / max(1, total_samples / 10)) * 100) if dominant_state == "Stressed" else 22.0

    stats = extended_analysis.get("extended_analysis", {}).get("statistics", {})
    alpha_mean = stats.get("alpha", {}).get("mean", 0.5) or 0.5
    beta_mean = stats.get("beta", {}).get("mean", 0.5) or 0.5
    beta_alpha_ratio = beta_mean / max(0.01, alpha_mean)

    subject = f"St. Jude Clinical Report: {filename} (State: {dominant_state})"
    html_content = get_diagnostic_report_email_html(
        recipient_name=recipient_name,
        filename=filename,
        dominant_state=dominant_state,
        snn_risk_score=snn_risk_score,
        beta_alpha_ratio=beta_alpha_ratio,
        notes=notes
    )

    return send_email(
        to_email=to_email,
        subject=subject,
        html_content=html_content,
        attachment_bytes=pdf_bytes,
        attachment_filename=f"clinical_report_{upload_id}.pdf"
    )

def send_stress_alert(
    doctor_email: str,
    patient_name: str,
    patient_id: str,
    snn_risk_score: float,
    beta_alpha_ratio: float,
    doctor_name: str = "Attending Physician"
) -> Dict[str, Any]:
    """Dispatches an urgent neural overload alert email."""
    subject = f"🚨 URGENT: High SNN Stress Spike Detected - {patient_name} ({patient_id})"
    html_content = get_stress_alert_email_html(
        patient_name=patient_name,
        patient_id=patient_id,
        snn_risk_score=snn_risk_score,
        beta_alpha_ratio=beta_alpha_ratio,
        doctor_name=doctor_name
    )

    return send_email(
        to_email=doctor_email,
        subject=subject,
        html_content=html_content
    )

def get_outbox_history(limit: int = 50) -> List[Dict[str, Any]]:
    """Returns past emails dispatched in local outbox."""
    files = sorted(OUTBOX_DIR.glob("*.json"), key=os.path.getmtime, reverse=True)
    outbox = []
    for f in files[:limit]:
        try:
            with open(f, "r", encoding="utf-8") as file:
                outbox.append(json.load(file))
        except Exception:
            pass
    return outbox
