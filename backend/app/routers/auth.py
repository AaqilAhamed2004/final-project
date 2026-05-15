from fastapi import APIRouter, HTTPException, Depends
from ..models import UserRegister, UserLogin, UserResponse
from ..database import users_col
from ..auth import hash_password, verify_password, create_access_token
from ..dependencies import get_current_user
from datetime import datetime

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(data: UserRegister):
    try:
        # Check if user already exists
        if users_col.find_one({"email": data.email}):
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Use model_dump() for Pydantic v2 compatibility
        user_dict = data.model_dump()
        user_dict["password"] = hash_password(data.password)
        user_dict["created_at"] = datetime.utcnow()
        user_dict["is_active"] = True
        
        result = users_col.insert_one(user_dict)
        
        # Explicitly set the ID for the response model
        user_dict["_id"] = str(result.inserted_id)
        return user_dict
        
    except Exception as e:
        print(f"[AUTH ERROR] Registration failed: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/login")
async def login(data: UserLogin):
    try:
        user = users_col.find_one({"email": data.email})
        if not user or not verify_password(data.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
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
