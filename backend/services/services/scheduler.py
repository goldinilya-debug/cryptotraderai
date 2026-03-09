import schedule
import time
import asyncio
from threading import Thread

from app.services.signal_generator import generate_signal
from app.services.market_data import get_current_price

# Trading pairs to monitor
WATCHLIST = [
    "BTC/USDT",
    "ETH/USDT",
    "SOL/USDT",
    "AVAX/USDT"
]

TIMEFRAMES = ["1h", "4h"]

def generate_signals_job():
    """Background job to generate signals"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    for pair in WATCHLIST:
        for timeframe in TIMEFRAMES:
            try:
                # Check if we're in a Kill Zone
                from app.services.signal_generator import get_current_kill_zone
                kill_zone = get_current_kill_zone()
                
                # Only generate during Kill Zones
                if kill_zone in ["London", "New York"]:
                    price = loop.run_until_complete(get_current_price(pair))
                    signal = loop.run_until_complete(
                        generate_signal(pair, timeframe, "binance", price)
                    )
                    
                    # TODO: Save to database
                    print(f"Generated signal: {signal['pair']} {signal['direction']} @ {signal['confidence']}%")
                    
            except Exception as e:
                print(f"Error generating signal for {pair}: {e}")
    
    loop.close()

def update_signal_status_job():
    """Update status of active signals based on current price"""
    # TODO: Check active signals against current prices
    # Update status: ACTIVE -> HIT_TP or HIT_SL
    pass

def run_scheduler():
    """Start the background scheduler"""
    # Run signal generation every hour
    schedule.every(1).hours.do(generate_signals_job)
    
    # Run status updates every 5 minutes
    schedule.every(5).minutes.do(update_signal_status_job)
    
    def run_pending():
        while True:
            schedule.run_pending()
            time.sleep(60)
    
    thread = Thread(target=run_pending, daemon=True)
    thread.start()
    
    print("Scheduler started")
