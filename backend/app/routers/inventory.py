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
async def add_item(data: InventoryItem, current_user: dict = Depends(require_role("super_admin"))):
    item_dict = data.dict()
    result = inventory_col.insert_one(item_dict)
    item_dict["_id"] = str(result.inserted_id)
    return item_dict

@router.patch("/{id}", response_model=InventoryItemResponse)
async def update_item(id: str, data: dict, current_user: dict = Depends(require_role("super_admin"))):
    result = inventory_col.find_one_and_update(
        {"_id": ObjectId(id)},
        {"$set": data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Item not found")
    result["_id"] = str(result["_id"])
    return result

@router.delete("/{id}")
async def delete_item(id: str, current_user: dict = Depends(require_role("super_admin"))):
    result = inventory_col.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}
