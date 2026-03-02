from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CryptoTraderAI API",
    description="AI-powered crypto trading signals API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "name": "CryptoTraderAI API",
        "version": "1.0.0",
        "status": "running",
        "ai_provider": "groq"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
