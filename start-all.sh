#!/bin/bash

# Запуск всей системы CryptoTraderAI

# 1. Запускаем торгового бота
cd /root/.openclaw/workspace/cryptotraderai/trading-bot
export BINGX_API_KEY="ayJqaHx8lAxL6NIkttVhRCct2POu1ViKP2qB5aYPF9lWwnE5SmKHnPhQGOfqZn81sivkVCi7JPV9m5yVg0BTg"
export BINGX_API_SECRET="gKPx5ZvyQVcNMHYWmx6VZk1sfvSzOMsZC1blFYRkKbxYotXkKwiI7B4BfM1AVUHNsmXLSjx07Ea9oMCgjZA"
export BINGX_SANDBOX="false"
export WEBHOOK_SECRET="ctraibot2026_secure_webhook_key"
export AUTO_TRADING_ENABLED="true"
export DEFAULT_RISK_PERCENT="0.5"
export TELEGRAM_BOT_TOKEN="8452409009:AAHURrwo1Ykh_vmMJmOSylU5-Ji5OOYLFRY"
export TELEGRAM_CHAT_ID="4207488"
export PORT="8080"

# Убиваем старые процессы
pkill -f "uvicorn main:app" 2>/dev/null
pkill -f "lt --port 8080" 2>/dev/null
sleep 2

# Запускаем бота
nohup uvicorn main:app --host 0.0.0.0 --port 8080 > /tmp/trading-bot.log 2>&1 &
echo $! > /tmp/trading-bot.pid
sleep 3

# Проверяем бота
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Бот запущен на порту 8080"
    
    # Запускаем туннель
    sleep 2
    nohup lt --port 8080 --subdomain cryptotraderai-bot > /tmp/lt.log 2>&1 &
    echo $! > /tmp/lt.pid
    sleep 5
    
    # Проверяем туннель
    if curl -s https://cryptotraderai-bot.loca.lt/health > /dev/null; then
        echo "✅ Туннель активен: https://cryptotraderai-bot.loca.lt"
        
        # Отправляем уведомление в Telegram
        curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=✅ Система перезапущена\n\n🤖 Бот: Работает\n🌐 URL: https://cryptotraderai-bot.loca.lt\n💰 Режим: Реальный счет BingX" \
            -d "parse_mode=HTML" > /dev/null 2>&1
    else
        echo "⚠️ Туннель не запустился"
    fi
else
    echo "❌ Бот не запустился"
fi
