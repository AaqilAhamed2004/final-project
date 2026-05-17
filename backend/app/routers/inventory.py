from fastapi import APIRouter, HTTPException, Depends
from ..models import InventoryItem, InventoryItemResponse
from ..database import inventory_col
from ..dependencies import require_role
from bson import ObjectId

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
