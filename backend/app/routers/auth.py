from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from ..models import UserRegister, UserLogin, UserResponse
from ..database import users_col
from ..auth import hash_password, verify_password, create_access_token
from ..dependencies import get_current_user
from datetime import datetime

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(data: UserRegister):
    try:
        # 1. Check if user already exists
        if users_col.find_one({"email": data.email}):
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Use model_dump() for Pydantic v2 compatibility
        user_dict = data.model_dump()
        
        # 3. CRITICAL: Hash the password and save it as "hashed_password"
        plain_password = user_dict.pop("password")
        user_dict["hashed_password"] = hash_password(plain_password)
        user_dict["created_at"] = datetime.utcnow()
        user_dict["is_active"] = True
        
        # 4. Save to database
        result = users_col.insert_one(user_dict)
        
        # 5. Return sanitized response
        user_dict["_id"] = str(result.inserted_id)
        return user_dict
        
    except Exception as e:
        print(f"[AUTH ERROR] Registration failed: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        # 1. Find user by email (Swagger sends email in the 'username' field)
        user = users_col.find_one({"email": form_data.username})
        
        # 2. Check if user exists
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 3. CRITICAL: Verify using the exact field name "hashed_password"
        if not verify_password(form_data.password, user.get("hashed_password", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.get("is_active", True):
            raise HTTPException(status_code=403, detail="Account deactivated")
        
        # 4. Generate Token
        token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "full_name": user["full_name"],
                "role": user["role"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[AUTH ERROR] Login failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during login")

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
