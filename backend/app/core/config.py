import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("MYSQL_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Configure it in backend/.env")

CLERK_ISSUER = os.getenv("CLERK_ISSUER")
