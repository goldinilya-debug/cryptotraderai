from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import signals, analysis, performance, killzones, ml, ml_settings, sniper

app = FastAPI(
    title="CryptoTraderAI API",
    description="AI-powered crypto trading signals API with ML + SMC Sniper",
    version="2.1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(signals.router, prefix="/api/signals", tags=["signals"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(performance.router, prefix="/api/performance", tags=["performance"])
app.include_router(killzones.router, prefix="/api/killzones", tags=["killzones"])
app.include_router(ml.router, prefix="/api/ml", tags=["ml"])
app.include_router(ml_settings.router, prefix="/api/ml/settings", tags=["ml-settings"])
app.include_router(sniper.router, prefix="/api/sniper", tags=["sniper"])

@app.get("/")
async def root():
    return {
        "name": "CryptoTraderAI API",
        "version": "2.0.0",
        "status": "running",
        "ai_provider": "groq",
        "ml_enabled": True
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
