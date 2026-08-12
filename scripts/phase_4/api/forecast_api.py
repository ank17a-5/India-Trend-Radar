from fastapi import APIRouter
from .services import get_forecast

router = APIRouter()


@router.get("/trends/forecast/{topic}")
def forecast(topic: str):
    return get_forecast(topic)