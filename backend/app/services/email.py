import logging

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema

from ..config import settings

logger = logging.getLogger(__name__)


class EmailDeliveryError(Exception):
    pass

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_TLS,
    MAIL_SSL_TLS=settings.MAIL_SSL,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)

async def send_otp_email(email: str, otp: str) -> bool:
    """Send OTP email. Returns True if sent, False if SMTP failed (OTP logged to console)."""
    logger.info(
        "SMTP config -> server=%s, port=%s, STARTTLS=%s, SSL_TLS=%s, from=%s",
        settings.MAIL_SERVER, settings.MAIL_PORT,
        settings.MAIL_TLS, settings.MAIL_SSL, settings.MAIL_FROM,
    )
    message = MessageSchema(
        subject="Your OTP Code",
        recipients=[email],
        body=f"Your OTP for verification is: {otp}. It expires in 10 minutes.",
        subtype="plain",
    )
    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        logger.info("OTP email sent successfully to %s", email)
        return True
    except Exception as exc:
        logger.error("SMTP FAILED for %s: %s: %s", email, type(exc).__name__, exc)
        logger.warning(">>> FALLBACK – OTP for %s is: %s <<<", email, otp)
        return False
