import os
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Encryption for API keys
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    # Generate a key for development (in production, use environment variable)
    ENCRYPTION_KEY = Fernet.generate_key().decode()

fernet = Fernet(ENCRYPTION_KEY.encode())

class AuthService:
    """Authentication and user management service"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None

class EncryptionService:
    """Service for encrypting/decrypting sensitive data like API keys"""
    
    @staticmethod
    def encrypt_api_key(api_key: str) -> str:
        """Encrypt an API key"""
        return fernet.encrypt(api_key.encode()).decode()
    
    @staticmethod
    def decrypt_api_key(encrypted_key: str) -> str:
        """Decrypt an API key"""
        return fernet.decrypt(encrypted_key.encode()).decode()
    
    @staticmethod
    def encrypt_api_secret(api_secret: str) -> str:
        """Encrypt an API secret"""
        return fernet.encrypt(api_secret.encode()).decode()
    
    @staticmethod
    def decrypt_api_secret(encrypted_secret: str) -> str:
        """Decrypt an API secret"""
        return fernet.decrypt(encrypted_secret.encode()).decode()

class UserContext:
    """Context manager for user-specific operations"""
    
    def __init__(self, user_id: str, db_session=None):
        self.user_id = user_id
        self.db_session = db_session
        self.exchange_apis = {}
    
    async def get_exchange_api(self, exchange: str):
        """Get exchange API instance for this user"""
        if exchange in self.exchange_apis:
            return self.exchange_apis[exchange]
        
        # Load encrypted credentials from database
        # Decrypt and create exchange API instance
        # This is a placeholder - actual implementation depends on your exchange SDK
        from services.exchange_factory import ExchangeFactory
        
        # Fetch and decrypt credentials
        # user_exchange = await self.db_session.fetch_one(
        #     "SELECT * FROM user_exchanges WHERE user_id = $1 AND exchange = $2",
        #     self.user_id, exchange
        # )
        # 
        # if not user_exchange:
        #     raise ValueError(f"Exchange {exchange} not connected for user {self.user_id}")
        # 
        # api_key = EncryptionService.decrypt_api_key(user_exchange['api_key_encrypted'])
        # api_secret = EncryptionService.decrypt_api_secret(user_exchange['api_secret_encrypted'])
        
        # Create API instance
        api = ExchangeFactory.create(exchange, api_key, api_secret)
        self.exchange_apis[exchange] = api
        return api
    
    async def get_balance(self, exchange: str) -> float:
        """Get user's balance for specific exchange"""
        api = await self.get_exchange_api(exchange)
        balance = await api.get_balance()
        return balance
    
    async def place_order(self, exchange: str, symbol: str, side: str, 
                         quantity: float, order_type: str = "MARKET"):
        """Place an order for this user"""
        api = await self.get_exchange_api(exchange)
        order = await api.place_order(
            symbol=symbol,
            side=side,
            quantity=quantity,
            order_type=order_type
        )
        
        # Log trade to database
        # await self.db_session.execute(
        #     """
        #     INSERT INTO user_trades (user_id, exchange, pair, direction, 
        #                            entry_price, quantity, status)
        #     VALUES ($1, $2, $3, $4, $5, $6, 'OPEN')
        #     """,
        #     self.user_id, exchange, symbol, side, 
        #     order['price'], quantity
        # )
        
        return order
