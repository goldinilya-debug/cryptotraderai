from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import timedelta
from uuid import uuid4

from services.auth_service import AuthService, EncryptionService
from database import get_db, Database

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

# Request/Response Models
class UserRegister(BaseModel):
    email: str
    password: str
    
    @field_validator('email')
    def validate_email(cls, v):
        if '@' not in v:
            raise ValueError('Invalid email')
        return v.lower()

class UserLogin(BaseModel):
    email: str
    password: str
    
    @field_validator('email')
    def validate_email(cls, v):
        if '@' not in v:
            raise ValueError('Invalid email')
        return v.lower()

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    email: str

class ExchangeConnect(BaseModel):
    exchange: str  # 'bingx', 'binance', 'bybit', 'okx'
    api_key: str
    api_secret: str

class ExchangeResponse(BaseModel):
    id: str
    exchange: str
    is_active: bool
    created_at: str
    balance_usdt: float

class UserProfile(BaseModel):
    id: str
    email: str
    created_at: str
    exchanges: List[ExchangeResponse]

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = AuthService.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister, db: Database = Depends(get_db)):
    """Register a new user"""
    # Check if email already exists
    existing_user = await db.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    password_hash = AuthService.hash_password(user_data.password)
    
    # Create user in database
    user_id = str(uuid4())
    user = await db.create_user(user_id, user_data.email, password_hash)
    
    # Create access token
    access_token = AuthService.create_access_token(
        data={"sub": user_id, "email": user_data.email},
        expires_delta=timedelta(days=7)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user_id,
        "email": user_data.email
    }

@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: Database = Depends(get_db)):
    """Login existing user"""
    # Fetch user from database
    user = await db.get_user_by_email(user_data.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not AuthService.verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create access token
    access_token = AuthService.create_access_token(
        data={"sub": user["id"], "email": user["email"]},
        expires_delta=timedelta(days=7)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user["id"],
        "email": user["email"]
    }

@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    """Get user profile and connected exchanges"""
    # Fetch user from database
    user = await db.get_user_by_id(current_user["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user["id"],
        "email": user["email"],
        "created_at": user["created_at"],
        "exchanges": []  # TODO: Fetch from user_exchanges table
    }

@router.post("/exchange/connect")
async def connect_exchange(
    exchange_data: ExchangeConnect,
    current_user: dict = Depends(get_current_user)
):
    """Connect an exchange to user account"""
    # Encrypt API credentials
    encrypted_key = EncryptionService.encrypt_api_key(exchange_data.api_key)
    encrypted_secret = EncryptionService.encrypt_api_secret(exchange_data.api_secret)
    
    # In production: Save to database
    # await db.execute(
    #     """
    #     INSERT INTO user_exchanges (user_id, exchange, api_key_encrypted, api_secret_encrypted)
    #     VALUES ($1, $2, $3, $4)
    #     ON CONFLICT (user_id, exchange) DO UPDATE 
    #     SET api_key_encrypted = $3, api_secret_encrypted = $4, updated_at = NOW()
    #     """,
    #     current_user["sub"], exchange_data.exchange, encrypted_key, encrypted_secret
    # )
    
    # Verify connection by testing API
    try:
        # Test the API credentials
        from services.exchange_factory import ExchangeFactory
        api = ExchangeFactory.create(
            exchange_data.exchange, 
            exchange_data.api_key, 
            exchange_data.api_secret
        )
        balance = await api.get_balance()
        
        return {
            "success": True,
            "message": f"{exchange_data.exchange} connected successfully",
            "balance_usdt": balance
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to connect: {str(e)}")

@router.get("/exchange/list")
async def list_exchanges(current_user: dict = Depends(get_current_user)):
    """List user's connected exchanges"""
    # In production: Query database
    # exchanges = await db.fetch(
    #     "SELECT id, exchange, is_active, created_at, balance_usdt FROM user_exchanges WHERE user_id = $1",
    #     current_user["sub"]
    # )
    
    # Mock response
    return {
        "exchanges": [
            {
                "id": "ex_001",
                "exchange": "bingx",
                "is_active": True,
                "created_at": "2026-03-07T00:00:00Z",
                "balance_usdt": 554.32
            }
        ]
    }

@router.delete("/exchange/{exchange_id}")
async def disconnect_exchange(
    exchange_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Disconnect an exchange"""
    # In production: Delete from database or set is_active = False
    
    return {
        "success": True,
        "message": "Exchange disconnected"
    }
