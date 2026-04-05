import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
CLERK_ISSUER = os.getenv("CLERK_ISSUER")