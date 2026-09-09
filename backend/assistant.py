import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-3.6-flash")


def build_context(student, applications, drives):
    context = f"""Student profile:
- Branch: {student.branch or 'not set'}
- Batch year: {student.batch_year or 'not set'}
- CGPA: {student.cgpa or 'not set'}
- Backlogs: {student.backlogs if student.backlogs is not None else 'not set'}
- Skills: {student.skills or 'none detected'}

Student's applications ({len(applications)} total):
"""
    for app in applications:
        context += f"- {app.drive.role} at {app.drive.company.name}: status = {app.status}\n"

    context += f"\nAll open drives ({len(drives)} total):\n"
    for drive in drives:
        context += (
            f"- {drive.role} at {drive.company.name}: "
            f"package {drive.package or 'not specified'}, "
            f"min CGPA {drive.eligibility_cgpa or 'none'}\n"
        )

    return context


def ask_assistant(question: str, student, applications, drives) -> str:
    context = build_context(student, applications, drives)

    prompt = f"""You are a helpful assistant for a college placement platform. Answer the student's question using ONLY the information provided below. Do not make up information. If the answer isn't in the data provided, say so honestly and suggest they check with the placement office.

{context}

Student's question: {question}

Give a concise, friendly, direct answer."""

    response = model.generate_content(prompt)
    return response.text.strip()