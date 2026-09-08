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

# Custom CORS and Exception Handling Middleware to guarantee headers on all responses (including 500 errors and preflight OPTIONS)
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    origin = request.headers.get("origin", "*")
    
    # Handle preflight OPTIONS requests immediately
    if request.method == "OPTIONS":
        response = Response(status_code=204)
        response.headers["Access-Control-Allow-Origin"] = origin if origin else "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
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

    response.headers["Access-Control-Allow-Origin"] = origin if origin else "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# Also register standard CORSMiddleware for Starlette compatibility
origins = [
    "https://india-trend-radar-athenura.vercel.app",
    "https://india-trend-radar-frontend.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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