import os
from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from scripts.phase_4.api.routes import router

app = FastAPI(
    title="India Trend Radar API",
    description="Backend API for India Trend Radar Project",
    version="1.0.0"
) 

env_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")

origins = [
    "https://india-trend-radar-athenura.vercel.app",
    "https://india-trend-radar-frontend.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
] + [o.strip() for o in env_origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
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
