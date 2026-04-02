from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
