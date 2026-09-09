import joblib
import pandas as pd

model = joblib.load("placement_model.pkl")

def predict_placement_probability(cgpa: float, backlogs: int, skill_count: int, has_internship: int, attendance: float) -> float:
    input_data = pd.DataFrame([{
        "cgpa": cgpa,
        "backlogs": backlogs,
        "skill_count": skill_count,
        "has_internship": has_internship,
        "attendance": attendance
    }])
    probability = model.predict_proba(input_data)[0][1]  # probability of class "1" (placed)
    return round(probability * 100, 1)