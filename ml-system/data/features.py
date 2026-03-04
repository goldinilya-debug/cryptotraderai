"""
Feature Engineering Module
Создание признаков для ML модели
"""
import pandas as pd
import numpy as np
from typing import List, Dict, Optional

class FeatureEngineer:
    """Создание признаков из OHLCV данных"""
    
    def __init__(self, window_sizes: List[int] = [10, 20, 50]):
        self.window_sizes = window_sizes
    
    def add_returns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Добавление доходностей"""
        df = df.copy()
        df['returns'] = df['close'].pct_change()
        df['log_returns'] = np.log(df['close'] / df['close'].shift(1))
        
        for window in self.window_sizes:
            df[f'returns_{window}'] = df['close'].pct_change(window)
            
        return df
    
    def add_moving_averages(self, df: pd.DataFrame) -> pd.DataFrame:
        """Скользящие средние"""
        df = df.copy()
        
        for window in self.window_sizes:
            df[f'sma_{window}'] = df['close'].rolling(window=window).mean()
            df[f'ema_{window}'] = df['close'].ewm(span=window, adjust=False).mean()
            
        # Отношение цены к MA
        for window in self.window_sizes:
            df[f'close_to_sma_{window}'] = df['close'] / df[f'sma_{window}']
            
        return df
    
    def add_rsi(self, df: pd.DataFrame, period: int = 14) -> pd.DataFrame:
        """RSI индикатор"""
        df = df.copy()
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        return df
    
    def add_macd(self, df: pd.DataFrame, fast: int = 12, slow: int = 26, signal: int = 9) -> pd.DataFrame:
        """MACD индикатор"""
        df = df.copy()
        ema_fast = df['close'].ewm(span=fast, adjust=False).mean()
        ema_slow = df['close'].ewm(span=slow, adjust=False).mean()
        df['macd'] = ema_fast - ema_slow
        df['macd_signal'] = df['macd'].ewm(span=signal, adjust=False).mean()
        df['macd_histogram'] = df['macd'] - df['macd_signal']
        return df
    
    def add_atr(self, df: pd.DataFrame, period: int = 14) -> pd.DataFrame:
        """Average True Range (волатильность)"""
        df = df.copy()
        high_low = df['high'] - df['low']
        high_close = np.abs(df['high'] - df['close'].shift())
        low_close = np.abs(df['low'] - df['close'].shift())
        ranges = pd.concat([high_low, high_close, low_close], axis=1)
        true_range = np.max(ranges, axis=1)
        df['atr'] = true_range.rolling(period).mean()
        df['atr_pct'] = df['atr'] / df['close']  # ATR как % от цены
        return df
    
    def add_bollinger(self, df: pd.DataFrame, period: int = 20, std_dev: float = 2.0) -> pd.DataFrame:
        """Полосы Боллинджера"""
        df = df.copy()
        df['bb_middle'] = df['close'].rolling(window=period).mean()
        bb_std = df['close'].rolling(window=period).std()
        df['bb_upper'] = df['bb_middle'] + (bb_std * std_dev)
        df['bb_lower'] = df['bb_middle'] - (bb_std * std_dev)
        df['bb_width'] = (df['bb_upper'] - df['bb_lower']) / df['bb_middle']
        df['bb_position'] = (df['close'] - df['bb_lower']) / (df['bb_upper'] - df['bb_lower'])
        return df
    
    def add_volume_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Признаки объёма"""
        df = df.copy()
        
        for window in self.window_sizes:
            df[f'volume_sma_{window}'] = df['volume'].rolling(window=window).mean()
            df[f'volume_ratio_{window}'] = df['volume'] / df[f'volume_sma_{window}']
            
        # OBV (On Balance Volume)
        df['obv'] = (np.sign(df['close'].diff()) * df['volume']).cumsum()
        
        return df
    
    def add_vwap(self, df: pd.DataFrame) -> pd.DataFrame:
        """Volume Weighted Average Price"""
        df = df.copy()
        typical_price = (df['high'] + df['low'] + df['close']) / 3
        df['vwap'] = (typical_price * df['volume']).cumsum() / df['volume'].cumsum()
        df['vwap_distance'] = (df['close'] - df['vwap']) / df['vwap']
        return df
    
    def add_price_action(self, df: pd.DataFrame) -> pd.DataFrame:
        """Признаки ценового действия"""
        df = df.copy()
        
        # Свечные паттерны
        df['body_size'] = abs(df['close'] - df['open'])
        df['upper_shadow'] = df['high'] - df[['open', 'close']].max(axis=1)
        df['lower_shadow'] = df[['open', 'close']].min(axis=1) - df['low']
        df['body_to_range'] = df['body_size'] / (df['high'] - df['low'])
        
        # Направление свечи
        df['direction'] = np.where(df['close'] > df['open'], 1, -1)
        
        return df
    
    def create_sliding_window(self, df: pd.DataFrame, window_size: int = 50) -> np.ndarray:
        """Создание скользящих окон для ML"""
        features = df.select_dtypes(include=[np.number]).dropna()
        
        windows = []
        for i in range(len(features) - window_size):
            window = features.iloc[i:i+window_size].values
            windows.append(window)
            
        return np.array(windows)
    
    def create_target(self, df: pd.DataFrame, horizon: int = 5, threshold: float = 0.005) -> pd.Series:
        """
        Создание целевой переменной
        1: цена выросла > threshold
        0: цена в боковике
        -1: цена упала < -threshold
        """
        future_return = df['close'].shift(-horizon) / df['close'] - 1
        
        target = pd.Series(0, index=df.index)
        target[future_return > threshold] = 1
        target[future_return < -threshold] = -1
        
        return target
    
    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Полный pipeline подготовки признаков"""
        df = df.copy()
        
        # Базовые признаки
        df = self.add_returns(df)
        df = self.add_moving_averages(df)
        df = self.add_rsi(df)
        df = self.add_macd(df)
        df = self.add_atr(df)
        df = self.add_bollinger(df)
        df = self.add_volume_features(df)
        df = self.add_vwap(df)
        df = self.add_price_action(df)
        
        # Удаляем NaN
        df.dropna(inplace=True)
        
        return df

# Тест
if __name__ == "__main__":
    from fetcher import DataFetcher
    
    fetcher = DataFetcher()
    df = fetcher.fetch_data("BTCUSDT", "1h", 200)
    
    if df is not None:
        engineer = FeatureEngineer()
        features = engineer.prepare_features(df)
        
        print(f"✅ Features created: {len(features.columns)} columns")
        print(f"Features: {list(features.columns)}")
        print(features.tail())