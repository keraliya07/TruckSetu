from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers.co2 import router as co2_router
from app.routers.distance import router as distance_router
from app.routers.forecast import router as forecast_router
from app.routers.prediction import router as prediction_router
from app.routers.return_load import router as return_load_router
from app.routers.retrain import router as retrain_router
from app.routers.routing import router as routing_router
from app.routers.scoring import router as scoring_router

app = FastAPI(
    title="STLOS ML Service",
    description="Machine Learning and optimization microservice for STLOS",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ml-service",
        "environment": settings.environment,
    }


app.include_router(scoring_router, prefix="/internal", tags=["internal"])
app.include_router(routing_router, prefix="/internal", tags=["internal"])
app.include_router(return_load_router, prefix="/internal", tags=["internal"])
app.include_router(retrain_router, prefix="/internal", tags=["internal"])
app.include_router(forecast_router, prefix="/internal", tags=["internal"])
app.include_router(prediction_router, prefix="/internal", tags=["internal"])
app.include_router(distance_router, prefix="/internal", tags=["internal"])
app.include_router(co2_router, prefix="/internal", tags=["internal"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
