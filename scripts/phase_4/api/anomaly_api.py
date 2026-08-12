from fastapi import APIRouter, Query
from .services import get_anomalies

router = APIRouter()


@router.get("/anomalies")
def anomalies(
    limit: int = Query(default=20, ge=1, le=100)
):
    return get_anomalies(limit)