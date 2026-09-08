import os
from fastapi import FastAPI, Request
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from scripts.phase_4.api.routes import router

app = FastAPI(
    title="India Trend Radar API",
    description="Backend API for India Trend Radar Project",
    version="1.0.0"
)

# Explicitly allowed origins for production and local development
ALLOWED_ORIGINS = [
    "https://india-trend-radar-athenura.vercel.app",
    "https://india-trend-radar-frontend.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

# Read optional FRONTEND_URL or ALLOWED_ORIGINS environment variables
frontend_url = os.getenv("FRONTEND_URL", "").strip().rstrip("/")
if frontend_url and frontend_url not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append(frontend_url)

env_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
for o in env_origins:
    cleaned = o.strip().rstrip("/")
    if cleaned and cleaned not in ALLOWED_ORIGINS:
        ALLOWED_ORIGINS.append(cleaned)

# 1. Custom HTTP Middleware to guarantee CORS headers on preflight OPTIONS and error responses
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    origin = request.headers.get("origin")
    
    # Determine allowed origin to return
    target_origin = "https://india-trend-radar-athenura.vercel.app"
    if origin:
        cleaned_origin = origin.rstrip("/")
        if cleaned_origin in ALLOWED_ORIGINS or origin.endswith(".vercel.app") or "localhost" in origin or "127.0.0.1" in origin:
            target_origin = origin

    # Handle preflight OPTIONS requests immediately
    if request.method == "OPTIONS":
        response = Response(status_code=204)
        response.headers["Access-Control-Allow-Origin"] = target_origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    try:
        response = await call_next(request)
    except Exception as exc:
        print(f"[Unhandled Server Error] {exc}")
        response = JSONResponse(
            status_code=500,
            content={"error": "Internal Server Error", "detail": str(exc)}
        )

    response.headers["Access-Control-Allow-Origin"] = target_origin
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# 2. Starlette CORSMiddleware with explicit origins (no wildcard with credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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