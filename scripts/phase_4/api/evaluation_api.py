from fastapi import APIRouter, Query
from .services import get_model_evaluation

router = APIRouter()

@router.get("/evaluation")
def evaluation(
    date_range: str = Query("30d", description="Date range filter e.g. 7d, 15d, 30d")
):
    
    return get_model_evaluation(date_range=date_range)