from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

# ── Authentication Models ───────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "donor"  # donor, gn_officer, super_admin

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: str = Field(alias="_id")
    email: EmailStr
    full_name: str
    role: str
    is_active: bool = True

# ── Request Models ──────────────────────────────────────────────────────────

class RequestItem(BaseModel):
    item_name: str
    category: str  # medicine, food, shelter, other
    quantity: int = 0
    quantity_needed: Optional[int] = 0
    current_stock: Optional[int] = 0
    prolog_item_key: Optional[str] = None  # Key for Prolog KB (e.g., 'insulin')

class ReliefRequestCreate(BaseModel):
    title: Optional[str] = None
    description: str
    location: str
    items: List[RequestItem]
    road_status: str = "clear"  # clear, blocked, flooded
    population_size: str = "medium" # small, medium, large
    is_public: bool = True

class ReliefRequestResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: str = Field(alias="_id")
    creator_id: Optional[str] = "system"
    title: Optional[str] = "Untitled Relief Request"
    description: str
    location: str
    items: List[RequestItem] = []
    status: str = "pending" # pending, approved, ongoing, completed
    road_status: str = "clear"
    population_size: str = "medium"
    is_public: bool = True
    created_at: Optional[datetime] = None
    priority_level: str = "Standard"


class UpdateStatus(BaseModel):
    status: str

# ── Inventory Models ────────────────────────────────────────────────────────

class InventoryItem(BaseModel):
    item_name: str
    category: str
    quantity: int
    prolog_item_key: Optional[str] = None
    location: str

class InventoryItemResponse(InventoryItem):
    model_config = ConfigDict(populate_by_name=True)
    id: str = Field(alias="_id")

# ── Public Board Models ─────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    request_id: str
    notes: Optional[str] = None

class PublicStats(BaseModel):
    total_requests: int
    active_relief_zones: int
    total_donors: int
    items_distributed: int
