from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from uuid import uuid4
import hashlib
import json
import os
from jose import jwt

app = FastAPI(title="CryptoTraderAI API", version="3.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = "data.json"
SECRET_KEY = os.getenv("SECRET_KEY", "secret-key-change-in-production")
ALGORITHM = "HS256"

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
    expire = datetime.utcnow() + timedelta(days=7)
    return jwt.encode({"sub": user_id, "email": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

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

class DailyJournal(BaseModel):
    date: str
    mood: Optional[str] = None
    market_condition: Optional[str] = None
    daily_goals: Optional[str] = None
    day_review: Optional[str] = None
    lessons_learned: Optional[str] = None
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
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"email": payload["email"], "user_id": payload["sub"]}
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

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

@app.patch("/api/diary/entries/{entry_id}")
async def update_entry(entry_id: str, updates: DiaryEntry, user: dict = Depends(get_current_user)):
    data = load_data()
    entries = data["diary"].get(user["email"], [])
    for i, entry in enumerate(entries):
        if entry.get("id") == entry_id:
            entries[i] = {**entry, **updates.dict(), "id": entry_id}
            break
    save_data(data)
    return {"success": True}

@app.delete("/api/diary/entries/{entry_id}")
async def delete_entry(entry_id: str, user: dict = Depends(get_current_user)):
    data = load_data()
    entries = data["diary"].get(user["email"], [])
    data["diary"][user["email"]] = [e for e in entries if e.get("id") != entry_id]
    save_data(data)
    return {"success": True}

@app.get("/api/diary/stats")
async def get_stats(user: dict = Depends(get_current_user)):
    data = load_data()
    entries = data["diary"].get(user["email"], [])
    closed = [e for e in entries if e.get("status") == "CLOSED"]
    total = len(closed)
    
    if total == 0:
        return {
            "total_trades": 0,
            "winning_trades": 0,
            "losing_trades": 0,
            "total_pnl": 0,
            "win_rate": 0,
            "avg_win": 0,
            "avg_loss": 0,
            "profit_factor": 0,
            "expectancy": 0,
            "gain_percent": 0
        }
    
    wins = [e for e in closed if e.get("pnl", 0) > 0]
    losses = [e for e in closed if e.get("pnl", 0) < 0]
    
    total_pnl = sum(e.get("pnl", 0) for e in closed)
    win_rate = round((len(wins) / total * 100), 2)
    
    avg_win = round(sum(e.get("pnl", 0) for e in wins) / len(wins), 2) if wins else 0
    avg_loss = round(sum(e.get("pnl", 0) for e in losses) / len(losses), 2) if losses else 0
    
    gross_profit = sum(e.get("pnl", 0) for e in wins)
    gross_loss = abs(sum(e.get("pnl", 0) for e in losses))
    profit_factor = round(gross_profit / gross_loss, 2) if gross_loss > 0 else 0
    
    expectancy = round((win_rate / 100 * avg_win) + ((100 - win_rate) / 100 * avg_loss), 2)
    
    # Calculate gain % based on avg position size
    total_position = sum(e.get("position_size", 0) * e.get("entry_price", 0) for e in closed if e.get("position_size"))
    gain_percent = round((total_pnl / total_position * 100), 2) if total_position > 0 else 0
    
    return {
        "total_trades": total,
        "winning_trades": len(wins),
        "losing_trades": len(losses),
        "total_pnl": round(total_pnl, 2),
        "win_rate": win_rate,
        "avg_win": avg_win,
        "avg_loss": avg_loss,
        "profit_factor": profit_factor,
        "expectancy": expectancy,
        "gain_percent": gain_percent,
        "history": closed[-30:]  # Last 30 trades for charts
    }

@app.post("/api/diary/journal")
async def save_daily_journal(journal: DailyJournal, user: dict = Depends(get_current_user)):
    data = load_data()
    if "journal" not in data:
        data["journal"] = {}
    if user["email"] not in data["journal"]:
        data["journal"][user["email"]] = {}
    data["journal"][user["email"]][journal.date] = journal.dict()
    save_data(data)
    return {"success": True}

@app.get("/api/diary/journal/{date}")
async def get_daily_journal(date: str, user: dict = Depends(get_current_user)):
    data = load_data()
    journal = data.get("journal", {}).get(user["email"], {}).get(date)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    return journal

@app.get("/api/diary/calendar")
async def get_calendar(user: dict = Depends(get_current_user)):
    data = load_data()
    entries = data.get("diary", {}).get(user["email"], [])
    # Group by date
    calendar = {}
    for entry in entries:
        date = entry.get("entry_date")
        if date not in calendar:
            calendar[date] = {"trades": 0, "pnl": 0, "has_journal": False}
        calendar[date]["trades"] += 1
        calendar[date]["pnl"] += entry.get("pnl", 0) or 0
    
    # Add journal info
    journals = data.get("journal", {}).get(user["email"], {})
    for date in journals:
        if date not in calendar:
            calendar[date] = {"trades": 0, "pnl": 0, "has_journal": True}
        else:
            calendar[date]["has_journal"] = True
    
    return calendar

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "3.2.0", "diary": True}

@app.get("/")
async def root():
    return {"name": "CryptoTraderAI API", "version": "3.2.0", "diary": True}
