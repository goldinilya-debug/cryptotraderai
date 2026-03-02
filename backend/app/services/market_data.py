import os
import httpx
from typing import Dict, List, Optional
from binance.client import Client

BINANCE_API_KEY = os.getenv("BINANCE_API_KEY")
BINANCE_API_SECRET = os.getenv("BINANCE_API_SECRET")

# Initialize Binance client
binance_client = Client(BINANCE_API_KEY, BINANCE_API_SECRET) if BINANCE_API_KEY else None

async def get_current_price(pair: str, exchange: str = "binance") -> float:
    """Get current price for a trading pair"""
    try:
        if exchange.lower() == "binance" and binance_client:
            symbol = pair.replace("/", "")
            ticker = binance_client.get_symbol_ticker(symbol=symbol)
            return float(ticker["price"])
        else:
            # Fallback to public API
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://api.binance.com/api/v3/ticker/price?symbol={pair.replace('/', '')}"
                )
                data = response.json()
                return float(data["price"])
    except Exception as e:
        print(f"Error fetching price: {e}")
        return 0.0

async def get_ohlcv(
    pair: str,
    timeframe: str = "4h",
    limit: int = 100,
    exchange: str = "binance"
) -> List[Dict]:
    """Get OHLCV candlestick data"""
    try:
        symbol = pair.replace("/", "")
        interval = timeframe.lower()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.binance.com/api/v3/klines",
                params={
                    "symbol": symbol,
                    "interval": interval,
                    "limit": limit
                }
            )
            data = response.json()
            
            candles = []
            for candle in data:
                candles.append({
                    "timestamp": candle[0],
                    "open": float(candle[1]),
                    "high": float(candle[2]),
                    "low": float(candle[3]),
                    "close": float(candle[4]),
                    "volume": float(candle[5])
                })
            
            return candles
    except Exception as e:
        print(f"Error fetching OHLCV: {e}")
        return []

async def get_ticker_24h(pair: str, exchange: str = "binance") -> Dict:
    """Get 24h ticker statistics"""
    try:
        symbol = pair.replace("/", "")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.binance.com/api/v3/ticker/24hr?symbol={symbol}"
            )
            data = response.json()
            
            return {
                "price_change": float(data["priceChange"]),
                "price_change_percent": float(data["priceChangePercent"]),
                "high_24h": float(data["highPrice"]),
                "low_24h": float(data["lowPrice"]),
                "volume": float(data["volume"]),
                "quote_volume": float(data["quoteVolume"])
            }
    except Exception as e:
        print(f"Error fetching 24h ticker: {e}")
        return {}
