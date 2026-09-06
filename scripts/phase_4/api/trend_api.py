from fastapi import APIRouter, Query
from .schemas import RisingTrend
from .services import get_rising_trends, get_top_niches

router = APIRouter()


@router.get(
    "/trends/rising",
    response_model=list[RisingTrend]
)
def rising(
    date_range: str = Query("7d"),
    source: str = Query("all")
):
    return get_rising_trends(date_range=date_range, source=source)


@router.get("/niches/top")
def top_niches():
    return get_top_niches()