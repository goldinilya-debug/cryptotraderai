"""
Data Fetcher Module
Сбор OHLCV данных с Bybit и Binance
"""
import requests
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional, List, Dict
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataFetcher:
    """Сбор данных с бирж"""
    
    TIMEFRAMES = {
        '5m': 5,
        '15m': 15,
        '1h': 60,
        '4h': 240
    }
    
    def __init__(self):
        self.bybit_base = "https://api.bybit.com/v5"
        self.binance_base = "https://api.binance.com/api/v3"
        
    def fetch_bybit_ohlcv(self, symbol: str, interval: str, limit: int = 200) -> Optional[pd.DataFrame]:
        """Получение OHLCV с Bybit"""
        try:
            url = f"{self.bybit_base}/market/kline"
            params = {
                'category': 'linear',
                'symbol': symbol,
                'interval': self.TIMEFRAMES.get(interval, 15),
                'limit': limit
            }
            
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            if data['retCode'] != 0:
                logger.error(f"Bybit error: {data['retMsg']}")
                return None
                
            # Преобразование в DataFrame
            klines = data['result']['list']
            df = pd.DataFrame(klines, columns=[
                'timestamp', 'open', 'high', 'low', 'close', 'volume', 'turnover'
            ])
            
            # Конвертация типов
            df['timestamp'] = pd.to_datetime(df['timestamp'].astype(int), unit='ms')
            for col in ['open', 'high', 'low', 'close', 'volume']:
                df[col] = df[col].astype(float)
                
            df.set_index('timestamp', inplace=True)
            df.sort_index(inplace=True)
            
            return df
            
        except Exception as e:
            logger.error(f"Error fetching Bybit data: {e}")
            return None
    
    def fetch_binance_ohlcv(self, symbol: str, interval: str, limit: int = 200) -> Optional[pd.DataFrame]:
        """Получение OHLCV с Binance (бэкап)"""
        try:
            url = f"{self.binance_base}/klines"
            params = {
                'symbol': symbol.replace('/', ''),  # BTC/USDT -> BTCUSDT
                'interval': interval,
                'limit': limit
            }
            
            response = requests.get(url, params=params, timeout=10)
            klines = response.json()
            
            if not isinstance(klines, list):
                logger.error(f"Binance error: {klines}")
                return None
                
            df = pd.DataFrame(klines, columns=[
                'timestamp', 'open', 'high', 'low', 'close', 'volume',
                'close_time', 'quote_volume', 'trades', 'taker_buy_base',
                'taker_buy_quote', 'ignore'
            ])
            
            df['timestamp'] = pd.to_datetime(df['timestamp'].astype(int), unit='ms')
            for col in ['open', 'high', 'low', 'close', 'volume']:
                df[col] = df[col].astype(float)
                
            df.set_index('timestamp', inplace=True)
            df.sort_index(inplace=True)
            
            return df
            
        except Exception as e:
            logger.error(f"Error fetching Binance data: {e}")
            return None
    
    def fetch_data(self, symbol: str, interval: str, limit: int = 200) -> Optional[pd.DataFrame]:
        """Основной метод с failover на Binance"""
        # Пробуем Bybit
        df = self.fetch_bybit_ohlcv(symbol, interval, limit)
        if df is not None and not df.empty:
            logger.info(f"Fetched {len(df)} bars from Bybit for {symbol}")
            return df
            
        # Fallback на Binance
        logger.warning(f"Bybit failed, trying Binance for {symbol}")
        df = self.fetch_binance_ohlcv(symbol, interval, limit)
        if df is not None and not df.empty:
            logger.info(f"Fetched {len(df)} bars from Binance for {symbol}")
            return df
            
        logger.error(f"Failed to fetch data for {symbol} from both sources")
        return None
    
    def fetch_multiple(self, symbols: List[str], interval: str, limit: int = 200) -> Dict[str, pd.DataFrame]:
        """Получение данных для нескольких пар"""
        results = {}
        for symbol in symbols:
            df = self.fetch_data(symbol, interval, limit)
            if df is not None:
                results[symbol] = df
            time.sleep(0.5)  # Rate limiting
        return results

# Тест
if __name__ == "__main__":
    fetcher = DataFetcher()
    
    # Тест BTC
    df = fetcher.fetch_data("BTCUSDT", "15m", 100)
    if df is not None:
        print(f"✅ BTC data: {len(df)} bars")
        print(df.tail())
    else:
        print("❌ Failed to fetch BTC")