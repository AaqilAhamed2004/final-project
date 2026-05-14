from fastapi import APIRouter

router = APIRouter()

@router.post("/analyze/{id}")
async def analyze(id: str):
    return {"status": "analyzing"}
