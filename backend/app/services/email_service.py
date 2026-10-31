import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("chargeroute.email")


class EmailService:
    @staticmethod
    def send_password_reset_email(
        to_email: str,
        reset_token: str,
        user_name: Optional[str] = None,
        frontend_url: Optional[str] = None,
    ) -> dict:
        """
        Sends a secure password reset email to the user.
        If SMTP server is configured, sends via SMTP.
        Otherwise logs and returns development URL for zero-friction local testing.
        """
        frontend_base = (frontend_url or settings.FRONTEND_URL).rstrip("/")
        reset_url = f"{frontend_base}/reset-password?token={reset_token}"
        display_name = user_name or to_email.split("@")[0].title()

        subject = "Reset Your ChargeRoute AI Password"

        html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your Password</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }}
    .container {{ max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
    .header {{ background: #059669; padding: 28px; text-align: center; color: #ffffff; }}
    .header h1 {{ margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }}
    .content {{ padding: 32px 28px; line-height: 1.6; font-size: 14px; color: #334155; }}
    .button-box {{ text-align: center; margin: 28px 0; }}
    .button {{ background: #059669; color: #ffffff !important; padding: 13px 26px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.3); }}
    .link-alt {{ font-size: 12px; color: #64748b; word-break: break-all; margin-top: 16px; }}
    .footer {{ background: #f1f5f9; padding: 18px 28px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ ChargeRoute AI</h1>
    </div>
    <div class="content">
      <p>Hello <strong>{display_name}</strong>,</p>
      <p>We received a request to reset your password for your ChargeRoute AI driver account. Click the button below to choose a new password:</p>
      
      <div class="button-box">
        <a href="{reset_url}" class="button" target="_blank">Reset My Password →</a>
      </div>

      <p>This password reset link will expire in <strong>60 minutes</strong>. If you did not request a password reset, you can safely ignore this email — your account remains secure.</p>
      
      <div class="link-alt">
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="{reset_url}" style="color: #059669;">{reset_url}</a></p>
      </div>
    </div>
    <div class="footer">
      <p>ChargeRoute AI • Pan-India EV Corridor Navigation & Charging Telemetry</p>
      <p>Made by KSVISUALSAGENCY</p>
    </div>
  </div>
</body>
</html>
"""

        text_content = f"""Hello {display_name},

We received a request to reset your password for your ChargeRoute AI driver account.
Please visit the following link to choose a new password:

{reset_url}

This link is valid for 60 minutes. If you did not request this, please ignore this email.

— ChargeRoute AI Team
"""

        sent = False
        error_msg = None

        if settings.SMTP_HOST:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
                msg["To"] = to_email

                part1 = MIMEText(text_content, "plain")
                part2 = MIMEText(html_content, "html")
                msg.attach(part1)
                msg.attach(part2)

                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
                if settings.SMTP_TLS:
                    server.starttls()
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAILS_FROM_EMAIL, [to_email], msg.as_string())
                server.quit()
                sent = True
                logger.info(f"Password reset email sent to {to_email}")
            except Exception as e:
                error_msg = str(e)
                logger.error(f"Failed to send password reset email via SMTP: {e}")
        else:
            logger.info(
                f"[DEV EMAIL MOCK] Password reset link for {to_email}: {reset_url}"
            )

        return {
            "sent": sent,
            "error": error_msg,
            "reset_url": reset_url,
        }
