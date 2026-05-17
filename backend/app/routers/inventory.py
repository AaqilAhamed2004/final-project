from fastapi import APIRouter, HTTPException, Depends
from ..models import InventoryItem, InventoryItemResponse, InventoryBookRequest
from ..database import inventory_col, bookings_col
from ..dependencies import require_role
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.get("", response_model=list[InventoryItemResponse])
async def get_inventory():
    items = list(inventory_col.find())
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@router.post("", response_model=InventoryItemResponse)
async def add_item(data: InventoryItem, current_user: dict = Depends(require_role(["gn_officer", "super_admin"]))):
    try:
        item_dict = data.model_dump()
        result = inventory_col.insert_one(item_dict)
        item_dict["_id"] = str(result.inserted_id)
        return item_dict
    except Exception as e:
        print(f"[INVENTORY ERROR] Failed to add item: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error adding item")

@router.patch("/{id}", response_model=InventoryItemResponse)
async def update_item(id: str, data: dict, current_user: dict = Depends(require_role(["gn_officer", "super_admin"]))):
    inventory_col.update_one({"_id": ObjectId(id)}, {"$set": data})
    item = inventory_col.find_one({"_id": ObjectId(id)})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item["_id"] = str(item["_id"])
    return item

@router.delete("/{id}")
async def delete_item(id: str, current_user: dict = Depends(require_role(["gn_officer", "super_admin"]))):
    result = inventory_col.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}

@router.post("/{id}/book", response_model=dict)
async def book_inventory_item(id: str, data: InventoryBookRequest, current_user: dict = Depends(require_role(["gn_officer", "super_admin"]))):
    try:
        # Retrieve active item
        item = inventory_col.find_one({"_id": ObjectId(id)})
        if not item:
            raise HTTPException(status_code=404, detail="Inventory item not found")
        
        # Verify requested quantity and availability
        if data.quantity <= 0:
            raise HTTPException(status_code=400, detail="Booking quantity must be greater than zero")
            
        if item["quantity"] < data.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock. Requested: {data.quantity}, Available: {item['quantity']}")
        
        # Deduct requested quantity
        new_quantity = item["quantity"] - data.quantity
        inventory_col.update_one({"_id": ObjectId(id)}, {"$set": {"quantity": new_quantity}})
        
        # Record booking metadata transaction in bookings_col
        booking_record = {
            "type": "inventory_booking",
            "item_id": id,
            "item_name": item["item_name"],
            "quantity_booked": data.quantity,
            "officer_id": str(current_user["_id"]),
            "officer_name": current_user.get("full_name", "Officer"),
            "booked_at": datetime.utcnow()
        }
        bookings_col.insert_one(booking_record)
        
        return {"message": "Inventory booked successfully", "remaining_quantity": new_quantity}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"[BOOKING ERROR] Failed to book inventory: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error processing inventory booking")
