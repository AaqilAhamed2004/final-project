from fastapi import APIRouter, HTTPException, Depends
from ..models import ReliefRequestResponse, PublicStats, BookingCreate
from ..database import requests_col, users_col, bookings_col, inventory_col
from app.dependencies import get_current_user, require_role
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

@router.post("/book", response_model=dict)
async def book_request(data: BookingCreate, current_user: dict = Depends(require_role(["donor", "gn_officer", "super_admin"]))):
    try:
        booking_dict = data.model_dump()
        booking_dict["donor_id"] = str(current_user["_id"])
        booking_dict["booked_at"] = datetime.utcnow()
        
        # Save to a new collection
        bookings_col.insert_one(booking_dict)

        
        # Update request status in main collection
        requests_col.update_one(
            {"_id": ObjectId(data.request_id)},
            {"$set": {"status": "ongoing"}}
        )
        
        return {"message": "Donation booked successfully", "booking_id": str(booking_dict["_id"])}
    except Exception as e:
        print(f"[PUBLIC ERROR] Booking failed: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during booking")

@router.get("/my-contributions", response_model=list[dict])
async def get_my_contributions(current_user: dict = Depends(require_role(["donor", "gn_officer", "super_admin"]))):

    bookings = list(bookings_col.find({"donor_id": str(current_user["_id"])}).sort("booked_at", -1))
    results = []
    for b in bookings:
        req = requests_col.find_one({"_id": ObjectId(b["request_id"])})
        if req:
            results.append({
                "booking_id": str(b["_id"]),
                "request_id": str(req["_id"]),
                "title": req.get("title", "Relief Request"),
                "location": req.get("location", "Unknown"),
                "status": req.get("status", "pending"),
                "priority_level": req.get("priority_level", "Standard"),
                "booked_at": b["booked_at"],
                "items": req.get("items", []),
                "notes": b.get("notes", "")
            })
    return results

