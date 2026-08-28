from typing import Optional

def get_diagnostic_report_email_html(
    recipient_name: str,
    filename: str,
    dominant_state: str = "Neutral",
    snn_risk_score: float = 0.0,
    beta_alpha_ratio: float = 1.0,
    notes: Optional[str] = None
) -> str:
    """Generates an HTML email for sending SNN cognitive diagnostic reports."""
    state_color = "#E53E3E" if dominant_state == "Stressed" else "#319795" if dominant_state == "Focused" else "#4A5568"
    state_bg = "#FFF5F5" if dominant_state == "Stressed" else "#E6FFFA" if dominant_state == "Focused" else "#EDF2F7"

    notes_section = ""
    if notes:
        notes_section = f"""
        <div style="margin-top: 20px; padding: 15px; background: #F7FAFC; border-left: 4px solid #3182CE; border-radius: 4px;">
            <strong style="color: #2D3748; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Clinician / Practitioner Notes:</strong>
            <p style="margin: 8px 0 0 0; color: #4A5568; font-size: 14px; line-height: 1.5;">{notes}</p>
        </div>
        """

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F7FAFC; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
            .header {{ background: linear-gradient(135deg, #1A365D 0%, #2B6CB0 100%); padding: 30px 25px; text-align: left; }}
            .header h1 {{ color: #FFFFFF; font-size: 20px; margin: 0; font-weight: 700; letter-spacing: -0.5px; }}
            .header p {{ color: #BEE3F8; font-size: 13px; margin: 6px 0 0 0; }}
            .content {{ padding: 30px 25px; }}
            .greeting {{ font-size: 16px; color: #2D3748; font-weight: 600; margin-bottom: 12px; }}
            .intro {{ font-size: 14px; color: #718096; line-height: 1.6; margin-bottom: 24px; }}
            .metrics-grid {{ display: table; width: 100%; border-collapse: collapse; margin-bottom: 24px; }}
            .metric-box {{ display: table-cell; width: 33.33%; padding: 15px; text-align: center; border: 1px solid #E2E8F0; border-radius: 8px; }}
            .metric-label {{ font-size: 11px; text-transform: uppercase; color: #A0AEC0; font-weight: 600; letter-spacing: 0.5px; }}
            .metric-value {{ font-size: 18px; font-weight: 700; color: #2D3748; margin-top: 4px; }}
            .badge {{ display: inline-block; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 13px; color: {state_color}; background: {state_bg}; }}
            .footer {{ padding: 20px 25px; background: #EDF2F7; text-align: center; font-size: 12px; color: #A0AEC0; border-top: 1px solid #E2E8F0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>St. Jude Health & Neural Diagnostics</h1>
                <p>SNN-AI Cognitive Optimization & EEG Telemetry Platform</p>
            </div>
            <div class="content">
                <div class="greeting">Hello, {recipient_name}</div>
                <div class="intro">
                    Your recent EEG cognitive assessment (<strong>{filename}</strong>) has been processed by the Event-Driven Spiking Neural Network (SNN) engine. Attached is your official clinical diagnostic PDF report.
                </div>

                <div class="metrics-grid">
                    <div class="metric-box" style="background: #FAF5FF; border-color: #E9D8FD;">
                        <div class="metric-label">Dominant State</div>
                        <div class="metric-value"><span class="badge">{dominant_state}</span></div>
                    </div>
                    <div class="metric-box" style="background: #F0FFF4; border-color: #C6F6D5;">
                        <div class="metric-label">SNN Risk Score</div>
                        <div class="metric-value" style="color: #276749;">{snn_risk_score:.0f}%</div>
                    </div>
                    <div class="metric-box" style="background: #EBF8FF; border-color: #BEE3F8;">
                        <div class="metric-label">Beta/Alpha Ratio</div>
                        <div class="metric-value" style="color: #2B6CB0;">{beta_alpha_ratio:.2f}</div>
                    </div>
                </div>

                {notes_section}

                <div style="margin-top: 25px; padding: 12px 16px; background: #FEFCBF; border: 1px solid #FAF089; border-radius: 6px; color: #744210; font-size: 12px;">
                    📎 <strong>Attachment:</strong> The complete waveform time-series and spectral FFT report is attached as a PDF.
                </div>
            </div>
            <div class="footer">
                © 2026 St. Jude Clinical Health & SNN-AI Optimizer • Confidential Medical Diagnostic Telemetry
            </div>
        </div>
    </body>
    </html>
    """

def get_stress_alert_email_html(
    patient_name: str,
    patient_id: str,
    snn_risk_score: float,
    beta_alpha_ratio: float,
    doctor_name: str = "Attending Physician"
) -> str:
    """Generates an urgent clinical stress alert email."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FFF5F5; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 2px solid #FEB2B2; overflow: hidden; }}
            .header {{ background: #C53030; padding: 20px 25px; color: #FFFFFF; }}
            .header h1 {{ margin: 0; font-size: 18px; }}
            .content {{ padding: 25px; color: #2D3748; line-height: 1.6; font-size: 14px; }}
            .alert-box {{ background: #FFF5F5; border: 1px solid #FEB2B2; border-radius: 6px; padding: 15px; margin: 15px 0; }}
            .footer {{ background: #F7FAFC; padding: 15px; text-align: center; font-size: 11px; color: #A0AEC0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⚠️ CRITICAL: Neural Cognitive Stress Alert</h1>
            </div>
            <div class="content">
                <p>Attention <strong>{doctor_name}</strong>,</p>
                <p>The real-time SNN Cognitive Monitor has detected an acute neural overload threshold spike for patient <strong>{patient_name}</strong> (<code>{patient_id}</code>).</p>
                
                <div class="alert-box">
                    <strong>Telemetry Findings:</strong>
                    <ul>
                        <li><strong>SNN Spike Probability:</strong> {snn_risk_score:.0f}% (Exceeds 75% critical limit)</li>
                        <li><strong>Beta/Alpha Wave Ratio:</strong> {beta_alpha_ratio:.2f} (High-frequency beta hyperactivity)</li>
                        <li><strong>Autonomic State:</strong> Acute sympathetic dominance detected</li>
                    </ul>
                </div>

                <p><strong>Recommended Action:</strong> Review patient telemetry log in the Clinical Workspace and initiate a 15-minute biofeedback neuro-recovery protocol.</p>
            </div>
            <div class="footer">
                Automated Clinical Notification • SNN-AI Health Monitor System
            </div>
        </div>
    </body>
    </html>
    """
