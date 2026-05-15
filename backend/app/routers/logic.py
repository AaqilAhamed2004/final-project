from fastapi import APIRouter, HTTPException, Depends
from ..prolog_engine import analyze_request
from ..database import analysis_col
from ..dependencies import require_role

router = APIRouter()

@router.post("/analyze/{id}")
async def run_analysis(id: str, current_user: dict = Depends(require_role("gn_officer", "super_admin"))):
    try:
        result = analyze_request(id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prolog Analysis Error: {str(e)}")

@router.get("/analysis/{id}")
async def get_analysis_result(id: str):
    result = analysis_col.find_one({"request_id": id})
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found for this request")
    result["_id"] = str(result["_id"])
    return result
