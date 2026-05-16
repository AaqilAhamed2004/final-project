"""
This file defines FastAPI dependencies for authentication and role-based access control.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .auth import decode_token
from .database import users_col
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Reads the JWT from the request's Authorization header.
    Returns the user document from MongoDB.
    """
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = users_col.find_one({"_id": ObjectId(payload.get("sub"))})
    if not user:
        raise HTTPException(status_code=401, detail="User account not found")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")

    # Convert ObjectId to string for JSON serialization
    user["_id"] = str(user["_id"])
    return user

def require_role(*roles: str):
    """
    Dependency factory. Checks the user's role after authentication.
    Supports require_role("admin") or require_role(["admin", "officer"]).
    """
    allowed_roles = []
    for r in roles:
        if isinstance(r, list):
            allowed_roles.extend(r)
        else:
            allowed_roles.append(r)

    def checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of these roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return checker