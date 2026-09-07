from fastapi import APIRouter

from .trend_api import router as trend_router
from .forecast_api import router as forecast_router
from .anomaly_api import router as anomaly_router
from .evaluation_api import router as evaluation_router

router = APIRouter()

# Register all sub-routers
router.include_router(trend_router)
router.include_router(forecast_router)
router.include_router(anomaly_router)
router.include_router(evaluation_router)