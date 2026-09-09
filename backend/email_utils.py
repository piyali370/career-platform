import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_APP_PASSWORD = os.getenv("EMAIL_APP_PASSWORD")
# FRONTEND_URL = "http://localhost:5173"

def send_verification_email(to_email: str, name: str, code: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your Career Platform verification code"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email

    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Welcome, {name} 👋</h2>
        <p>Use this code to verify your Career Platform account:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #f3f4f6; padding: 16px 24px; border-radius: 8px; text-align: center; margin: 20px 0;">
            {code}
        </div>
        <p style="color:#666; font-size:13px;">This code expires in 10 minutes.</p>
    </div>
    """
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_APP_PASSWORD)
        server.send_message(msg)

def send_bulk_import_credentials(to_email: str, name: str, temp_password: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your Career Platform account is ready"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email

    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Welcome, {name} 👋</h2>
        <p>Your account on Career Platform has been created by your placement cell.</p>
        <p><b>Email:</b> {to_email}<br>
        <b>Temporary Password:</b> {temp_password}</p>
        <p style="margin-top:16px;">Please log in and change your password as soon as possible.</p>
        <a href="http://localhost:5173/login" style="display:inline-block; background:#7c3aed; color:white; padding:10px 20px; border-radius:6px; text-decoration:none; margin-top:10px;">
            Log In
        </a>
    </div>
    """
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_APP_PASSWORD)
        server.send_message(msg)

def send_status_update_email(to_email: str, name: str, role: str, company: str, status: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Application Update: {role} at {company}"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email

    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Hi {name},</h2>
        <p>Your application for <b>{role}</b> at <b>{company}</b> has been updated to:</p>
        <div style="display:inline-block; background:#7c3aed; color:white; padding:8px 16px; border-radius:6px; font-weight:bold; text-transform:capitalize; margin:10px 0;">
            {status}
        </div>
        <p style="margin-top:16px;">Log in to your dashboard to see more details.</p>
    </div>
    """
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_APP_PASSWORD)
        server.send_message(msg)

def send_password_reset_email(to_email: str, name: str, code: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Reset your Career Platform password"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email

    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Hi {name},</h2>
        <p>Use this code to reset your password:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #f3f4f6; padding: 16px 24px; border-radius: 8px; text-align: center; margin: 20px 0;">
            {code}
        </div>
        <p style="color:#666; font-size:13px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
    </div>
    """
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_APP_PASSWORD)
        server.send_message(msg)