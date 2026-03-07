# Database Schema for Multi-Tenant CryptoTraderAI

## Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    telegram_id VARCHAR(50),
    notification_settings JSONB DEFAULT '{
        "signals": true,
        "trades": true,
        "daily_report": false,
        "price_alerts": true
    }'::jsonb
);

## User Exchange Connections Table
CREATE TABLE user_exchanges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exchange VARCHAR(50) NOT NULL, -- 'bingx', 'binance', 'bybit', 'okx'
    api_key_encrypted TEXT NOT NULL,
    api_secret_encrypted TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP,
    balance_usdt DECIMAL(12, 2) DEFAULT 0,
    UNIQUE(user_id, exchange)
);

## User Trades Table (isolated by user)
CREATE TABLE user_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exchange VARCHAR(50) NOT NULL,
    pair VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL, -- 'LONG', 'SHORT'
    entry_price DECIMAL(15, 8) NOT NULL,
    exit_price DECIMAL(15, 8),
    stop_loss DECIMAL(15, 8),
    take_profit_1 DECIMAL(15, 8),
    take_profit_2 DECIMAL(15, 8),
    quantity DECIMAL(15, 8) NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'CLOSED', 'CANCELLED'
    pnl_usdt DECIMAL(12, 2),
    pnl_percent DECIMAL(8, 4),
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    signal_id VARCHAR(50),
    strategy VARCHAR(100),
    metadata JSONB
);

## User Signals Table (personalized signals)
CREATE TABLE user_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pair VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    entry DECIMAL(15, 8) NOT NULL,
    stop_loss DECIMAL(15, 8),
    take_profit_1 DECIMAL(15, 8),
    take_profit_2 DECIMAL(15, 8),
    confidence INTEGER,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP,
    rejected_reason TEXT,
    user_exchange_id UUID REFERENCES user_exchanges(id)
);

## Indexes for performance
CREATE INDEX idx_user_exchanges_user_id ON user_exchanges(user_id);
CREATE INDEX idx_user_trades_user_id ON user_trades(user_id);
CREATE INDEX idx_user_trades_status ON user_trades(status);
CREATE INDEX idx_user_signals_user_id ON user_signals(user_id);
CREATE INDEX idx_user_signals_status ON user_signals(status);
