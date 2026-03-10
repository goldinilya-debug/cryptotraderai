from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import uuid4
import hashlib
import os
from supabase import create_client, Client

app = FastAPI(title="CryptoTraderAI API", version="3.5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Supabase ─────────────────────────────────────────────────────────────────

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ─── Utils ────────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
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
    result = supabase.table("users").select("id, email").eq("id", token).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = result.data[0]
    return {"email": user["email"], "user_id": user["id"]}

@app.post("/api/auth/register")
def register(req: RegisterRequest):
    email = req.email.lower().strip()
    existing = supabase.table("users").select("id").eq("email", email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")
    result = supabase.table("users").insert({
        "email": email,
        "password": hash_password(req.password),
    }).execute()
    user = result.data[0]
    return {
        "access_token": user["id"],
        "token_type": "bearer",
        "user_id": user["id"],
        "email": user["email"]
    }

@app.post("/api/auth/login")
def login(req: LoginRequest):
    email = req.email.lower().strip()
    result = supabase.table("users").select("id, email, password").eq("email", email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user = result.data[0]
    if user["password"] != hash_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "access_token": user["id"],
        "token_type": "bearer",
        "user_id": user["id"],
        "email": user["email"]
    }

@app.get("/api/auth/profile")
def profile(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["user_id"], "email": current_user["email"]}


# ─── Diary Entries ────────────────────────────────────────────────────────────

@app.post("/api/diary/entries")
def create_entry(entry: DiaryEntry, current_user: dict = Depends(get_current_user)):
    result = supabase.table("diary_entries").insert({
        "user_id": current_user["user_id"],
        **entry.dict()
    }).execute()
    return result.data[0]

@app.get("/api/diary/entries")
def list_entries(
    limit: Optional[int] = None,
    offset: Optional[int] = None,
    symbol: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = supabase.table("diary_entries").select("*").eq("user_id", current_user["user_id"]).order("created_at", desc=True)
    if symbol:
        query = query.eq("symbol", symbol.upper())
    if status:
        query = query.eq("status", status.upper())
    if offset:
        query = query.range(offset, offset + (limit or 100) - 1)
    elif limit:
        query = query.limit(limit)
    result = query.execute()
    return result.data

@app.get("/api/diary/entries/{entry_id}")
def get_entry(entry_id: str, current_user: dict = Depends(get_current_user)):
    result = supabase.table("diary_entries").select("*").eq("id", entry_id).eq("user_id", current_user["user_id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Entry not found")
    return result.data[0]

@app.patch("/api/diary/entries/{entry_id}")
def update_entry(entry_id: str, updates: DiaryEntryUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow().isoformat()
    result = supabase.table("diary_entries").update(update_data).eq("id", entry_id).eq("user_id", current_user["user_id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Entry not found")
    return result.data[0]

@app.delete("/api/diary/entries/{entry_id}")
def delete_entry(entry_id: str, current_user: dict = Depends(get_current_user)):
    result = supabase.table("diary_entries").delete().eq("id", entry_id).eq("user_id", current_user["user_id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"success": True}


# ─── Stats ────────────────────────────────────────────────────────────────────

@app.get("/api/diary/stats")
def get_stats(current_user: dict = Depends(get_current_user)):
    result = supabase.table("diary_entries").select("*").eq("user_id", current_user["user_id"]).eq("status", "CLOSED").execute()
    closed = result.data or []
    total = len(closed)
    wins = [e for e in closed if (e.get("pnl") or 0) > 0]
    losses = [e for e in closed if (e.get("pnl") or 0) < 0]
    total_pnl = sum(e.get("pnl") or 0 for e in closed)
    win_rate = round(len(wins) / total * 100, 2) if total > 0 else 0
    avg_win = round(sum(e.get("pnl") or 0 for e in wins) / len(wins), 2) if wins else 0
    avg_loss = round(sum(e.get("pnl") or 0 for e in losses) / len(losses), 2) if losses else 0
    gross_profit = sum(e.get("pnl") or 0 for e in wins)
    gross_loss = abs(sum(e.get("pnl") or 0 for e in losses))
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

@app.get("/api/diary/journal/{date}")
def get_journal(date: str, current_user: dict = Depends(get_current_user)):
    result = supabase.table("journal_entries").select("*").eq("user_id", current_user["user_id"]).eq("date", date).execute()
    if not result.data:
        return {"date": date, "mood": None, "market_notes": None, "plan": None, "review": None, "lessons": None}
    return result.data[0]

@app.post("/api/diary/journal")
def save_journal(journal: JournalEntry, current_user: dict = Depends(get_current_user)):
    existing = supabase.table("journal_entries").select("id").eq("user_id", current_user["user_id"]).eq("date", journal.date).execute()
    data = {**journal.dict(), "user_id": current_user["user_id"], "updated_at": datetime.utcnow().isoformat()}
    if existing.data:
        result = supabase.table("journal_entries").update(data).eq("id", existing.data[0]["id"]).execute()
    else:
        result = supabase.table("journal_entries").insert(data).execute()
    return result.data[0]


# ─── Calendar ─────────────────────────────────────────────────────────────────

@app.get("/api/diary/calendar")
def get_calendar(current_user: dict = Depends(get_current_user)):
    result = supabase.table("diary_entries").select("entry_date, pnl, status").eq("user_id", current_user["user_id"]).execute()
    calendar = {}
    for entry in (result.data or []):
        date = (entry.get("entry_date") or "")[:10]
        if not date:
            continue
        if date not in calendar:
            calendar[date] = {"trades": 0, "pnl": 0.0, "wins": 0, "losses": 0}
        calendar[date]["trades"] += 1
        pnl = entry.get("pnl") or 0
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
    return {"status": "healthy", "version": "3.5.0"}

@app.get("/")
def root():
    return {"name": "CryptoTraderAI API", "version": "3.5.0"}
