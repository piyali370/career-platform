from resume_parser import extract_skills
from skills_data import KNOWN_SKILLS

# A small curated map of skill -> free learning resource
LEARNING_RESOURCES = {
    "Python": "https://www.python.org/about/gettingstarted/",
    "JavaScript": "https://javascript.info/",
    "React": "https://react.dev/learn",
    "Node.js": "https://nodejs.org/en/learn",
    "SQL": "https://www.w3schools.com/sql/",
    "Machine Learning": "https://www.coursera.org/learn/machine-learning",
    "Deep Learning": "https://www.deeplearning.ai/",
    "Docker": "https://docker-curriculum.com/",
    "AWS": "https://aws.amazon.com/getting-started/",
    "Git": "https://www.freecodecamp.org/news/git-and-github-for-beginners/",
    "Django": "https://docs.djangoproject.com/en/stable/intro/tutorial01/",
    "FastAPI": "https://fastapi.tiangolo.com/tutorial/",
    "MongoDB": "https://www.mongodb.com/docs/manual/tutorial/getting-started/",
    "PostgreSQL": "https://www.postgresqltutorial.com/",
    "Data Structures": "https://www.geeksforgeeks.org/data-structures/",
    "Algorithms": "https://www.geeksforgeeks.org/fundamentals-of-algorithms/",
    "REST API": "https://restfulapi.net/",
    "TensorFlow": "https://www.tensorflow.org/tutorials",
    "PyTorch": "https://pytorch.org/tutorials/",
    "Kubernetes": "https://kubernetes.io/docs/tutorials/",
}

def analyze_skill_gap(student_skills_str: str, jd_text: str) -> dict:
    student_skills = set(s.strip() for s in student_skills_str.split(",")) if student_skills_str else set()

    # extract skills mentioned in the job description using the same matcher
    jd_skills = set(extract_skills(jd_text))

    no_skills_detected = len(jd_skills) == 0

    matched = sorted(student_skills & jd_skills)
    missing = sorted(jd_skills - student_skills)

    match_percentage = round((len(matched) / len(jd_skills) * 100), 1) if jd_skills else None

    recommendations = []
    for skill in missing:
        recommendations.append({
            "skill": skill,
            "resource_url": LEARNING_RESOURCES.get(skill)
        })

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "match_percentage": match_percentage,
        "recommendations": recommendations,
        "no_skills_detected": no_skills_detected
    }