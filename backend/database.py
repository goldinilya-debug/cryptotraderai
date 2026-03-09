import aiosqlite
import os
from datetime import datetime
from typing import Optional, List, Dict, Any

DB_PATH = os.getenv("DB_PATH", "./cryptotraderai.db")

class Database:
    """Async SQLite database manager"""
    
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._connection: Optional[aiosqlite.Connection] = None
    
    async def connect(self):
        """Establish database connection"""
        self._connection = await aiosqlite.connect(self.db_path)
        self._connection.row_factory = aiosqlite.Row
        await self._create_tables()
        return self
    
    async def close(self):
        """Close database connection"""
        if self._connection:
            await self._connection.close()
    
    async def _create_tables(self):
        """Create necessary tables"""
        await self._connection.executescript("""
            -- Users table
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Trading diary entries
            CREATE TABLE IF NOT EXISTS diary_entries (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                entry_date DATE NOT NULL,
                symbol TEXT NOT NULL,
                direction TEXT NOT NULL,  -- LONG, SHORT
                entry_price REAL NOT NULL,
                exit_price REAL,
                stop_loss REAL,
                take_profit REAL,
                position_size REAL,
                pnl REAL,
                pnl_percent REAL,
                status TEXT DEFAULT 'OPEN',  -- OPEN, CLOSED, CANCELLED
                strategy TEXT,  -- SMC, Wyckoff, Breakout, etc.
                timeframe TEXT,  -- 1m, 5m, 15m, 1h, 4h, 1d
                setup_notes TEXT,
                emotions TEXT,  -- Fear, Greed, FOMO, Confidence, etc.
                mistakes TEXT,
                lessons TEXT,
                screenshot_url TEXT,
                tags TEXT,  -- JSON array of tags
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            
            -- Daily journal entries (not trade-specific)
            CREATE TABLE IF NOT EXISTS daily_journals (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                journal_date DATE NOT NULL,
                mood TEXT,
                market_condition TEXT,
                daily_goals TEXT,
                day_review TEXT,
                lessons_learned TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, journal_date)
            );
            
            -- User exchanges (API keys)
            CREATE TABLE IF NOT EXISTS user_exchanges (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                exchange TEXT NOT NULL,
                api_key_encrypted TEXT NOT NULL,
                api_secret_encrypted TEXT NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                balance_usdt REAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, exchange)
            );
            
            CREATE INDEX IF NOT EXISTS idx_diary_user ON diary_entries(user_id);
            CREATE INDEX IF NOT EXISTS idx_diary_date ON diary_entries(entry_date);
            CREATE INDEX IF NOT EXISTS idx_diary_symbol ON diary_entries(symbol);
        """)
        await self._connection.commit()
    
    # User operations
    async def create_user(self, user_id: str, email: str, password_hash: str) -> Dict[str, Any]:
        """Create a new user"""
        await self._connection.execute(
            """INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)""",
            (user_id, email, password_hash)
        )
        await self._connection.commit()
        return await self.get_user_by_email(email)
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        async with self._connection.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        async with self._connection.execute(
            "SELECT * FROM users WHERE id = ?", (user_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None
    
    # Diary entry operations
    async def create_diary_entry(self, entry: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new diary entry"""
        await self._connection.execute("""
            INSERT INTO diary_entries (
                id, user_id, entry_date, symbol, direction, entry_price, exit_price,
                stop_loss, take_profit, position_size, pnl, pnl_percent, status,
                strategy, timeframe, setup_notes, emotions, mistakes, lessons,
                screenshot_url, tags
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            entry['id'], entry['user_id'], entry['entry_date'], entry['symbol'],
            entry['direction'], entry['entry_price'], entry.get('exit_price'),
            entry.get('stop_loss'), entry.get('take_profit'), entry.get('position_size'),
            entry.get('pnl'), entry.get('pnl_percent'), entry.get('status', 'OPEN'),
            entry.get('strategy'), entry.get('timeframe'), entry.get('setup_notes'),
            entry.get('emotions'), entry.get('mistakes'), entry.get('lessons'),
            entry.get('screenshot_url'), entry.get('tags')
        ))
        await self._connection.commit()
        return await self.get_diary_entry(entry['id'])
    
    async def get_diary_entry(self, entry_id: str) -> Optional[Dict[str, Any]]:
        """Get a single diary entry"""
        async with self._connection.execute(
            "SELECT * FROM diary_entries WHERE id = ?", (entry_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None
    
    async def get_user_diary_entries(
        self, 
        user_id: str, 
        limit: int = 50, 
        offset: int = 0,
        symbol: Optional[str] = None,
        status: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get diary entries for a user with filters"""
        query = "SELECT * FROM diary_entries WHERE user_id = ?"
        params = [user_id]
        
        if symbol:
            query += " AND symbol = ?"
            params.append(symbol)
        if status:
            query += " AND status = ?"
            params.append(status)
        if start_date:
            query += " AND entry_date >= ?"
            params.append(start_date)
        if end_date:
            query += " AND entry_date <= ?"
            params.append(end_date)
        
        query += " ORDER BY entry_date DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        async with self._connection.execute(query, params) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]
    
    async def update_diary_entry(self, entry_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a diary entry"""
        allowed_fields = [
            'exit_price', 'pnl', 'pnl_percent', 'status', 'setup_notes',
            'emotions', 'mistakes', 'lessons', 'screenshot_url', 'tags'
        ]
        
        set_clauses = []
        params = []
        
        for field in allowed_fields:
            if field in updates:
                set_clauses.append(f"{field} = ?")
                params.append(updates[field])
        
        if not set_clauses:
            return await self.get_diary_entry(entry_id)
        
        set_clauses.append("updated_at = CURRENT_TIMESTAMP")
        params.append(entry_id)
        
        query = f"UPDATE diary_entries SET {', '.join(set_clauses)} WHERE id = ?"
        await self._connection.execute(query, params)
        await self._connection.commit()
        
        return await self.get_diary_entry(entry_id)
    
    async def delete_diary_entry(self, entry_id: str) -> bool:
        """Delete a diary entry"""
        await self._connection.execute(
            "DELETE FROM diary_entries WHERE id = ?", (entry_id,)
        )
        await self._connection.commit()
        return True
    
    async def get_diary_stats(self, user_id: str) -> Dict[str, Any]:
        """Get trading statistics for user diary"""
        async with self._connection.execute("""
            SELECT 
                COUNT(*) as total_trades,
                SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
                SUM(CASE WHEN pnl < 0 THEN 1 ELSE 0 END) as losing_trades,
                SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as open_trades,
                SUM(pnl) as total_pnl,
                AVG(pnl_percent) as avg_pnl_percent,
                SUM(CASE WHEN pnl > 0 THEN pnl ELSE 0 END) as gross_profit,
                SUM(CASE WHEN pnl < 0 THEN pnl ELSE 0 END) as gross_loss
            FROM diary_entries 
            WHERE user_id = ? AND status = 'CLOSED'
        """, (user_id,)) as cursor:
            row = await cursor.fetchone()
            stats = dict(row) if row else {}
            
            total = stats.get('total_trades', 0) or 0
            wins = stats.get('winning_trades', 0) or 0
            
            stats['win_rate'] = round((wins / total * 100), 2) if total > 0 else 0
            stats['profit_factor'] = round(
                abs(stats.get('gross_profit', 0) / stats.get('gross_loss', 1)), 2
            ) if stats.get('gross_loss', 0) != 0 else 0
            
            return stats
    
    # Daily journal operations
    async def create_or_update_daily_journal(self, journal: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update daily journal entry"""
        await self._connection.execute("""
            INSERT INTO daily_journals (id, user_id, journal_date, mood, market_condition, daily_goals, day_review, lessons_learned)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, journal_date) DO UPDATE SET
                mood = excluded.mood,
                market_condition = excluded.market_condition,
                daily_goals = excluded.daily_goals,
                day_review = excluded.day_review,
                lessons_learned = excluded.lessons_learned,
                updated_at = CURRENT_TIMESTAMP
        """, (
            journal['id'], journal['user_id'], journal['journal_date'], journal.get('mood'),
            journal.get('market_condition'), journal.get('daily_goals'), journal.get('day_review'),
            journal.get('lessons_learned')
        ))
        await self._connection.commit()
        return await self.get_daily_journal(journal['user_id'], journal['journal_date'])
    
    async def get_daily_journal(self, user_id: str, journal_date: str) -> Optional[Dict[str, Any]]:
        """Get daily journal for a specific date"""
        async with self._connection.execute(
            "SELECT * FROM daily_journals WHERE user_id = ? AND journal_date = ?",
            (user_id, journal_date)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

# Global database instance
db = Database()

async def get_db() -> Database:
    """Get database instance"""
    return db
