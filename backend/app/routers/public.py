from fastapi import APIRouter

router = APIRouter()

@router.get("/board")
async def get_board():
    return []
