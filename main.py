from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from uuid import uuid4
import hashlib
import os
from jose import jwt
import aiosqlite

app = FastAPI(title="CryptoTraderAI API", version="3.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.getenv("DB_PATH", "./diary.db")
SECRET_KEY = os.getenv("SECRET_KEY", "secret-key-change-in-production")
ALGORITHM = "HS256"

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS diary_entries (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                entry_date DATE NOT NULL,
                symbol TEXT NOT NULL,
                direction TEXT NOT NULL,
                entry_price REAL NOT NULL,
                exit_price REAL,
                stop_loss REAL,
                take_profit REAL,
                position_size REAL,
                pnl REAL,
                pnl_percent REAL,
                status TEXT DEFAULT 'OPEN',
                strategy TEXT,
                timeframe TEXT,
                setup_notes TEXT,
                emotions TEXT,
                mistakes TEXT,
                lessons TEXT,
                tags TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS daily_journals (
                user_id TEXT NOT NULL,
                date DATE NOT NULL,
                mood TEXT,
                market_condition TEXT,
                daily_goals TEXT,
                day_review TEXT,
                lessons_learned TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, date)
            );
            CREATE INDEX IF NOT EXISTS idx_entries_user ON diary_entries(user_id);
            CREATE INDEX IF NOT EXISTS idx_entries_date ON diary_entries(entry_date);
        """)
        await db.commit()

@app.on_event("startup")
async def startup():
    await init_db()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(user_id, email):
    expire = datetime.utcnow() + timedelta(days=7)
    return jwt.encode({"sub": user_id, "email": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"email": payload["email"], "user_id": payload["sub"]}
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

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

@app.post("/api/auth/register")
async def register(req: RegisterRequest):
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT id FROM users WHERE email = ?", (req.email.lower(),)) as cursor:
            if await cursor.fetchone():
                raise HTTPException(status_code=400, detail="Email already registered")
        user_id = str(uuid4())
        await db.execute(
            "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
            (user_id, req.email.lower(), hash_password(req.password))
        )
        await db.commit()
    token = create_token(user_id, req.email.lower())
    return {"access_token": token, "token_type": "bearer", "user_id": user_id, "email": req.email.lower()}

@app.post("/api/auth/login")
async def login(req: LoginRequest):
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT id, password_hash FROM users WHERE email = ?", (req.email.lower(),)) as cursor:
            row = await cursor.fetchone()
    if not row or row[1] != hash_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(row[0], req.email.lower())
    return {"access_token": token, "token_type": "bearer", "user_id": row[0], "email": req.email.lower()}

@app.get("/api/auth/profile")
async def profile(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["user_id"], "email": current_user["email"]}

@app.post("/api/diary/entries")
async def create_entry(entry: DiaryEntry, current_user: dict = Depends(get_current_user)):
    entry_id = str(uuid4())
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT INTO diary_entries (id, user_id, entry_date, symbol, direction, entry_price,
                exit_price, stop_loss, take_profit, position_size, pnl, pnl_percent, status,
                strategy, timeframe, setup_notes, emotions, mistakes, lessons)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (entry_id, current_user["user_id"], entry.entry_date, entry.symbol, entry.direction,
              entry.entry_price, entry.exit_price, entry.stop_loss, entry.take_profit,
              entry.position_size, entry.pnl, entry.pnl_percent, entry.status,
              entry.strategy, entry.timeframe, entry.setup_notes, entry.emotions,
              entry.mistakes, entry.lessons))
        await db.commit()
    return {"id": entry_id, **entry.dict()}

@app.get("/api/diary/entries")
async def list_entries(current_user: dict = Depends(get_current_user)):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM diary_entries WHERE user_id = ? ORDER BY entry_date DESC",
            (current_user["user_id"],)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

@app.patch("/api/diary/entries/{entry_id}")
async def update_entry(entry_id: str, updates: DiaryEntry, current_user: dict = Depends(get_current_user)):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            UPDATE diary_entries SET
                entry_date = ?, symbol = ?, direction = ?, entry_price = ?,
                exit_price = ?, stop_loss = ?, take_profit = ?, position_size = ?,
                pnl = ?, pnl_percent = ?, status = ?, strategy = ?, timeframe = ?,
                setup_notes = ?, emotions = ?, mistakes = ?, lessons = ?
            WHERE id = ? AND user_id = ?
        """, (updates.entry_date, updates.symbol, updates.direction, updates.entry_price,
              updates.exit_price, updates.stop_loss, updates.take_profit, updates.position_size,
              updates.pnl, updates.pnl_percent, updates.status, updates.strategy, updates.timeframe,
              updates.setup_notes, updates.emotions, updates.mistakes, updates.lessons,
              entry_id, current_user["user_id"]))
        await db.commit()
    return {"success": True}

@app.delete("/api/diary/entries/{entry_id}")
async def delete_entry(entry_id: str, current_user: dict = Depends(get_current_user)):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM diary_entries WHERE id = ? AND user_id = ?",
                        (entry_id, current_user["user_id"]))
        await db.commit()
    return {"success": True}

@app.get("/api/diary/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("""
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as wins,
                   SUM(CASE WHEN pnl < 0 THEN 1 ELSE 0 END) as losses,
                   SUM(pnl) as total_pnl,
                   AVG(CASE WHEN pnl > 0 THEN pnl END) as avg_win,
                   AVG(CASE WHEN pnl < 0 THEN pnl END) as avg_loss
            FROM diary_entries WHERE user_id = ? AND status = 'CLOSED'
        """, (current_user["user_id"],)) as cursor:
            row = await cursor.fetchone()
            total, wins, losses, total_pnl, avg_win, avg_loss = row
            
            total = total or 0
            wins = wins or 0
            losses = losses or 0
            total_pnl = total_pnl or 0
            avg_win = avg_win or 0
            avg_loss = avg_loss or 0
            
            win_rate = round((wins / total * 100), 2) if total > 0 else 0
            profit_factor = round(abs((avg_win * wins) / (avg_loss * losses)), 2) if losses > 0 and avg_loss != 0 else 0
            expectancy = round((win_rate/100 * avg_win) + ((100-win_rate)/100 * avg_loss), 2)
            
            # Get history
            db.row_factory = aiosqlite.Row
            async with db.execute(
                "SELECT * FROM diary_entries WHERE user_id = ? AND status = 'CLOSED' ORDER BY entry_date DESC LIMIT 30",
                (current_user["user_id"],)
            ) as cursor2:
                history = [dict(r) for r in await cursor2.fetchall()]
    
    return {
        "total_trades": total,
        "winning_trades": wins,
        "losing_trades": losses,
        "total_pnl": round(total_pnl, 2),
        "win_rate": win_rate,
        "avg_win": round(avg_win, 2),
        "avg_loss": round(avg_loss, 2),
        "profit_factor": profit_factor,
        "expectancy": expectancy,
        "gain_percent": 0,
        "history": history
    }

@app.post("/api/diary/journal")
async def save_journal(journal: DailyJournal, current_user: dict = Depends(get_current_user)):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT OR REPLACE INTO daily_journals
            (user_id, date, mood, market_condition, daily_goals, day_review, lessons_learned)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (current_user["user_id"], journal.date, journal.mood, journal.market_condition,
              journal.daily_goals, journal.day_review, journal.lessons_learned))
        await db.commit()
    return {"success": True}

@app.get("/api/diary/journal/{date}")
async def get_journal(date: str, current_user: dict = Depends(get_current_user)):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM daily_journals WHERE user_id = ? AND date = ?",
            (current_user["user_id"], date)
        ) as cursor:
            row = await cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Journal not found")
    return dict(row)

@app.get("/api/diary/calendar")
async def get_calendar(current_user: dict = Depends(get_current_user)):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        # Get trades by date
        async with db.execute(
            "SELECT entry_date, COUNT(*) as trades, SUM(pnl) as pnl FROM diary_entries WHERE user_id = ? GROUP BY entry_date",
            (current_user["user_id"],)
        ) as cursor:
            trade_rows = await cursor.fetchall()
        
        # Get journals
        async with db.execute(
            "SELECT date FROM daily_journals WHERE user_id = ?",
            (current_user["user_id"],)
        ) as cursor:
            journal_rows = await cursor.fetchall()
    
    calendar = {}
    for row in trade_rows:
        calendar[row[0]] = {"trades": row[1], "pnl": row[2] or 0, "has_journal": False}
    
    for row in journal_rows:
        date = row[0]
        if date in calendar:
            calendar[date]["has_journal"] = True
        else:
            calendar[date] = {"trades": 0, "pnl": 0, "has_journal": True}
    
    return calendar

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "3.3.0", "diary": True}

@app.get("/")
async def root():
    return {"name": "CryptoTraderAI API", "version": "3.3.0", "diary": True}
