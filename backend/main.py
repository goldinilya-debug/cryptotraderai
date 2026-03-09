from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from uuid import uuid4
import bcrypt
from jose import jwt, JWTError
import aiosqlite
import os

app = FastAPI(title="CryptoTraderAI API", version="3.2.0")
security = HTTPBearer()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT
SECRET_KEY = os.getenv("SECRET_KEY", "secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database
DB_PATH = os.getenv("DB_PATH", "./cryptotraderai.db")

class Database:
    def __init__(self):
        self.conn = None
    
    async def connect(self):
        self.conn = await aiosqlite.connect(DB_PATH)
        self.conn.row_factory = aiosqlite.Row
        await self._create_tables()
    
    async def _create_tables(self):
        await self.conn.executescript("""
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_diary_user ON diary_entries(user_id);
        """)
        await self.conn.commit()
    
    async def close(self):
        if self.conn:
            await self.conn.close()
    
    async def create_user(self, user_id, email, password_hash):
        await self.conn.execute(
            "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
            (user_id, email, password_hash)
        )
        await self.conn.commit()
        return {"id": user_id, "email": email}
    
    async def get_user_by_email(self, email):
        async with self.conn.execute("SELECT * FROM users WHERE email = ?", (email,)) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None
    
    async def create_diary_entry(self, entry):
        await self.conn.execute("""
            INSERT INTO diary_entries (id, user_id, entry_date, symbol, direction, entry_price, 
                exit_price, stop_loss, take_profit, position_size, pnl, pnl_percent, status,
                strategy, timeframe, setup_notes, emotions, mistakes, lessons, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            entry['id'], entry['user_id'], entry['entry_date'], entry['symbol'], entry['direction'],
            entry['entry_price'], entry.get('exit_price'), entry.get('stop_loss'), entry.get('take_profit'),
            entry.get('position_size'), entry.get('pnl'), entry.get('pnl_percent'), entry.get('status', 'OPEN'),
            entry.get('strategy'), entry.get('timeframe'), entry.get('setup_notes'), entry.get('emotions'),
            entry.get('mistakes'), entry.get('lessons'), entry.get('tags')
        ))
        await self.conn.commit()
    
    async def get_user_diary_entries(self, user_id):
        async with self.conn.execute(
            "SELECT * FROM diary_entries WHERE user_id = ? ORDER BY entry_date DESC",
            (user_id,)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]
    
    async def delete_diary_entry(self, entry_id):
        await self.conn.execute("DELETE FROM diary_entries WHERE id = ?", (entry_id,))
        await self.conn.commit()
    
    async def get_diary_stats(self, user_id):
        async with self.conn.execute("""
            SELECT 
                COUNT(*) as total_trades,
                SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
                SUM(CASE WHEN pnl < 0 THEN 1 ELSE 0 END) as losing_trades,
                SUM(pnl) as total_pnl
            FROM diary_entries 
            WHERE user_id = ? AND status = 'CLOSED'
        """, (user_id,)) as cursor:
            row = await cursor.fetchone()
            stats = dict(row) if row else {}
            total = stats.get('total_trades', 0) or 0
            wins = stats.get('winning_trades', 0) or 0
            stats['win_rate'] = round((wins / total * 100), 2) if total > 0 else 0
            return stats

db = Database()

@app.on_event("startup")
async def startup():
    await db.connect()

@app.on_event("shutdown")
async def shutdown():
    await db.close()

# Auth helpers
def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain, hashed):
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_token(user_id, email):
    expire = datetime.utcnow() + timedelta(days=7)
    return jwt.encode({"sub": user_id, "email": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

# Models
class RegisterRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class DiaryEntryCreate(BaseModel):
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
    tags: Optional[str] = None

# Auth endpoints
@app.post("/api/auth/register")
async def register(req: RegisterRequest):
    if "@" not in req.email:
        raise HTTPException(status_code=400, detail="Invalid email")
    existing = await db.get_user_by_email(req.email.lower())
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid4())
    await db.create_user(user_id, req.email.lower(), hash_password(req.password))
    token = create_token(user_id, req.email.lower())
    return {"access_token": token, "token_type": "bearer", "user_id": user_id, "email": req.email.lower()}

@app.post("/api/auth/login")
async def login(req: LoginRequest):
    user = await db.get_user_by_email(req.email.lower())
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user["id"], user["email"])
    return {"access_token": token, "token_type": "bearer", "user_id": user["id"], "email": user["email"]}

@app.get("/api/auth/profile")
async def profile(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["sub"], "email": current_user["email"]}

# Diary endpoints
@app.post("/api/diary/entries")
async def create_entry(entry: DiaryEntryCreate, current_user: dict = Depends(get_current_user)):
    entry_data = {"id": str(uuid4()), "user_id": current_user["sub"], **entry.dict()}
    await db.create_diary_entry(entry_data)
    return entry_data

@app.get("/api/diary/entries")
async def list_entries(current_user: dict = Depends(get_current_user)):
    return await db.get_user_diary_entries(current_user["sub"])

@app.delete("/api/diary/entries/{entry_id}")
async def delete_entry(entry_id: str, current_user: dict = Depends(get_current_user)):
    await db.delete_diary_entry(entry_id)
    return {"success": True}

@app.get("/api/diary/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    return await db.get_diary_stats(current_user["sub"])

@app.get("/health")
async def health():
    return {"status": "healthy", "ml_model": "trained", "version": "3.2.0"}

@app.get("/")
async def root():
    return {"name": "CryptoTraderAI API", "version": "3.2.0", "diary": True, "auth": True}
