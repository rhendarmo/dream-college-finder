import smtplib
from email.message import EmailMessage
from app.core.config import settings


def send_verification_email(to_email: str, verify_url: str) -> None:
    """
    If SMTP not configured, we print the link (still works for dev/testing).
    """
    if not settings.SMTP_HOST or not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print(f"[DEV EMAIL] Verification link for {to_email}: {verify_url}")
        return

    msg = EmailMessage()
    msg["Subject"] = "Verify your email - dreamcollegefinder"
    msg["From"] = settings.SMTP_FROM_EMAIL
    msg["To"] = to_email
    msg.set_content(f"Verify your email by clicking this link:\n\n{verify_url}\n\nIf you didn't sign up, ignore this email.")

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)