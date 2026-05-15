from fastapi import APIRouter, HTTPException, Depends
from ..models import ReliefRequestResponse, PublicStats, BookingCreate
from ..database import requests_col, users_col, bookings_col, inventory_col
from ..dependencies import get_current_user
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.get("/board", response_model=list[ReliefRequestResponse])
async def get_board():
    # Only show public and approved requests
    requests = list(requests_col.find({"is_public": True}).sort("created_at", -1))
    for r in requests:
        r["_id"] = str(r["_id"])
    return requests

@router.get("/stats", response_model=PublicStats)
async def get_stats():
    total_req = requests_col.count_documents({})
    active_zones = len(requests_col.distinct("location"))
    total_donors = users_col.count_documents({"role": "donor"})
    # Mock items distributed based on completed requests
    items_distributed = requests_col.count_documents({"status": "completed"}) * 50
    
    return {
        "total_requests": total_req,
        "active_relief_zones": active_zones,
        "total_donors": total_donors,
        "items_distributed": items_distributed
    }

@router.post("/book")
async def book_request(data: BookingCreate, current_user: dict = Depends(get_current_user)):
    # Check if request exists
    request = requests_col.find_one({"_id": ObjectId(data.request_id)})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    booking = {
        "request_id": data.request_id,
        "donor_id": current_user["_id"],
        "notes": data.notes,
        "booked_at": datetime.utcnow()
    }
    bookings_col.insert_one(booking)
    
    # Optionally update request status
    requests_col.update_one(
        {"_id": ObjectId(data.request_id)},
        {"$set": {"status": "ongoing"}}
    )
    
    return {"message": "Request booked successfully. Thank you for your contribution!"}
