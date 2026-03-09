from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import uuid4
import hashlib
import json
import os

app = FastAPI(title="CryptoTraderAI API", version="3.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = "data.json"

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {"users": {}, "diary": {}}

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(user_id, email):
    return hashlib.sha256(f"{user_id}:{email}:secret".encode()).hexdigest()

class RegisterRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class DiaryEntry(BaseModel):
    entry_date: str
    symbol: str
    direction: str
    entry_price: float
    exit_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    position_size: Optional[float] = None
    pnl: Optional[float] = None
    pnl_percent: Optional[float] = None
    status: str = "OPEN"
    strategy: Optional[str] = None
    timeframe: Optional[str] = None
    setup_notes: Optional[str] = None
    emotions: Optional[str] = None
    mistakes: Optional[str] = None
    lessons: Optional[str] = None

@app.post("/api/auth/register")
async def register(req: RegisterRequest):
    data = load_data()
    email = req.email.lower()
    if email in data["users"]:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid4())
    data["users"][email] = {"id": user_id, "password": hash_password(req.password)}
    save_data(data)
    token = create_token(user_id, email)
    return {"access_token": token, "token_type": "bearer", "user_id": user_id, "email": email}

@app.post("/api/auth/login")
async def login(req: LoginRequest):
    data = load_data()
    email = req.email.lower()
    if email not in data["users"] or data["users"][email]["password"] != hash_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user_id = data["users"][email]["id"]
    token = create_token(user_id, email)
    return {"access_token": token, "token_type": "bearer", "user_id": user_id, "email": email}

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    # Simple token validation - in production use proper JWT
    return {"email": "user"}

@app.post("/api/diary/entries")
async def create_entry(entry: DiaryEntry, user: dict = Depends(get_current_user)):
    data = load_data()
    entry_id = str(uuid4())
    if user["email"] not in data["diary"]:
        data["diary"][user["email"]] = []
    data["diary"][user["email"]].append({"id": entry_id, **entry.dict()})
    save_data(data)
    return {"id": entry_id, **entry.dict()}

@app.get("/api/diary/entries")
async def list_entries(user: dict = Depends(get_current_user)):
    data = load_data()
    return data["diary"].get(user["email"], [])

@app.get("/api/diary/stats")
async def get_stats(user: dict = Depends(get_current_user)):
    return {"total_trades": 0, "winning_trades": 0, "losing_trades": 0, "total_pnl": 0, "win_rate": 0}

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "3.2.0", "diary": True}

@app.get("/")
async def root():
    return {"name": "CryptoTraderAI API", "version": "3.2.0", "diary": True}
