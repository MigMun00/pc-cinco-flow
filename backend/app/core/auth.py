from jose import jwt
import requests
from app.core.config import CLERK_ISSUER

JWKS_URL = f"{CLERK_ISSUER}/.well-known/jwks.json"
jwks = requests.get(JWKS_URL).json()

def verify_token(token: str):
    header = jwt.get_unverified_header(token)
    key = next((k for k in jwks['keys'] if k['kid'] == header['kid']))

    payload = jwt.decode(
        token,
        key,
        algorithms=['RS256'],
        issuer=CLERK_ISSUER,
        options={"verify_aud": False}
    )

    return payload