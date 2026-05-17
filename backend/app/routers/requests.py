from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from ..models import ReliefRequestCreate, ReliefRequestResponse, UpdateStatus
from ..database import requests_col
from ..dependencies import get_current_user, require_role
from ..prolog_engine import analyze_request
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.post("", response_model=ReliefRequestResponse)
async def create_request(data: ReliefRequestCreate, background_tasks: BackgroundTasks, current_user: dict = Depends(require_role(["gn_officer", "super_admin"]))):
    try:
        req_dict = data.model_dump()
        
        # Default title if none provided
        if not req_dict.get("title"):
            req_dict["title"] = f"Relief Request: {data.location}"
            
        req_dict["creator_id"] = str(current_user["_id"])
        req_dict["status"] = "pending"
        req_dict["created_at"] = datetime.utcnow()
        req_dict["priority_level"] = "Standard"  # Default before AI analysis (matches frontend PRIORITY_LEVELS.STANDARD)

        # Double-defense fallback processing for request items
        for item in req_dict.get("items", []):
            # 1. Fallback stock mapping (quantity is entered in frontend "Available" field)
            if not item.get("current_stock") and item.get("quantity"):
                item["current_stock"] = item.get("quantity", 0)
            
            # 2. Dynamic Prolog key generation from item name
            if not item.get("prolog_item_key"):
                cleaned = "".join([c if c.isalnum() else "_" for c in item.get("item_name", "")]).lower()
                while "__" in cleaned:
                    cleaned = cleaned.replace("__", "_")
                cleaned = cleaned.strip("_")
                item["prolog_item_key"] = cleaned if cleaned else None
        
        result = requests_col.insert_one(req_dict)
        
        # Trigger AI Analysis in the background
        background_tasks.add_task(analyze_request, str(result.inserted_id))
        
        req_dict["_id"] = str(result.inserted_id)
        return req_dict
    except Exception as e:
        print(f"[REQUEST ERROR] Failed to create: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during request creation")

@router.get("", response_model=list[ReliefRequestResponse])
async def get_requests():
    requests = list(requests_col.find().sort("created_at", -1))
    for r in requests:
        r["_id"] = str(r["_id"])
    return requests

@router.get("/my", response_model=list[ReliefRequestResponse])
async def get_my_requests(current_user: dict = Depends(get_current_user)):
    requests = list(requests_col.find({"creator_id": str(current_user["_id"])}).sort("created_at", -1))
    for r in requests:
        r["_id"] = str(r["_id"])
    return requests

@router.patch("/{id}/status", response_model=ReliefRequestResponse)
async def update_request_status(id: str, data: UpdateStatus, current_user: dict = Depends(require_role(["gn_officer", "super_admin"]))):
    result = requests_col.find_one_and_update(
        {"_id": ObjectId(id)},
        {"$set": {"status": data.status}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Request not found")
    
    result["_id"] = str(result["_id"])
    return result
