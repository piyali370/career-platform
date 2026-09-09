from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from database import Base
from sqlalchemy import ForeignKey, Float
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)
    auth_provider = Column(String, default="local")  # "local" or "google"
    role = Column(String, nullable=False)  # "student", "admin", "recruiter"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String, nullable=True)
    verification_expires = Column(DateTime(timezone=True), nullable=True)
    reset_code = Column(String, nullable=True)
    reset_code_expires = Column(DateTime(timezone=True), nullable=True)

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    branch = Column(String, nullable=True)
    batch_year = Column(Integer, nullable=True)
    cgpa = Column(Float, nullable=True)
    backlogs = Column(Integer, default=0)
    resume_url = Column(String, nullable=True)
    skills = Column(String, nullable=True)  # comma-separated for now, e.g. "Python,React,SQL"
    extracted_email = Column(String, nullable=True)
    extracted_phone = Column(String, nullable=True)

    user = relationship("User")

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    industry = Column(String, nullable=True)
    hr_contact = Column(String, nullable=True)

class Drive(Base):
    __tablename__ = "drives"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    role = Column(String, nullable=False)
    package = Column(String, nullable=True)
    eligibility_cgpa = Column(Float, nullable=True)
    jd_text = Column(String, nullable=True)
    drive_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    drive_id = Column(Integer, ForeignKey("drives.id"), nullable=False)
    status = Column(String, default="applied")  # applied, shortlisted, interviewed, selected, rejected
    applied_at = Column(DateTime(timezone=True), server_default=func.now())

    interview_datetime = Column(DateTime(timezone=True), nullable=True)
    interview_notes = Column(String, nullable=True)

    placement_year = Column(Integer, nullable=True)

    student = relationship("Student")
    drive = relationship("Drive")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String)
    link = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")

class ApplicationRound(Base):
    __tablename__ = "application_rounds"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"))
    round_name = Column(String)  # e.g. "Shortlisting", "Technical Interview", "HR Round", "Offer"
    round_order = Column(Integer)  # 1, 2, 3... to keep rounds in sequence
    outcome = Column(String, default="pending")  # pending / passed / failed
    notes = Column(String, nullable=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    application = relationship("Application")