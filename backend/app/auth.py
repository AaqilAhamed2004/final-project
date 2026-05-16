"""
This file contains the authentication logic for the AURA backend. 
It includes functions for hashing passwords, verifying passwords, creating JWT access tokens, and decoding

auth.py
Password hashing and JWT token creation/decoding.
"""

from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY  = os.getenv("SECRET_KEY", "fallback-unsafe-key-change-me-immediately-32chars+")
ALGORITHM   = os.getenv("ALGORITHM", "HS256")
EXPIRE_MINS = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 480))

if SECRET_KEY == "fallback-unsafe-key-change-me-immediately-32chars+":
    import warnings
    warnings.warn("[SECURITY] SECRET_KEY is using the fallback value. Set a strong key in your .env file!", stacklevel=2)


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a plain-text password with a 72-byte safety cap for Bcrypt compatibility.
    """
    # Bcrypt has a 72-character limit; truncation prevents Internal Server Errors.
    safe_password = password[:72]
    return pwd_context.hash(safe_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against a hash, including the 72-byte safety cap.
    """
    safe_password = plain_password[:72]
    return pwd_context.verify(safe_password, hashed_password)


def create_access_token(data: dict) -> str:
    """Create a signed JWT. The token expires after EXPIRE_MINS minutes."""
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=EXPIRE_MINS)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    """Decode a JWT. Returns the payload dict, or None if invalid/expired."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None