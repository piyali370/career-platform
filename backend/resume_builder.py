from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_LEFT
from reportlab.lib import colors
import io

def generate_resume_pdf(data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        leftMargin=0.7 * inch,
        rightMargin=0.7 * inch,
    )

    styles = getSampleStyleSheet()

    name_style = ParagraphStyle("Name", parent=styles["Title"], fontSize=20, alignment=TA_LEFT, spaceAfter=2, fontName="Helvetica-Bold")
    contact_style = ParagraphStyle("Contact", parent=styles["Normal"], fontSize=10, textColor=colors.HexColor("#333333"), spaceAfter=10)
    section_style = ParagraphStyle("Section", parent=styles["Heading2"], fontSize=12, fontName="Helvetica-Bold", spaceBefore=12, spaceAfter=4, textColor=colors.HexColor("#1a1a1a"))
    body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=10.5, leading=14, spaceAfter=4)
    sub_style = ParagraphStyle("Sub", parent=styles["Normal"], fontSize=10, leading=13, textColor=colors.HexColor("#444444"), spaceAfter=6)

    elements = []

    # Name + contact
    elements.append(Paragraph(data["name"], name_style))
    contact_line = " | ".join(filter(None, [data.get("email"), data.get("phone"), data.get("linkedin"), data.get("github")]))
    elements.append(Paragraph(contact_line, contact_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cccccc")))

    # Summary
    if data.get("summary"):
        elements.append(Paragraph("SUMMARY", section_style))
        elements.append(Paragraph(data["summary"], body_style))

    # Skills
    if data.get("skills"):
        elements.append(Paragraph("SKILLS", section_style))
        elements.append(Paragraph(data["skills"], body_style))

    # Education
    if data.get("education"):
        elements.append(Paragraph("EDUCATION", section_style))
        for edu in data["education"]:
            line = f"<b>{edu.get('institution', '')}</b> — {edu.get('degree', '')}"
            elements.append(Paragraph(line, body_style))
            sub_line = f"{edu.get('duration', '')}" + (f" | CGPA: {edu.get('cgpa')}" if edu.get('cgpa') else "")
            elements.append(Paragraph(sub_line, sub_style))

    # Experience
    if data.get("experience"):
        elements.append(Paragraph("EXPERIENCE", section_style))
        for exp in data["experience"]:
            line = f"<b>{exp.get('role', '')}</b> — {exp.get('company', '')}"
            elements.append(Paragraph(line, body_style))
            elements.append(Paragraph(exp.get("duration", ""), sub_style))
            for point in exp.get("points", []):
                elements.append(Paragraph(f"• {point}", body_style))

    # Projects
    if data.get("projects"):
        elements.append(Paragraph("PROJECTS", section_style))
        for proj in data["projects"]:
            line = f"<b>{proj.get('title', '')}</b>"
            elements.append(Paragraph(line, body_style))
            elements.append(Paragraph(proj.get("description", ""), sub_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()