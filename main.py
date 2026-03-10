from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import uuid4
import hashlib
import json
import os

app = FastAPI(title="CryptoTraderAI API", version="3.4.0")

# ✅ ИСПРАВЛЕНО: убраны credentials=True с wildcard origin (небезопасная комбинация)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = "data.json"

# ✅ ИСПРАВЛЕНО: кэш в памяти чтобы не читать файл при каждом запросе
_cache = None

def load_data():
    global _cache
    if _cache is not None:
        return _cache
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE) as f:
            _cache = json.load(f)
    else:
        _cache = {"users": {}, "diary": {}, "journal": {}}
    return _cache

def save_data(data):
    global _cache
    _cache = data
    with open(DATA_FILE, "w") as f:
        json.dump(data, f)

def hash_password(password):
    # ✅ ИСПРАВЛЕНО: добавлена соль
    salt = "cryptotraderai_salt_v1"
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()


# ─── Модели ───────────────────────────────────────────────────────────────────

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

class DiaryEntryUpdate(BaseModel):
    entry_date: Optional[str] = None
    symbol: Optional[str] = None
    direction: Optional[str] = None
    entry_price: Optional[float] = None
    exit_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    position_size: Optional[float] = None
    pnl: Optional[float] = None
    pnl_percent: Optional[float] = None
    status: Optional[str] = None
    strategy: Optional[str] = None
    timeframe: Optional[str] = None
    setup_notes: Optional[str] = None
    emotions: Optional[str] = None
    mistakes: Optional[str] = None
    lessons: Optional[str] = None

class JournalEntry(BaseModel):
    date: str
    mood: Optional[str] = None
    market_notes: Optional[str] = None
    plan: Optional[str] = None
    review: Optional[str] = None
    lessons: Optional[str] = None


# ─── Auth ─────────────────────────────────────────────────────────────────────

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
    email = req.email.lower().strip()
    if email in data["users"]:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid4())
    data["users"][email] = {
        "id": user_id,
        "password": hash_password(req.password),
        "created_at": datetime.utcnow().isoformat()
    }
    save_data(data)
    return {"access_token": user_id, "token_type": "bearer", "user_id": user_id, "email": email}

@app.post("/api/auth/login")
def login(req: LoginRequest):
    data = load_data()
    email = req.email.lower().strip()
    user = data["users"].get(email)
    if not user or user["password"] != hash_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": user["id"], "token_type": "bearer", "user_id": user["id"], "email": email}

@app.get("/api/auth/profile")
def profile(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["user_id"], "email": current_user["email"]}


# ─── Diary Entries ────────────────────────────────────────────────────────────

@app.post("/api/diary/entries")
def create_entry(entry: DiaryEntry, current_user: dict = Depends(get_current_user)):
    data = load_data()
    entry_id = str(uuid4())
    if current_user["email"] not in data["diary"]:
        data["diary"][current_user["email"]] = []
    new_entry = {"id": entry_id, "created_at": datetime.utcnow().isoformat(), **entry.dict()}
    data["diary"][current_user["email"]].append(new_entry)
    save_data(data)
    return new_entry

@app.get("/api/diary/entries")
def list_entries(
    limit: Optional[int] = None,
    offset: Optional[int] = None,
    symbol: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    data = load_data()
    entries = data["diary"].get(current_user["email"], [])

    # ✅ ДОБАВЛЕНО: фильтрация
    if symbol:
        entries = [e for e in entries if e.get("symbol", "").upper() == symbol.upper()]
    if status:
        entries = [e for e in entries if e.get("status", "").upper() == status.upper()]

    # ✅ ДОБАВЛЕНО: пагинация
    if offset:
        entries = entries[offset:]
    if limit:
        entries = entries[:limit]

    return entries

# ✅ ДОБАВЛЕНО: получить одну запись по ID
@app.get("/api/diary/entries/{entry_id}")
def get_entry(entry_id: str, current_user: dict = Depends(get_current_user)):
    data = load_data()
    entries = data["diary"].get(current_user["email"], [])
    entry = next((e for e in entries if e.get("id") == entry_id), None)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry

# ✅ ДОБАВЛЕНО: обновить запись (PATCH)
@app.patch("/api/diary/entries/{entry_id}")
def update_entry(entry_id: str, updates: DiaryEntryUpdate, current_user: dict = Depends(get_current_user)):
    data = load_data()
    entries = data["diary"].get(current_user["email"], [])
    entry = next((e for e in entries if e.get("id") == entry_id), None)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    entry.update(update_data)
    entry["updated_at"] = datetime.utcnow().isoformat()
    save_data(data)
    return entry

@app.delete("/api/diary/entries/{entry_id}")
def delete_entry(entry_id: str, current_user: dict = Depends(get_current_user)):
    data = load_data()
    entries = data["diary"].get(current_user["email"], [])
    before = len(entries)
    data["diary"][current_user["email"]] = [e for e in entries if e.get("id") != entry_id]
    if len(data["diary"][current_user["email"]]) == before:
        raise HTTPException(status_code=404, detail="Entry not found")
    save_data(data)
    return {"success": True}


# ─── Stats ────────────────────────────────────────────────────────────────────

@app.get("/api/diary/stats")
def get_stats(current_user: dict = Depends(get_current_user)):
    data = load_data()
    entries = data["diary"].get(current_user["email"], [])
    closed = [e for e in entries if e.get("status") == "CLOSED"]
    total = len(closed)
    wins = [e for e in closed if e.get("pnl", 0) > 0]
    losses = [e for e in closed if e.get("pnl", 0) < 0]
    total_pnl = sum(e.get("pnl", 0) for e in closed)
    win_rate = round((len(wins) / total * 100), 2) if total > 0 else 0

    avg_win = round(sum(e.get("pnl", 0) for e in wins) / len(wins), 2) if wins else 0
    avg_loss = round(sum(e.get("pnl", 0) for e in losses) / len(losses), 2) if losses else 0
    gross_profit = sum(e.get("pnl", 0) for e in wins)
    gross_loss = abs(sum(e.get("pnl", 0) for e in losses))
    profit_factor = round(gross_profit / gross_loss, 2) if gross_loss > 0 else 0
    expectancy = round((win_rate / 100 * avg_win) + ((1 - win_rate / 100) * avg_loss), 2) if total > 0 else 0

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
        "gain_percent": 0,
        "history": closed[-30:]
    }


# ─── Journal ──────────────────────────────────────────────────────────────────

# ✅ ДОБАВЛЕНО: получить запись журнала по дате
@app.get("/api/diary/journal/{date}")
def get_journal(date: str, current_user: dict = Depends(get_current_user)):
    data = load_data()
    if "journal" not in data:
        data["journal"] = {}
    user_journal = data["journal"].get(current_user["email"], {})
    entry = user_journal.get(date)
    if not entry:
        return {"date": date, "mood": None, "market_notes": None, "plan": None, "review": None, "lessons": None}
    return entry

# ✅ ДОБАВЛЕНО: сохранить запись журнала
@app.post("/api/diary/journal")
def save_journal(journal: JournalEntry, current_user: dict = Depends(get_current_user)):
    data = load_data()
    if "journal" not in data:
        data["journal"] = {}
    if current_user["email"] not in data["journal"]:
        data["journal"][current_user["email"]] = {}
    data["journal"][current_user["email"]][journal.date] = {
        **journal.dict(),
        "updated_at": datetime.utcnow().isoformat()
    }
    save_data(data)
    return data["journal"][current_user["email"]][journal.date]


# ─── Calendar ─────────────────────────────────────────────────────────────────

# ✅ ДОБАВЛЕНО: календарь трейдов
@app.get("/api/diary/calendar")
def get_calendar(current_user: dict = Depends(get_current_user)):
    data = load_data()
    entries = data["diary"].get(current_user["email"], [])
    calendar = {}
    for entry in entries:
        date = entry.get("entry_date", "")[:10]
        if not date:
            continue
        if date not in calendar:
            calendar[date] = {"trades": 0, "pnl": 0.0, "wins": 0, "losses": 0}
        calendar[date]["trades"] += 1
        pnl = entry.get("pnl", 0) or 0
        calendar[date]["pnl"] = round(calendar[date]["pnl"] + pnl, 2)
        if entry.get("status") == "CLOSED":
            if pnl > 0:
                calendar[date]["wins"] += 1
            elif pnl < 0:
                calendar[date]["losses"] += 1
    return calendar


# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "healthy", "version": "3.4.0"}

@app.get("/")
def root():
    return {"name": "CryptoTraderAI API", "version": "3.4.0"}
