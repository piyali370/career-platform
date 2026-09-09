from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from datetime import datetime as dt
from typing import List, Dict, Any

# What the client sends us when registering
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # "student", "admin", "recruiter"

# What the client sends us when logging in
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# What we send BACK to the client (never include password!)
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True  # lets this read data straight from our SQLAlchemy model

# What we return after successful login
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

from typing import Optional

class StudentCreate(BaseModel):
    branch: Optional[str] = None
    batch_year: Optional[int] = None
    cgpa: Optional[float] = None
    backlogs: Optional[int] = 0
    skills: Optional[str] = None

class StudentOut(BaseModel):
    id: int
    user_id: int
    branch: Optional[str]
    batch_year: Optional[int]
    cgpa: Optional[float]
    backlogs: int
    resume_url: Optional[str]
    skills: Optional[str]
    extracted_email: Optional[str]
    extracted_phone: Optional[str]

    class Config:
        from_attributes = True

class CompanyCreate(BaseModel):
    name: str
    industry: Optional[str] = None
    hr_contact: Optional[str] = None

class CompanyOut(BaseModel):
    id: int
    name: str
    industry: Optional[str]
    hr_contact: Optional[str]

    class Config:
        from_attributes = True

class DriveCreate(BaseModel):
    company_id: int
    role: str
    package: Optional[str] = None
    eligibility_cgpa: Optional[float] = None
    jd_text: Optional[str] = None

class DriveOut(BaseModel):
    id: int
    company_id: int
    role: str
    package: Optional[str]
    eligibility_cgpa: Optional[float]
    jd_text: Optional[str]
    created_at: dt
    company: CompanyOut

    class Config:
        from_attributes = True

class ApplicationCreate(BaseModel):
    drive_id: int

class ApplicationOut(BaseModel):
    id: int
    student_id: int
    drive_id: int
    status: str
    applied_at: datetime
    interview_datetime: Optional[datetime] = None
    interview_notes: Optional[str] = None
    drive: DriveOut

    class Config:
        from_attributes = True

class ApplicationStatusUpdate(BaseModel):
    status: str

class VerifyCodeRequest(BaseModel):
    email: str
    code: str

class GoogleAuthRequest(BaseModel):
    credential: str

class GitHubAuthRequest(BaseModel):
    code: str


class ResumeBuilderRequest(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    summary: Optional[str] = None
    skills: Optional[str] = None
    education: List[Dict[str, Any]] = []
    experience: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []

class InterviewQuestionRequest(BaseModel):
    role: str
    skills: str
    previous_qa: List[Dict[str, Any]] = []

class InterviewFeedbackRequest(BaseModel):
    role: str
    question: str
    answer: str

class InterviewScheduleRequest(BaseModel):
    interview_datetime: str  # ISO format string from the frontend datetime picker
    interview_notes: Optional[str] = None

class NotificationOut(BaseModel):
    id: int
    message: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AssistantQuestionRequest(BaseModel):
    question: str

class RoundCreate(BaseModel):
    round_name: str

class RoundUpdate(BaseModel):
    outcome: str  # "passed" or "failed"
    notes: Optional[str] = None
    scheduled_at: Optional[str] = None

class RoundOut(BaseModel):
    id: int
    round_name: str
    round_order: int
    outcome: str
    notes: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    updated_at: datetime

    class Config:
        from_attributes = True

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str