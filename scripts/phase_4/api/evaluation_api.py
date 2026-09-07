from fastapi import APIRouter
from .services import get_model_evaluation

router = APIRouter()


@router.get("/evaluation")
def evaluation():
    return get_model_evaluation()