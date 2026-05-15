from fastapi import APIRouter, HTTPException, Depends
from ..models import ReliefRequestCreate, ReliefRequestResponse, UpdateStatus
from ..database import requests_col
from ..dependencies import get_current_user, require_role
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.post("", response_model=ReliefRequestResponse)
async def create_request(data: ReliefRequestCreate, current_user: dict = Depends(require_role("gn_officer", "super_admin"))):
    req_dict = data.dict()
    req_dict["creator_id"] = current_user["_id"]
    req_dict["status"] = "pending"
    req_dict["created_at"] = datetime.utcnow()
    req_dict["priority_level"] = "yellow"
    
    result = requests_col.insert_one(req_dict)
    req_dict["_id"] = str(result.inserted_id)
    return req_dict

@router.get("", response_model=list[ReliefRequestResponse])
async def get_requests():
    requests = list(requests_col.find().sort("created_at", -1))
    for r in requests:
        r["_id"] = str(r["_id"])
    return requests

@router.get("/my", response_model=list[ReliefRequestResponse])
async def get_my_requests(current_user: dict = Depends(get_current_user)):
    requests = list(requests_col.find({"creator_id": current_user["_id"]}).sort("created_at", -1))
    for r in requests:
        r["_id"] = str(r["_id"])
    return requests

@router.patch("/{id}/status", response_model=ReliefRequestResponse)
async def update_request_status(id: str, data: UpdateStatus, current_user: dict = Depends(require_role("gn_officer", "super_admin"))):
    result = requests_col.find_one_and_update(
        {"_id": ObjectId(id)},
        {"$set": {"status": data.status}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Request not found")
    
    result["_id"] = str(result["_id"])
    return result
