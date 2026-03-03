import os
import httpx
from typing import Dict, List, Optional

# CoinGecko API for broader token support
COINGECKO_API = "https://api.coingecko.com/api/v3"

# Map trading pairs to CoinGecko IDs
COINGECKO_IDS = {
    "BTC/USDT": "bitcoin",
    "ETH/USDT": "ethereum",
    "SOL/USDT": "solana",
    "AVAX/USDT": "avalanche-2",
    "1000PEPE/USDT": "pepe",
    "PEPE/USDT": "pepe",
    "HYPE/USDT": "hyperliquid",
}

# Map trading pairs to Binance symbols
BINANCE_SYMBOLS = {
    "BTC/USDT": "BTCUSDT",
    "ETH/USDT": "ETHUSDT",
    "SOL/USDT": "SOLUSDT",
    "AVAX/USDT": "AVAXUSDT",
    "1000PEPE/USDT": "1000PEPEUSDT",
}

async def get_current_price(pair: str, exchange: str = "binance") -> float:
    """Get current price for a trading pair from Binance or CoinGecko"""
    
    # Try Binance first for supported pairs
    if pair in BINANCE_SYMBOLS:
        try:
            symbol = BINANCE_SYMBOLS[pair]
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://api.binance.com/api/v3/ticker/price?symbol={symbol}",
                    timeout=10.0
                )
                if response.status_code == 200:
                    data = response.json()
                    return float(data["price"])
        except Exception as e:
            print(f"Binance price error for {pair}: {e}")
    
    # Fallback to CoinGecko
    try:
        coin_id = COINGECKO_IDS.get(pair)
        if not coin_id:
            print(f"No CoinGecko mapping for {pair}")
            return 0.0
            
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{COINGECKO_API}/simple/price",
                params={
                    "ids": coin_id,
                    "vs_currencies": "usd",
                    "include_24hr_change": "true",
                    "include_24hr_vol": "true"
                },
                timeout=10.0
            )
            if response.status_code == 200:
                data = response.json()
                return float(data[coin_id]["usd"])
    except Exception as e:
        print(f"CoinGecko price error for {pair}: {e}")
    
    return 0.0

async def get_coin_data(pair: str) -> Dict:
    """Get comprehensive coin data from CoinGecko"""
    try:
        coin_id = COINGECKO_IDS.get(pair)
        if not coin_id:
            return {}
            
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{COINGECKO_API}/coins/{coin_id}",
                params={
                    "localization": "false",
                    "tickers": "false",
                    "market_data": "true",
                    "community_data": "false",
                    "developer_data": "false"
                },
                timeout=10.0
            )
            if response.status_code == 200:
                data = response.json()
                market_data = data.get("market_data", {})
                return {
                    "current_price": market_data.get("current_price", {}).get("usd", 0),
                    "price_change_24h": market_data.get("price_change_24h", 0),
                    "price_change_percentage_24h": market_data.get("price_change_percentage_24h", 0),
                    "market_cap": market_data.get("market_cap", {}).get("usd", 0),
                    "total_volume": market_data.get("total_volume", {}).get("usd", 0),
                    "high_24h": market_data.get("high_24h", {}).get("usd", 0),
                    "low_24h": market_data.get("low_24h", {}).get("usd", 0),
                    "ath": market_data.get("ath", {}).get("usd", 0),
                    "ath_change_percentage": market_data.get("ath_change_percentage", {}).get("usd", 0),
                    "atl": market_data.get("atl", {}).get("usd", 0),
                }
    except Exception as e:
        print(f"CoinGecko data error for {pair}: {e}")
    
    return {}

async def get_ohlcv(
    pair: str,
    timeframe: str = "4h",
    limit: int = 100,
    exchange: str = "binance"
) -> List[Dict]:
    """Get OHLCV candlestick data"""
    try:
        symbol = BINANCE_SYMBOLS.get(pair, pair.replace("/", ""))
        interval_map = {"1h": "1h", "4h": "4h", "1d": "1d", "1w": "1w"}
        interval = interval_map.get(timeframe.lower(), "4h")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.binance.com/api/v3/klines",
                params={
                    "symbol": symbol,
                    "interval": interval,
                    "limit": limit
                },
                timeout=10.0
            )
            
            if response.status_code != 200:
                return []
                
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
        symbol = BINANCE_SYMBOLS.get(pair, pair.replace("/", ""))
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.binance.com/api/v3/ticker/24hr?symbol={symbol}",
                timeout=10.0
            )
            
            if response.status_code != 200:
                # Fallback to CoinGecko
                return await get_coin_data(pair)
                
            data = response.json()
            
            return {
                "price_change": float(data.get("priceChange", 0)),
                "price_change_percent": float(data.get("priceChangePercent", 0)),
                "high_24h": float(data.get("highPrice", 0)),
                "low_24h": float(data.get("lowPrice", 0)),
                "volume": float(data.get("volume", 0)),
                "quote_volume": float(data.get("quoteVolume", 0)),
                "last_price": float(data.get("lastPrice", 0)),
                "weighted_avg_price": float(data.get("weightedAvgPrice", 0))
            }
    except Exception as e:
        print(f"Error fetching 24h ticker: {e}")
        return await get_coin_data(pair)
