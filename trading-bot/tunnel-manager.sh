#!/bin/bash

# CryptoTraderAI Tunnel Manager
# Автоматический перезапуск туннеля при отключении

LOG_FILE="/tmp/tunnel-manager.log"
TUNNEL_URL_FILE="/tmp/tunnel.url"
PID_FILE="/tmp/lt.pid"
PORT="8000"
SUBDOMAIN="cryptotraderai-bot"

echo "$(date): Starting tunnel manager..." >> $LOG_FILE

# Функция проверки туннеля
check_tunnel() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat $PID_FILE)
        if ps -p $PID > /dev/null 2>&1; then
            # Проверяем доступность URL
            if curl -s --max-time 5 "https://${SUBDOMAIN}.loca.lt/health" > /dev/null 2>&1; then
                return 0  # Туннель работает
            fi
        fi
    fi
    return 1  # Туннель не работает
}

# Функция запуска туннеля
start_tunnel() {
    echo "$(date): Starting new tunnel..." >> $LOG_FILE
    
    # Убиваем старые процессы
    pkill -f "lt --port $PORT" 2>/dev/null
    sleep 2
    
    # Запускаем новый туннель
    nohup lt --port $PORT --subdomain $SUBDOMAIN > /tmp/lt.log 2>&1 &
    echo $! > $PID_FILE
    
    # Ждем запуска
    sleep 5
    
    # Проверяем и сохраняем URL
    if check_tunnel; then
        echo "https://${SUBDOMAIN}.loca.lt" > $TUNNEL_URL_FILE
        echo "$(date): Tunnel started successfully: https://${SUBDOMAIN}.loca.lt" >> $LOG_FILE
        
        # Отправляем уведомление в Telegram если настроено
        if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
            curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
                -d "chat_id=${TELEGRAM_CHAT_ID}" \
                -d "text=🔄 Туннель перезапущен\n\nНовый URL: https://${SUBDOMAIN}.loca.lt" \
                -d "parse_mode=HTML" > /dev/null 2>&1
        fi
        return 0
    else
        echo "$(date): Failed to start tunnel" >> $LOG_FILE
        return 1
    fi
}

# Основной цикл
while true; do
    if ! check_tunnel; then
        echo "$(date): Tunnel down, restarting..." >> $LOG_FILE
        start_tunnel
    fi
    
    # Проверяем каждые 30 секунд
    sleep 30
done
