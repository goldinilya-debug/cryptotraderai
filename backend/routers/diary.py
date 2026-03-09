from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from uuid import uuid4

from database import get_db, Database
from routers.auth import get_current_user

router = APIRouter(prefix="/diary", tags=["Trading Diary"])

# Pydantic Models
class DiaryEntryCreate(BaseModel):
    entry_date: date = Field(default_factory=date.today)
    symbol: str
    direction: str = Field(..., pattern="^(LONG|SHORT)$")
    entry_price: float = Field(..., gt=0)
    exit_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    position_size: Optional[float] = None
    pnl: Optional[float] = None
    pnl_percent: Optional[float] = None
    status: str = Field(default="OPEN", pattern="^(OPEN|CLOSED|CANCELLED)$")
    strategy: Optional[str] = None
    timeframe: Optional[str] = None
    setup_notes: Optional[str] = None
    emotions: Optional[str] = None
    mistakes: Optional[str] = None
    lessons: Optional[str] = None
    screenshot_url: Optional[str] = None
    tags: Optional[str] = None  # JSON string array

class DiaryEntryUpdate(BaseModel):
    exit_price: Optional[float] = None
    pnl: Optional[float] = None
    pnl_percent: Optional[float] = None
    status: Optional[str] = Field(None, pattern="^(OPEN|CLOSED|CANCELLED)$")
    setup_notes: Optional[str] = None
    emotions: Optional[str] = None
    mistakes: Optional[str] = None
    lessons: Optional[str] = None
    screenshot_url: Optional[str] = None
    tags: Optional[str] = None

class DiaryEntryResponse(BaseModel):
    id: str
    entry_date: date
    symbol: str
    direction: str
    entry_price: float
    exit_price: Optional[float]
    stop_loss: Optional[float]
    take_profit: Optional[float]
    position_size: Optional[float]
    pnl: Optional[float]
    pnl_percent: Optional[float]
    status: str
    strategy: Optional[str]
    timeframe: Optional[str]
    setup_notes: Optional[str]
    emotions: Optional[str]
    mistakes: Optional[str]
    lessons: Optional[str]
    screenshot_url: Optional[str]
    tags: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DiaryStats(BaseModel):
    total_trades: int
    winning_trades: int
    losing_trades: int
    open_trades: int
    total_pnl: float
    avg_pnl_percent: Optional[float]
    win_rate: float
    profit_factor: float

class DailyJournalCreate(BaseModel):
    journal_date: date = Field(default_factory=date.today)
    mood: Optional[str] = None
    market_condition: Optional[str] = None
    daily_goals: Optional[str] = None
    day_review: Optional[str] = None
    lessons_learned: Optional[str] = None

class DailyJournalResponse(BaseModel):
    id: str
    journal_date: date
    mood: Optional[str]
    market_condition: Optional[str]
    daily_goals: Optional[str]
    day_review: Optional[str]
    lessons_learned: Optional[str]
    created_at: datetime
    updated_at: datetime

# Diary Entry Endpoints
@router.post("/entries", response_model=DiaryEntryResponse)
async def create_entry(
    entry: DiaryEntryCreate,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Create a new trading diary entry"""
    entry_data = {
        "id": str(uuid4()),
        "user_id": current_user["sub"],
        **entry.model_dump()
    }
    
    created = await db.create_diary_entry(entry_data)
    if not created:
        raise HTTPException(status_code=500, detail="Failed to create entry")
    return created

@router.get("/entries", response_model=List[DiaryEntryResponse])
async def list_entries(
    limit: int = 50,
    offset: int = 0,
    symbol: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get user's trading diary entries with filters"""
    entries = await db.get_user_diary_entries(
        user_id=current_user["sub"],
        limit=limit,
        offset=offset,
        symbol=symbol,
        status=status,
        start_date=start_date.isoformat() if start_date else None,
        end_date=end_date.isoformat() if end_date else None
    )
    return entries

@router.get("/entries/{entry_id}", response_model=DiaryEntryResponse)
async def get_entry(
    entry_id: str,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get a specific diary entry"""
    entry = await db.get_diary_entry(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    if entry["user_id"] != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return entry

@router.patch("/entries/{entry_id}", response_model=DiaryEntryResponse)
async def update_entry(
    entry_id: str,
    updates: DiaryEntryUpdate,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Update a diary entry"""
    # Check ownership
    entry = await db.get_diary_entry(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    if entry["user_id"] != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    updated = await db.update_diary_entry(entry_id, updates.model_dump(exclude_unset=True))
    return updated

@router.delete("/entries/{entry_id}")
async def delete_entry(
    entry_id: str,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Delete a diary entry"""
    # Check ownership
    entry = await db.get_diary_entry(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    if entry["user_id"] != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.delete_diary_entry(entry_id)
    return {"success": True, "message": "Entry deleted"}

@router.get("/stats", response_model=DiaryStats)
async def get_stats(
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get trading statistics from diary"""
    stats = await db.get_diary_stats(current_user["sub"])
    return stats

# Daily Journal Endpoints
@router.post("/journal", response_model=DailyJournalResponse)
async def create_or_update_journal(
    journal: DailyJournalCreate,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Create or update daily journal"""
    journal_data = {
        "id": str(uuid4()),
        "user_id": current_user["sub"],
        **journal.model_dump()
    }
    
    created = await db.create_or_update_daily_journal(journal_data)
    return created

@router.get("/journal/{journal_date}", response_model=DailyJournalResponse)
async def get_journal(
    journal_date: date,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get daily journal for specific date"""
    journal = await db.get_daily_journal(current_user["sub"], journal_date.isoformat())
    if not journal:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return journal
