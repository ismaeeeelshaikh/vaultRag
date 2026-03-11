"""Quick SMTP test – run from backend/ with venv active:
   python test_smtp.py
"""
import asyncio
import os
from dotenv import load_dotenv
from email.message import EmailMessage

load_dotenv()

server   = os.getenv("MAIL_SERVER", "smtp.gmail.com")
port     = int(os.getenv("MAIL_PORT", "587"))
username = os.getenv("MAIL_USERNAME", "")
password = os.getenv("MAIL_PASSWORD", "")
mail_from = os.getenv("MAIL_FROM", username)
use_tls  = os.getenv("MAIL_TLS", "True").lower() in ("true", "1", "yes")
use_ssl  = os.getenv("MAIL_SSL", "False").lower() in ("true", "1", "yes")

print(f"Server    : {server}")
print(f"Port      : {port}")
print(f"Username  : {username}")
print(f"MAIL_FROM : {mail_from}")
print(f"STARTTLS  : {use_tls}")
print(f"SSL/TLS   : {use_ssl}")
print(f"Password  : {'***set***' if password else '*** EMPTY ***'}")
print("-" * 40)


async def test():
    import aiosmtplib

    smtp = aiosmtplib.SMTP(
        hostname=server,
        port=port,
        use_tls=use_ssl,
        start_tls=use_tls,
        timeout=30,
    )
    try:
        print("Connecting ...")
        await smtp.connect()
        print("Connected OK!")

        print("Logging in ...")
        await smtp.login(username, password)
        print("Login OK!")

        print(f"Sending test email to {mail_from} ...")
        msg = EmailMessage()
        msg["From"] = mail_from
        msg["To"] = mail_from
        msg["Subject"] = "VaultRag SMTP Test"
        msg.set_content("If you see this, SMTP email delivery works!")
        result = await smtp.send_message(msg)
        print(f"Send result: {result}")
        print("SUCCESS – check your inbox (and spam folder)!")
    except Exception as e:
        print(f"\nFAILED: {type(e).__name__}: {e}")
    finally:
        try:
            await smtp.quit()
        except Exception:
            pass


asyncio.run(test())
