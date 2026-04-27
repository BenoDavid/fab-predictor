from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.prediction import router as prediction_router

app = FastAPI(
    title="Fabric Consumption Predictor",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS for Angular; restrict in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # e.g., ["https://your-frontend-domain"] in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(prediction_router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}