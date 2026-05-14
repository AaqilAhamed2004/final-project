"""
This file defines FastAPI dependencies for authentication and role-based access control.

dependencies.py
FastAPI dependencies for authentication and role checking.

Usage in a router:
    from ..dependencies import require_role

    @router.get("/admin-only")
    def admin_route(current_user = Depends(require_role("super_admin"))):
        ...
"""

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from .auth import decode_token
from .database import users_col
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Reads the JWT from the request's Authorization header.
    Returns the user document from MongoDB.
    Raises 401 if token is missing, expired, or invalid.
    """
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token",
                            headers={"WWW-Authenticate": "Bearer"})

    user = users_col.find_one({"_id": ObjectId(payload.get("sub"))})
    if not user:
        raise HTTPException(status_code=401, detail="User account not found")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")

    # Convert ObjectId to string so it can be serialised to JSON
    user["_id"] = str(user["_id"])
    return user


def require_role(*roles: str):
    """
    Dependency factory. Checks the user's role after authentication.

    Usage:
        Depends(require_role("super_admin"))
        Depends(require_role("gn_officer", "super_admin"))
    """
    def checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in roles:
            raise HTTPException(
                status_code=403,
                detail=f"This action requires one of these roles: {', '.join(roles)}"
            )
        return current_user
    return checker