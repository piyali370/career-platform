import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-3.6-flash")

def get_interview_question(role: str, skills: str, previous_qa: list) -> str:
    history_text = ""
    for qa in previous_qa:
        history_text += f"Q: {qa['question']}\nA: {qa['answer']}\n\n"

    prompt = f"""You are a technical interviewer conducting a mock interview for a {role} position.
The candidate's skills: {skills}

Previous questions and answers so far:
{history_text if history_text else "(This is the first question)"}

Ask ONE relevant technical interview question. Keep it concise, no preamble, just the question."""

    response = model.generate_content(prompt)
    return response.text.strip()


def get_feedback(role: str, question: str, answer: str) -> str:
    prompt = f"""You are a technical interviewer for a {role} position.

Question asked: {question}
Candidate's answer: {answer}

Give brief, constructive feedback (2-3 sentences) on this answer. Be encouraging but honest about gaps."""

    response = model.generate_content(prompt)
    return response.text.strip()
    prompt = f"""You are an experienced technical interviewer preparing questions for a candidate.

Job Description ({company_name} - {role_title}):
{job_description}

Candidate's Resume:
{resume_text}

Generate likely interview questions this candidate would face for this specific role, based on the overlap and gaps between their resume and the job description.

Return ONLY valid JSON in this exact format, no other text:
{{
  "technical_questions": ["question1", "question2", "question3", "question4"],
  "behavioral_questions": ["question1", "question2", "question3"],
  "project_questions": ["question1", "question2", "question3"],
  "tips": ["short actionable tip1", "short actionable tip2"]
}}

Generate 4 technical questions (based on skills/tech in the JD), 3 behavioral/HR questions, and 3 questions specifically about projects mentioned in the resume. Keep questions realistic and specific, not generic."""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}]
    )

    raw_text = response.content[0].text.strip()
    # Strip markdown code fences if Claude wraps the JSON in them
    raw_text = raw_text.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        raise ValueError("Failed to parse AI response as JSON")