import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

np.random.seed(42)  # makes results reproducible each time we run this

# ---- Generate synthetic student data ----
n_samples = 500

cgpa = np.random.normal(7.2, 1.0, n_samples).clip(4.0, 10.0)
backlogs = np.random.poisson(0.8, n_samples).clip(0, 8)
skill_count = np.random.poisson(4, n_samples).clip(0, 15)
has_internship = np.random.binomial(1, 0.4, n_samples)
attendance = np.random.normal(80, 10, n_samples).clip(40, 100)

# ---- Define placement rule with some randomness (mimics real-world messiness) ----
# higher cgpa, more skills, internship, good attendance, fewer backlogs -> more likely placed
score = (
    (cgpa - 5) * 1.5
    + skill_count * 0.8
    + has_internship * 2.0
    + (attendance - 60) * 0.05
    - backlogs * 1.2
    + np.random.normal(0, 2, n_samples)  # random noise, since real life isn't perfectly predictable
)
placed = (score > np.median(score)).astype(int)

df = pd.DataFrame({
    "cgpa": cgpa,
    "backlogs": backlogs,
    "skill_count": skill_count,
    "has_internship": has_internship,
    "attendance": attendance,
    "placed": placed
})

print("Sample data:")
print(df.head())
print(f"\nPlacement rate in dataset: {df['placed'].mean():.1%}")

# ---- Train the model ----
X = df[["cgpa", "backlogs", "skill_count", "has_internship", "attendance"]]
y = df["placed"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LogisticRegression()
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\nModel accuracy on test set: {accuracy:.1%}")
print("\nClassification report:")
print(classification_report(y_test, y_pred))

# ---- Save the trained model ----
joblib.dump(model, "placement_model.pkl")
print("\nModel saved as placement_model.pkl")