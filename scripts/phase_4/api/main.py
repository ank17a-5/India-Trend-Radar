from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from scripts.phase_4.api.routes import router

app = FastAPI(
    title="India Trend Radar API",
    description="Backend API for India Trend Radar Project",
    version="1.0.0"
) 

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://india-trend-radar-athenura.vercel.app",
        "https://india-trend-radar-frontend.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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