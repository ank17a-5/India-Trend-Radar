from fastapi import APIRouter
from .schemas import RisingTrend
from .services import get_rising_trends, get_top_niches, get_forecast

router = APIRouter()


@router.get(
    "/trends/rising",
    response_model=list[RisingTrend]
)
def rising():
    return get_rising_trends()


@router.get("/trends/forecast/{topic}")
def forecast(topic: str):
    return get_forecast(topic)


@router.get("/niches/top")
def top_niches():
    return get_top_niches()