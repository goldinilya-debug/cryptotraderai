from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import uuid4
import hashlib
import json
import os

app = FastAPI(title="CryptoTraderAI API", version="3.3.0")

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
        with open(DATA_FILE) as f:
            return json.load(f)
    return {"users": {}, "diary": {}, "journal": {}}

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

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

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1]
    data = load_data()
    for email, user in data["users"].items():
        if user["id"] == token:
            return {"email": email, "user_id": token}
    raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/api/auth/register")
def register(req: RegisterRequest):
    data = load_data()
    email = req.email.lower()
    if email in data["users"]:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid4())
    data["users"][email] = {"id": user_id, "password": hash_password(req.password)}
    save_data(data)
    return {"access_token": user_id, "token_type": "bearer", "user_id": user_id, "email": email}

@app.post("/api/auth/login")
def login(req: LoginRequest):
    data = load_data()
    email = req.email.lower()
    user = data["users"].get(email)
    if not user or user["password"] != hash_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": user["id"], "token_type": "bearer", "user_id": user["id"], "email": email}

@app.get("/api/auth/profile")
def profile(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["user_id"], "email": current_user["email"]}

@app.post("/api/diary/entries")
def create_entry(entry: DiaryEntry, current_user: dict = Depends(get_current_user)):
    data = load_data()
    entry_id = str(uuid4())
    if current_user["email"] not in data["diary"]:
        data["diary"][current_user["email"]] = []
    data["diary"][current_user["email"]].append({"id": entry_id, **entry.dict()})
    save_data(data)
    return {"id": entry_id, **entry.dict()}

@app.get("/api/diary/entries")
def list_entries(current_user: dict = Depends(get_current_user)):
    data = load_data()
    return data["diary"].get(current_user["email"], [])

@app.delete("/api/diary/entries/{entry_id}")
def delete_entry(entry_id: str, current_user: dict = Depends(get_current_user)):
    data = load_data()
    entries = data["diary"].get(current_user["email"], [])
    data["diary"][current_user["email"]] = [e for e in entries if e.get("id") != entry_id]
    save_data(data)
    return {"success": True}

@app.get("/api/diary/stats")
def get_stats(current_user: dict = Depends(get_current_user)):
    data = load_data()
    entries = data["diary"].get(current_user["email"], [])
    closed = [e for e in entries if e.get("status") == "CLOSED"]
    total = len(closed)
    wins = len([e for e in closed if e.get("pnl", 0) > 0])
    losses = len([e for e in closed if e.get("pnl", 0) < 0])
    total_pnl = sum(e.get("pnl", 0) for e in closed)
    win_rate = round((wins / total * 100), 2) if total > 0 else 0
    return {
        "total_trades": total,
        "winning_trades": wins,
        "losing_trades": losses,
        "total_pnl": round(total_pnl, 2),
        "win_rate": win_rate,
        "avg_win": 0,
        "avg_loss": 0,
        "profit_factor": 0,
        "expectancy": 0,
        "gain_percent": 0,
        "history": closed[-30:]
    }

@app.get("/health")
def health():
    return {"status": "healthy", "version": "3.3.0", "diary": True}

@app.get("/")
def root():
    return {"name": "CryptoTraderAI API", "version": "3.3.0", "diary": True}
