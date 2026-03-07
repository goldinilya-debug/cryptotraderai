from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routers import signals, analysis, performance, killzones, ml, ml_settings, sniper, tradingview, auth
from app.services.signal_generator_dynamic import start_signal_generation

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start background tasks on startup"""
    # Start signal generator in background
    import asyncio
    asyncio.create_task(start_signal_generation())
    print("🚀 Signal generator started")
    
    yield
    
    # Cleanup on shutdown
    print("👋 Shutting down...")

app = FastAPI(
    title="CryptoTraderAI API",
    description="AI-powered crypto trading signals API with ML + SMC Sniper + Multi-tenant + Dynamic Signals",
    version="3.1.0",
    lifespan=lifespan
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
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(signals.router, prefix="/api/signals", tags=["signals"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(performance.router, prefix="/api/performance", tags=["performance"])
app.include_router(killzones.router, prefix="/api/killzones", tags=["killzones"])
app.include_router(ml.router, prefix="/api/ml", tags=["ml"])
app.include_router(ml_settings.router, prefix="/api/ml/settings", tags=["ml-settings"])
app.include_router(sniper.router, prefix="/api/sniper", tags=["sniper"])
app.include_router(tradingview.router, prefix="", tags=["tradingview"])

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
