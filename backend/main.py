from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
import schemas
import auth
from auth import require_role
from matcher import compute_match_score
from resume_parser import extract_text, extract_skills, extract_email, extract_phone
from predictor import predict_placement_probability
from predictor import predict_placement_probability
from auth import get_current_user
import secrets
import random
from datetime import datetime, timedelta, timezone
from email_utils import send_verification_email, send_bulk_import_credentials
from fastapi.responses import Response
from resume_builder import generate_resume_pdf
from skill_gap import analyze_skill_gap
from mock_interview import get_interview_question, get_feedback
import pandas as pd
import io
import secrets
import shutil
import os
import uuid
from notifications import create_notification
from assistant import ask_assistant
from leaderboard import calculate_profile_completeness, calculate_skill_count
from predictor import predict_placement_probability
from resume_feedback import get_resume_feedback
from datetime import datetime as dt
from email_utils import send_password_reset_email

UPLOAD_DIR = "uploads/resumes"


Base.metadata.create_all(bind=engine)

app = FastAPI()

FRONTEND_ORIGINS = [origin.strip() for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Career Platform backend is alive!"}


ALLOWED_ADMIN_DOMAINS = [d.strip() for d in os.getenv("ALLOWED_ADMIN_DOMAINS", "").split(",") if d.strip()]

@app.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if user.role not in ("student", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role")

    if user.role == "admin":
        domain = user.email.split("@")[-1].lower()
        if domain not in ALLOWED_ADMIN_DOMAINS:
            raise HTTPException(
                status_code=400,
                detail="Admin registration requires a recognized college email address."
            )

    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    verification_code = str(random.randint(100000, 999999))
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)

    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=auth.hash_password(user.password),
        role=user.role,
        is_verified=False,
        verification_code=verification_code,
        verification_expires=expires
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    try:
        send_verification_email(new_user.email, new_user.name, verification_code)
    except Exception as e:
        print(f"Failed to send verification email: {e}")

    return new_user

@app.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not auth.verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before logging in")

    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.post("/students/me", response_model=schemas.StudentOut)
def create_or_update_student_profile(
    profile: schemas.StudentCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()

    if student:
        # update existing profile
        for key, value in profile.dict(exclude_unset=True).items():
            setattr(student, key, value)
    else:
        # create new profile
        student = models.Student(user_id=current_user.id, **profile.dict())
        db.add(student)

    db.commit()
    db.refresh(student)
    return student

@app.get("/students/me", response_model=schemas.StudentOut)
def get_my_student_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student



@app.post("/students/me/resume", response_model=schemas.StudentOut)
def upload_resume(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # only allow PDF and DOCX files
    allowed_extensions = {".pdf", ".docx"}
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed")

    # generate a unique filename so different students' resumes never overwrite each other
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # save the file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # find or create the student profile
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found. Create your profile first.")

    student.resume_url = file_path
    db.commit()
    db.refresh(student)
    return student



@app.post("/students/me/resume/parse", response_model=schemas.StudentOut)
def parse_resume(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    if not student.resume_url:
        raise HTTPException(status_code=400, detail="No resume uploaded yet")

    text = extract_text(student.resume_url)
    skills_found = extract_skills(text)
    email_found = extract_email(text)
    phone_found = extract_phone(text)

    student.skills = ",".join(skills_found)
    student.extracted_email = email_found
    student.extracted_phone = phone_found

    db.commit()
    db.refresh(student)
    return student

@app.get("/students/me/resume/debug-text")
def debug_resume_text(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student or not student.resume_url:
        raise HTTPException(status_code=404, detail="No resume found")
    text = extract_text(student.resume_url)
    return {"extracted_text": text, "length": len(text)}

# ---- Companies ----

@app.post("/companies", response_model=schemas.CompanyOut)
def create_company(
    company: schemas.CompanyCreate,
    current_user: models.User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    new_company = models.Company(**company.dict())
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    return new_company

@app.get("/companies", response_model=list[schemas.CompanyOut])
def list_companies(db: Session = Depends(get_db)):
    return db.query(models.Company).all()

# ---- Drives ----

@app.post("/drives", response_model=schemas.DriveOut)
def create_drive(
    drive: schemas.DriveCreate,
    current_user: models.User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    company = db.query(models.Company).filter(models.Company.id == drive.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    new_drive = models.Drive(**drive.dict())
    db.add(new_drive)
    db.commit()
    db.refresh(new_drive)

    # Notify students with a strong resume match for this new drive
    students = db.query(models.Student).filter(models.Student.resume_url.isnot(None)).all()
    for student in students:
        try:
            resume_text = extract_text(student.resume_url)
            score = compute_match_score(resume_text, new_drive.jd_text or "")
            if score >= 60:
                create_notification(
                    db,
                    user_id=student.user_id,
                    message=f"New drive matches your profile: {new_drive.role} at {new_drive.company.name if new_drive.company else ''} ({score}% match)",
                    link="/drives"
                )
        except Exception as e:
            print(f"Failed to check match for student {student.id}: {e}")

    return new_drive

@app.get("/drives", response_model=list[schemas.DriveOut])
def list_drives(db: Session = Depends(get_db)):
    return db.query(models.Drive).all()

@app.get("/drives/matches")
def get_drive_matches(
    current_user: models.User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    if not student.resume_url:
        raise HTTPException(status_code=400, detail="Upload a resume first to see match scores")

    resume_text = extract_text(student.resume_url)
    drives = db.query(models.Drive).all()

    results = []
    for drive in drives:
        score = compute_match_score(resume_text, drive.jd_text or "")
        results.append({
            "drive_id": drive.id,
            "role": drive.role,
            "company": drive.company.name,
            "package": drive.package,
            "match_score": score
        })

    # sort by best match first
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results

@app.get("/drives/{drive_id}", response_model=schemas.DriveOut)
def get_drive(drive_id: int, db: Session = Depends(get_db)):
    drive = db.query(models.Drive).filter(models.Drive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
    return drive


@app.get("/drives/{drive_id}/skill-gap")
def get_skill_gap(
    drive_id: int,
    current_user: models.User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    drive = db.query(models.Drive).filter(models.Drive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    result = analyze_skill_gap(student.skills or "", drive.jd_text or "")
    result["drive_role"] = drive.role
    result["company_name"] = drive.company.name
    return result


@app.get("/drives/{drive_id}/mock-interview")
def get_mock_interview(drive_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student or not student.resume_url:
        raise HTTPException(status_code=400, detail="Please upload a resume first")

    drive = db.query(models.Drive).filter(models.Drive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    resume_text = extract_text_from_docx(student.resume_url) if student.resume_url.endswith(".docx") else extract_text_from_pdf(student.resume_url)

    try:
        questions = generate_mock_interview_questions(
            resume_text=resume_text,
            job_description=drive.description,
            company_name=drive.company.name if drive.company else "",
            role_title=drive.role_title if hasattr(drive, "role_title") else ""
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return questions

# ---- Applications ----

@app.post("/applications", response_model=schemas.ApplicationOut)
def apply_to_drive(
    application: schemas.ApplicationCreate,
    current_user: models.User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=400, detail="Complete your student profile before applying")

    drive = db.query(models.Drive).filter(models.Drive.id == application.drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    # prevent applying twice to the same drive
    existing = db.query(models.Application).filter(
        models.Application.student_id == student.id,
        models.Application.drive_id == drive.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already applied to this drive")

    new_application = models.Application(student_id=student.id, drive_id=drive.id)
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    # Notify all admins of the new application
    admins = db.query(models.User).filter(models.User.role == "admin").all()
    for admin in admins:
        create_notification(
            db,
            user_id=admin.id,
            message=f"{current_user.name} applied for {drive.role} at {drive.company.name}",
            link="/admin/applicants"
        )
    return new_application

@app.get("/applications/me", response_model=list[schemas.ApplicationOut])
def my_applications(
    current_user: models.User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        return []
    return db.query(models.Application).filter(models.Application.student_id == student.id).all()

@app.get("/drives/{drive_id}/applications", response_model=list[schemas.ApplicationOut])
def applications_for_drive(
    drive_id: int,
    current_user: models.User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    return db.query(models.Application).filter(models.Application.drive_id == drive_id).all()


@app.get("/drives/{drive_id}/applicants-ranked")
def get_ranked_applicants(
    drive_id: int,
    current_user: models.User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    drive = db.query(models.Drive).filter(models.Drive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    applications = db.query(models.Application).filter(models.Application.drive_id == drive_id).all()

    results = []
    for app in applications:
        student = app.student
        score = 0.0
        if student.resume_url:
            resume_text = extract_text(student.resume_url)
            score = compute_match_score(resume_text, drive.jd_text or "")

        results.append({
            "application_id": app.id,
            "student_id": student.id,
            "student_name": student.user.name,
            "student_email": student.user.email,
            "cgpa": student.cgpa,
            "skills": student.skills,
            "status": app.status,
            "match_score": score,
            "interview_datetime": app.interview_datetime,
            "interview_notes": app.interview_notes,
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results


@app.patch("/applications/{application_id}/status")
def update_application_status(
    application_id: int,
    data: schemas.ApplicationStatusUpdate,
    current_user: models.User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    application = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    application.status = data.status

    if data.status == "selected" and not application.placement_year:
        application.placement_year = datetime.now().year

    db.commit()
    db.refresh(application)

    # Notify the student
    student_user = application.student.user
    create_notification(
        db,
        user_id=student_user.id,
        message=f"Your application for {application.drive.role} at {application.drive.company.name} is now '{data.status}'",
        link="/applications"
    )

    try:
        send_status_update_email(student_user.email, student_user.name, application.drive.role, application.drive.company.name, data.status)
    except Exception as e:
        print(f"Failed to send status update email: {e}")

    return application



@app.get("/students/me/placement-prediction")
def get_my_placement_prediction(
    current_user: models.User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    skill_count = len(student.skills.split(",")) if student.skills else 0
    has_internship = 1 if student.skills and "internship" in student.skills.lower() else 0
    # attendance isn't tracked in our student model yet — use a reasonable default
    attendance = 80.0

    probability = predict_placement_probability(
        cgpa=student.cgpa or 6.0,
        backlogs=student.backlogs or 0,
        skill_count=skill_count,
        has_internship=has_internship,
        attendance=attendance
    )

    return {
        "placement_probability": probability,
        "cgpa_used": student.cgpa,
        "backlogs_used": student.backlogs,
        "skill_count_used": skill_count
    }


@app.get("/admin/analytics")
def get_analytics(
    current_user: models.User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    students = db.query(models.Student).all()
    applications = db.query(models.Application).all()

    total_students = len(students)
    avg_cgpa = round(sum(s.cgpa for s in students if s.cgpa) / len([s for s in students if s.cgpa]), 2) if any(s.cgpa for s in students) else 0

    # branch-wise breakdown
    branch_stats = {}
    for s in students:
        branch = s.branch or "Unspecified"
        if branch not in branch_stats:
            branch_stats[branch] = {"count": 0, "total_cgpa": 0, "cgpa_count": 0}
        branch_stats[branch]["count"] += 1
        if s.cgpa:
            branch_stats[branch]["total_cgpa"] += s.cgpa
            branch_stats[branch]["cgpa_count"] += 1

    branch_breakdown = [
        {
            "branch": branch,
            "student_count": data["count"],
            "avg_cgpa": round(data["total_cgpa"] / data["cgpa_count"], 2) if data["cgpa_count"] else 0
        }
        for branch, data in branch_stats.items()
    ]

    # application status breakdown
    status_counts = {}
    for app in applications:
        status_counts[app.status] = status_counts.get(app.status, 0) + 1
    status_breakdown = [{"status": status, "count": count} for status, count in status_counts.items()]

    # at-risk students (placement probability below 40%)
    at_risk = []
    for s in students:
        skill_count = len(s.skills.split(",")) if s.skills else 0
        has_internship = 1 if s.skills and "internship" in s.skills.lower() else 0
        probability = predict_placement_probability(
            cgpa=s.cgpa or 6.0,
            backlogs=s.backlogs or 0,
            skill_count=skill_count,
            has_internship=has_internship,
            attendance=80.0
        )
        if probability < 40:
            at_risk.append({
                "student_name": s.user.name,
                "branch": s.branch,
                "cgpa": s.cgpa,
                "probability": probability
            })

    at_risk.sort(key=lambda x: x["probability"])

    return {
        "total_students": total_students,
        "total_drives": db.query(models.Drive).count(),
        "total_applications": len(applications),
        "avg_cgpa": avg_cgpa,
        "branch_breakdown": branch_breakdown,
        "status_breakdown": status_breakdown,
        "at_risk_students": at_risk,
    }


@app.post("/verify-email")
def verify_email(data: schemas.VerifyCodeRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        return {"message": "Email already verified."}
    if not user.verification_code or user.verification_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    if user.verification_expires and datetime.now(timezone.utc) > user.verification_expires:
        raise HTTPException(status_code=400, detail="Verification code expired. Please request a new one.")

    user.is_verified = True
    user.verification_code = None
    user.verification_expires = None
    db.commit()
    return {"message": "Email verified successfully! You can now log in."}

@app.post("/resend-verification")
def resend_verification(data: schemas.UserLogin, db: Session = Depends(get_db)):
    # reuses UserLogin schema just for the email field — password isn't checked here
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        return {"message": "Email already verified."}

    new_code = str(random.randint(100000, 999999))
    user.verification_code = new_code
    user.verification_expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    db.commit()

    try:
        send_verification_email(user.email, user.name, new_code)
    except Exception as e:
        print(f"Failed to resend verification email: {e}")

    return {"message": "Verification code resent."}


from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

@app.post("/auth/google", response_model=schemas.Token)
def google_login(data: schemas.GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(
            data.credential, google_requests.Request(), GOOGLE_CLIENT_ID
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = idinfo["email"]
    name = idinfo.get("name", email.split("@")[0])

    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        # first time signing in with Google -> create account automatically
        user = models.User(
            name=name,
            email=email,
            password_hash=None,
            role="student",  # default role for Google sign-ups
            is_verified=True,  # Google already verified this email for us
            auth_provider="google"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}


import httpx

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")

@app.post("/auth/github", response_model=schemas.Token)
def github_login(data: schemas.GitHubAuthRequest, db: Session = Depends(get_db)):
    # Step 1: exchange the temporary code for an access token
    token_response = httpx.post(
        "https://github.com/login/oauth/access_token",
        data={
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": data.code,
        },
        headers={"Accept": "application/json"},
    )
    token_data = token_response.json()
    github_access_token = token_data.get("access_token")

    if not github_access_token:
        raise HTTPException(status_code=401, detail="Invalid GitHub code")

    # Step 2: use that token to fetch the user's GitHub profile
    user_response = httpx.get(
        "https://api.github.com/user",
        headers={"Authorization": f"Bearer {github_access_token}"},
    )
    github_user = user_response.json()

    # GitHub emails can be private, so fetch the verified email separately if needed
    email = github_user.get("email")
    if not email:
        email_response = httpx.get(
            "https://api.github.com/user/emails",
            headers={"Authorization": f"Bearer {github_access_token}"},
        )
        emails = email_response.json()
        primary = next((e for e in emails if e.get("primary")), None)
        email = primary["email"] if primary else None

    if not email:
        raise HTTPException(status_code=400, detail="Could not retrieve email from GitHub")

    name = github_user.get("name") or github_user.get("login")

    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        user = models.User(
            name=name,
            email=email,
            password_hash=None,
            role="student",
            is_verified=True,
            auth_provider="github"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/resume-builder/generate")
def build_resume(
    data: schemas.ResumeBuilderRequest,
    current_user: models.User = Depends(get_current_user)
):
    pdf_bytes = generate_resume_pdf(data.dict())
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=resume.pdf"}
    )


@app.post("/mock-interview/question")
def mock_interview_question(
    data: schemas.InterviewQuestionRequest,
    current_user: models.User = Depends(require_role("student"))
):
    try:
        question = get_interview_question(data.role, data.skills, data.previous_qa)
        return {"question": question}
    except Exception as e:
        raise HTTPException(status_code=503, detail="Interview service unavailable. Please try again.")

@app.post("/mock-interview/feedback")
def mock_interview_feedback(
    data: schemas.InterviewFeedbackRequest,
    current_user: models.User = Depends(require_role("student"))
):
    try:
        feedback = get_feedback(data.role, data.question, data.answer)
        return {"feedback": feedback}
    except Exception as e:
        raise HTTPException(status_code=503, detail="Interview service unavailable. Please try again.")




@app.post("/admin/students/bulk-import")
async def bulk_import_students(
    file: UploadFile = File(...),
    current_user: models.User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Please upload a .csv or .xlsx file")

    contents = await file.read()

    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read the file. Please check the format.")

    required_columns = {"name", "email", "branch", "batch_year", "cgpa", "backlogs"}
    if not required_columns.issubset(set(df.columns)):
        missing = required_columns - set(df.columns)
        raise HTTPException(status_code=400, detail=f"Missing required columns: {', '.join(missing)}")

    created = []
    skipped = []

    for _, row in df.iterrows():
        email = str(row["email"]).strip()

        existing = db.query(models.User).filter(models.User.email == email).first()
        if existing:
            skipped.append({"email": email, "reason": "Already exists"})
            continue

        temp_password = secrets.token_urlsafe(8)

        user = models.User(
            name=str(row["name"]).strip(),
            email=email,
            password_hash=auth.hash_password(temp_password),
            role="student",
            is_verified=True,  # admin-imported accounts are pre-verified
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        student = models.Student(
            user_id=user.id,
            branch=str(row["branch"]).strip(),
            batch_year=int(row["batch_year"]),
            cgpa=float(row["cgpa"]),
            backlogs=int(row["backlogs"]),
        )
        db.add(student)
        db.commit()

        try:
            send_bulk_import_credentials(email, user.name, temp_password)
            email_sent = True
        except Exception as e:
            print(f"Failed to send credentials email to {email}: {e}")
            email_sent = False

        created.append({"name": user.name, "email": email, "temp_password": temp_password, "email_sent": email_sent})

        created.append({"name": user.name, "email": email, "temp_password": temp_password})

    return {
        "created_count": len(created),
        "skipped_count": len(skipped),
        "created": created,
        "skipped": skipped
    }


@app.patch("/applications/{application_id}/schedule-interview")
def schedule_interview(
    application_id: int,
    data: schemas.InterviewScheduleRequest,
    current_user: models.User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    application = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    try:
        parsed_datetime = datetime.fromisoformat(data.interview_datetime)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid datetime format")

    application.interview_datetime = parsed_datetime
    application.interview_notes = data.interview_notes
    db.commit()
    db.refresh(application)

    return {"message": "Interview scheduled", "interview_datetime": application.interview_datetime}

@app.get("/notifications/me", response_model=list[schemas.NotificationOut])
def get_my_notifications(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).limit(20).all()

@app.patch("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Marked as read"}

@app.patch("/notifications/mark-all-read")
def mark_all_read(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All marked as read"}


@app.post("/assistant/ask")
def assistant_ask(
    data: schemas.AssistantQuestionRequest,
    current_user: models.User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Please complete your profile first.")

    applications = db.query(models.Application).filter(models.Application.student_id == student.id).all()
    drives = db.query(models.Drive).all()

    try:
        answer = ask_assistant(data.question, student, applications, drives)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=503, detail="Assistant is temporarily unavailable. Please try again.")




@app.get("/leaderboard")
def get_leaderboard(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    students = db.query(models.Student).all()

    entries = []
    for student in students:
        skill_count = calculate_skill_count(student)
        has_internship = 1 if student.skills and "internship" in student.skills.lower() else 0

        readiness = predict_placement_probability(
            cgpa=student.cgpa or 6.0,
            backlogs=student.backlogs or 0,
            skill_count=skill_count,
            has_internship=has_internship,
            attendance=80.0
        )

        entries.append({
            "student_id": student.id,
            "name": student.user.name,
            "branch": student.branch,
            "profile_completeness": calculate_profile_completeness(student),
            "skill_count": skill_count,
            "readiness_score": readiness,
        })

    # sort by readiness score first, since that's the most holistic signal
    entries.sort(key=lambda e: e["readiness_score"], reverse=True)

    # attach rank after sorting
    for i, entry in enumerate(entries):
        entry["rank"] = i + 1

    # find where the current user stands, if they're a student
    my_entry = None
    if current_user.role == "student":
        my_student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
        if my_student:
            my_entry = next((e for e in entries if e["student_id"] == my_student.id), None)

    return {
        "leaderboard": entries[:20],  # top 20 for display
        "my_rank": my_entry
    }



@app.post("/students/me/resume/feedback")
def resume_feedback(
    current_user: models.User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    if not student.resume_url:
        raise HTTPException(status_code=400, detail="Please upload a resume first")

    resume_text = extract_text(student.resume_url)

    try:
        feedback = get_resume_feedback(resume_text)
        return feedback
    except Exception as e:
        raise HTTPException(status_code=503, detail="Feedback service temporarily unavailable. Please try again.")


@app.post("/applications/{application_id}/rounds", response_model=schemas.RoundOut)
def add_round(
    application_id: int,
    data: schemas.RoundCreate,
    current_user: models.User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    application = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    existing_count = db.query(models.ApplicationRound).filter(
        models.ApplicationRound.application_id == application_id
    ).count()

    new_round = models.ApplicationRound(
        application_id=application_id,
        round_name=data.round_name,
        round_order=existing_count + 1,
    )
    db.add(new_round)
    db.commit()
    db.refresh(new_round)
    return new_round


@app.patch("/rounds/{round_id}", response_model=schemas.RoundOut)
def update_round(
    round_id: int,
    data: schemas.RoundUpdate,
    current_user: models.User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    round_obj = db.query(models.ApplicationRound).filter(models.ApplicationRound.id == round_id).first()
    if not round_obj:
        raise HTTPException(status_code=404, detail="Round not found")

    round_obj.outcome = data.outcome
    round_obj.notes = data.notes
    if data.scheduled_at:
        round_obj.scheduled_at = dt.fromisoformat(data.scheduled_at)
    db.commit()

    # Keep the application's overall status roughly in sync with the latest round
    application = round_obj.application
    if data.outcome == "failed":
        application.status = "rejected"
    elif data.outcome == "passed" and round_obj.round_name.lower() == "offer":
        application.status = "selected"
        if not application.placement_year:
            application.placement_year = datetime.now().year
    elif data.outcome == "passed":
        application.status = "interviewed"

    db.commit()

    # Notify the student
    student_user = application.student.user
    create_notification(
        db,
        user_id=student_user.id,
        message=f"{round_obj.round_name} update for {application.drive.role}: {data.outcome}",
        link="/applications"
    )

    return round_obj


@app.get("/applications/{application_id}/rounds", response_model=list[schemas.RoundOut])
def get_rounds(
    application_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.ApplicationRound).filter(
        models.ApplicationRound.application_id == application_id
    ).order_by(models.ApplicationRound.round_order).all()

@app.get("/admin/placement-history")
def get_placement_history(
    current_user: models.User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    placed_applications = db.query(models.Application).filter(
        models.Application.status == "selected",
        models.Application.placement_year.isnot(None)
    ).all()

    year_counts = {}
    branch_year_counts = {}
    company_counts = {}

    for app in placed_applications:
        year = app.placement_year
        year_counts[year] = year_counts.get(year, 0) + 1

        branch = app.student.branch or "Unspecified"
        key = f"{year}-{branch}"
        branch_year_counts[key] = branch_year_counts.get(key, 0) + 1

        company = app.drive.company.name
        company_counts[company] = company_counts.get(company, 0) + 1

    yearly_trend = [{"year": year, "placements": count} for year, count in sorted(year_counts.items())]

    top_companies = sorted(
        [{"company": c, "placements": count} for c, count in company_counts.items()],
        key=lambda x: x["placements"],
        reverse=True
    )[:10]

    return {
        "total_placed": len(placed_applications),
        "yearly_trend": yearly_trend,
        "top_companies": top_companies,
    }


@app.post("/me/change-password")
def change_password(
    data: schemas.ChangePasswordRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.password_hash:
        raise HTTPException(status_code=400, detail="This account uses Google/GitHub sign-in and has no password to change.")

    if not auth.verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    current_user.password_hash = auth.hash_password(data.new_password)
    db.commit()

    return {"message": "Password changed successfully"}



@app.post("/forgot-password")
def forgot_password(data: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    # Always return the same message whether or not the email exists — prevents
    # attackers from using this endpoint to check which emails are registered
    if not user or not user.password_hash:
        return {"message": "If that email is registered, a reset code has been sent."}

    reset_code = str(random.randint(100000, 999999))
    user.reset_code = reset_code
    user.reset_code_expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    db.commit()

    try:
        send_password_reset_email(user.email, user.name, reset_code)
    except Exception as e:
        print(f"Failed to send password reset email: {e}")

    return {"message": "If that email is registered, a reset code has been sent."}


@app.post("/reset-password")
def reset_password(data: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset code")

    if not user.reset_code or user.reset_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid or expired reset code")

    if user.reset_code_expires and datetime.now(timezone.utc) > user.reset_code_expires:
        raise HTTPException(status_code=400, detail="Reset code expired. Please request a new one.")

    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user.password_hash = auth.hash_password(data.new_password)
    user.reset_code = None
    user.reset_code_expires = None
    db.commit()

    return {"message": "Password reset successfully. You can now log in."}


@app.post("/admin/create-admin", response_model=schemas.UserOut)
def create_admin(
    user: schemas.UserCreate,
    current_user: models.User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_admin = models.User(
        name=user.name,
        email=user.email,
        password_hash=auth.hash_password(user.password),
        role="admin",
        is_verified=True,  # trusted since an existing admin created this account
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin