def calculate_profile_completeness(student) -> int:
    fields_to_check = [
        student.branch,
        student.batch_year,
        student.cgpa,
        student.resume_url,
        student.skills,
        student.extracted_email,
        student.extracted_phone,
    ]
    filled = sum(1 for f in fields_to_check if f)
    return round((filled / len(fields_to_check)) * 100)


def calculate_skill_count(student) -> int:
    if not student.skills:
        return 0
    return len(student.skills.split(","))