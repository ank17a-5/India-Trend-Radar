from fastapi import FastAPI 
from scripts.phase_4.api.routes import router

app = FastAPI(
    title="India Trend Radar API",
    description="Backend API for India Trend Radar Project",
    version="1.0.0"
) 

app.include_router(router)

@app.get("/")
def home():
    return {
        "message": "Welcome to the India Trend Radar API",
        "status": "running"
    }

@app.get("/health")
def health(): 
    return {"status": "healthy"}