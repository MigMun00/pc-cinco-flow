import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Configure it in backend/.env")

# Normalize shorthand MySQL URLs to an explicit SQLAlchemy driver URL.
if DATABASE_URL.startswith("mysql://"):
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)

CLERK_ISSUER = os.getenv("CLERK_ISSUER")
