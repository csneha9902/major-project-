from __future__ import annotations

from pathlib import Path
from typing import Dict
from datetime import datetime
import io
import base64

try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False


def generate_pdf_report(analysis_data: Dict, output_path: str | Path | None = None) -> bytes:
    """Generate a PDF report from analysis data."""
    if not HAS_REPORTLAB:
        raise RuntimeError("reportlab library is required for PDF generation. Please install reportlab: pip install reportlab")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    styles = getSampleStyleSheet()
    story = []
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=30,
        alignment=TA_CENTER,
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#3b82f6'),
        spaceAfter=12,
        spaceBefore=20,
    )
    
    # Title
    story.append(Paragraph("Cognitive Health Analysis Report", title_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Metadata
    metadata = analysis_data.get("metadata", {})
    filename = analysis_data.get("filename", "Unknown")
    uploaded_at = analysis_data.get("uploaded_at", datetime.now().isoformat())
    uploaded_by = analysis_data.get("uploaded_by", "Unknown")
    
    metadata_table_data = [
        ["File Name:", filename],
        ["Uploaded At:", uploaded_at],
        ["Uploaded By:", uploaded_by],
        ["Duration:", f"{metadata.get('duration', 0):.2f} seconds"],
        ["Channels:", str(metadata.get('n_channels', 'N/A'))],
        ["Sampling Rate:", f"{metadata.get('sfreq', 0):.1f} Hz"],
    ]
    
    metadata_table = Table(metadata_table_data, colWidths=[2*inch, 4*inch])
    metadata_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f1f5f9')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1e293b')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
    ]))
    
    story.append(metadata_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Executive Summary
    extended = analysis_data.get("extended_analysis", {})
    insights = extended.get("insights_text", [])
    
    story.append(Paragraph("Executive Summary", heading_style))
    if insights:
        summary_text = " ".join(insights)
        story.append(Paragraph(summary_text, styles['Normal']))
    else:
        story.append(Paragraph("No summary available.", styles['Normal']))
    story.append(Spacer(1, 0.2*inch))
    
    # Pattern Detection
    patterns = extended.get("patterns", {})
    if patterns:
        story.append(Paragraph("Pattern Detection", heading_style))
        
        pattern_data = [
            ["Metric", "Value"],
            ["Dominant State", patterns.get("dominant_state", "N/A")],
            ["Stress Events", str(patterns.get("stress_event_count", 0))],
            ["Focus Periods", str(patterns.get("focus_period_count", 0))],
            ["State Transitions", str(patterns.get("transition_count", 0))],
        ]
        
        pattern_table = Table(pattern_data, colWidths=[3*inch, 3*inch])
        pattern_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ]))
        
        story.append(pattern_table)
        story.append(Spacer(1, 0.3*inch))
    
    # Statistical Summary
    statistics = extended.get("statistics", {})
    if statistics:
        story.append(Paragraph("Statistical Summary", heading_style))
        
        stats_data = [["Metric", "Mean", "Std Dev", "Min", "Max"]]
        
        if statistics.get("alpha"):
            alpha_stats = statistics["alpha"]
            stats_data.append([
                "Alpha",
                f"{alpha_stats.get('mean', 0):.3f}",
                f"{alpha_stats.get('std', 0):.3f}",
                f"{alpha_stats.get('min', 0):.3f}",
                f"{alpha_stats.get('max', 0):.3f}",
            ])
        
        if statistics.get("beta"):
            beta_stats = statistics["beta"]
            stats_data.append([
                "Beta",
                f"{beta_stats.get('mean', 0):.3f}",
                f"{beta_stats.get('std', 0):.3f}",
                f"{beta_stats.get('min', 0):.3f}",
                f"{beta_stats.get('max', 0):.3f}",
            ])
        
        if statistics.get("heart_rate"):
            hr_stats = statistics["heart_rate"]
            stats_data.append([
                "Heart Rate (BPM)",
                f"{hr_stats.get('mean', 0):.1f}",
                f"{hr_stats.get('std', 0):.1f}",
                f"{hr_stats.get('min', 0):.1f}",
                f"{hr_stats.get('max', 0):.1f}",
            ])
        
        stats_table = Table(stats_data, colWidths=[1.5*inch, 1*inch, 1*inch, 1*inch, 1*inch])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ]))
        
        story.append(stats_table)
        story.append(Spacer(1, 0.3*inch))
    
    # Recommendations
    story.append(Paragraph("Recommendations", heading_style))
    
    recommendations_text = []
    if patterns.get("stress_event_count", 0) > 0:
        recommendations_text.append(
            f"• Detected {patterns.get('stress_event_count')} stress event(s). "
            "Consider reviewing these periods and implementing stress reduction techniques."
        )
    
    if patterns.get("focus_period_count", 0) > 0:
        recommendations_text.append(
            f"• Identified {patterns.get('focus_period_count')} sustained focus period(s). "
            "These periods indicate optimal cognitive engagement."
        )
    
    trends = extended.get("trends", {})
    if trends:
        if trends.get("alpha_trend") == "increasing":
            recommendations_text.append(
                "• Increasing alpha wave activity suggests improving relaxation. "
                "Maintain current practices."
            )
        elif trends.get("alpha_trend") == "decreasing":
            recommendations_text.append(
                "• Decreasing alpha wave activity may indicate increased alertness or stress. "
                "Consider relaxation techniques."
            )
    
    if not recommendations_text:
        recommendations_text.append("• Continue monitoring cognitive patterns for optimal health.")
    
    for rec in recommendations_text:
        story.append(Paragraph(rec, styles['Normal']))
        story.append(Spacer(1, 0.1*inch))
    
    story.append(Spacer(1, 0.3*inch))
    
    # Footer
    story.append(Spacer(1, 0.2*inch))
    footer_text = f"Report generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | SNN-AI Cognitive Health Optimizer"
    story.append(Paragraph(footer_text, ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#64748b'),
        alignment=TA_CENTER,
    )))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    pdf_bytes = buffer.read()
    buffer.close()
    
    # Save to file if path provided
    if output_path:
        with open(output_path, 'wb') as f:
            f.write(pdf_bytes)
    
    return pdf_bytes

