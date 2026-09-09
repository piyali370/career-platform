import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-3.6-flash")


def get_resume_feedback(resume_text: str) -> dict:
    prompt = f"""You are an expert resume reviewer for tech job applications. Analyze the following resume text and give constructive, specific feedback.

Resume text:
{resume_text}

Respond ONLY with valid JSON in this exact structure, nothing else, no markdown formatting:
{{
  "overall_score": <integer 0-100>,
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "improvements": ["<specific actionable improvement 1>", "<specific actionable improvement 2>", "<specific actionable improvement 3>"],
  "missing_sections": ["<section name if genuinely missing, e.g. Projects, Certifications>"]
}}

Focus on: quantifiable achievements (numbers, metrics, impact), missing standard resume sections, weak or vague phrasing, formatting/structure issues visible in the raw text, and ATS-friendliness. Be specific and actionable, not generic. If something is genuinely good, say so in strengths."""

    response = model.generate_content(prompt)
    text = response.text.strip()

    # Gemini sometimes wraps JSON in markdown code fences despite instructions — strip if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "overall_score": None,
            "strengths": [],
            "improvements": ["Could not analyze resume at this time. Please try again."],
            "missing_sections": []
        }