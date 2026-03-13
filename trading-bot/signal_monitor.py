#!/usr/bin/env python3
"""
CryptoTraderAI — Autonomous Signal Monitor
Watches ACTIVE signals, detects TP/SL hits, records outcomes,
triggers ML retraining. No human input required.
"""

import asyncio
import aiohttp
import ccxt.async_support as ccxt
import os
from datetime import datetime, timedelta

MAIN_API_URL = os.environ.get("MAIN_API_URL", "https://cryptotraderai.onrender.com")
ML_API_URL   = os.environ.get("ML_API_URL",   "https://cryptotraderai-ml.onrender.com")

# Max lifetime of a signal before it's considered expired
SIGNAL_MAX_AGE_HOURS = 24

class SignalMonitor:
    def __init__(self):
        self.exchange = ccxt.binance({"enableRateLimit": True})

    # ── Fetch ──────────────────────────────────────────────────────────────────

    async def get_active_signals(self, session: aiohttp.ClientSession):
        try:
            async with session.get(f"{MAIN_API_URL}/api/signals", timeout=aiohttp.ClientTimeout(total=10)) as r:
                if r.status == 200:
                    data = await r.json()
                    return data.get("signals", [])
        except Exception as e:
            print(f"❌ Could not fetch signals: {e}")
        return []

    async def get_price(self, symbol: str) -> float | None:
        """Fetch current mid price from Binance."""
        try:
            # Convert BTC/USDT → BTC/USDT (ccxt format)
            ticker = await self.exchange.fetch_ticker(symbol.replace("-", "/"))
            return ticker["last"]
        except Exception as e:
            print(f"❌ Price fetch failed for {symbol}: {e}")
            return None

    # ── Check ──────────────────────────────────────────────────────────────────

    def check_outcome(self, signal: dict, current_price: float) -> str | None:
        """
        Returns 'WIN', 'LOSS', 'EXPIRED', or None (still active).
        Handles both LONG and SHORT correctly.
        """
        direction   = (signal.get("direction") or "LONG").upper()
        entry       = float(signal.get("entry_price") or 0)
        stop_loss   = float(signal.get("stop_loss") or 0)
        take_profit = float(signal.get("take_profit") or 0)

        if not entry or not stop_loss or not take_profit:
            return None

        if direction == "LONG":
            if current_price >= take_profit:
                return "WIN"
            if current_price <= stop_loss:
                return "LOSS"
        else:  # SHORT
            if current_price <= take_profit:
                return "WIN"
            if current_price >= stop_loss:
                return "LOSS"

        # Check expiry
        created_at = signal.get("created_at") or signal.get("updated_at")
        if created_at:
            try:
                created = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                age = datetime.now(created.tzinfo) - created
                if age > timedelta(hours=SIGNAL_MAX_AGE_HOURS):
                    return "EXPIRED"
            except Exception:
                pass

        return None  # Still active

    def calc_pnl_percent(self, signal: dict, exit_price: float) -> float:
        direction = (signal.get("direction") or "LONG").upper()
        entry = float(signal.get("entry_price") or 0)
        if not entry:
            return 0.0
        if direction == "LONG":
            return round((exit_price - entry) / entry * 100, 3)
        else:
            return round((entry - exit_price) / entry * 100, 3)

    # ── Report ─────────────────────────────────────────────────────────────────

    async def record_outcome(self, session: aiohttp.ClientSession, signal: dict, outcome: str, current_price: float):
        signal_id   = signal.get("id")
        symbol      = signal.get("symbol", "?")
        pnl_percent = self.calc_pnl_percent(signal, current_price) if outcome != "EXPIRED" else 0.0

        label = {"WIN": "✅ TP HIT", "LOSS": "❌ SL HIT", "EXPIRED": "⏰ EXPIRED"}[outcome]
        print(f"{label} | {symbol} | exit={current_price} | pnl={pnl_percent:+.2f}%")

        # 1. Tell main API: close signal + store learning outcome
        try:
            payload = {
                "outcome": outcome if outcome != "EXPIRED" else "LOSS",
                "exit_price": current_price,
                "pnl_percent": pnl_percent,
            }
            async with session.post(
                f"{MAIN_API_URL}/api/signals/{signal_id}/outcome",
                json=payload,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as r:
                if r.status != 200:
                    print(f"   ⚠️  Outcome API returned {r.status}")
        except Exception as e:
            print(f"   ❌ Could not record outcome: {e}")

        # 2. Trigger ML retraining (fire-and-forget)
        try:
            async with session.post(
                f"{ML_API_URL}/train",
                timeout=aiohttp.ClientTimeout(total=15)
            ) as r:
                if r.status == 200:
                    data = await r.json()
                    samples = data.get("total_samples", "?")
                    print(f"   🧠 ML retrained on {samples} samples")
                else:
                    print(f"   ⚠️  ML train returned {r.status}")
        except Exception as e:
            print(f"   ⚠️  ML retrain skipped: {e}")

    # ── Main loop ──────────────────────────────────────────────────────────────

    async def run(self):
        print("👁️  Signal Monitor started")
        print(f"   Main API : {MAIN_API_URL}")
        print(f"   ML API   : {ML_API_URL}")
        print(f"   Max age  : {SIGNAL_MAX_AGE_HOURS}h\n")

        async with aiohttp.ClientSession() as session:
            while True:
                try:
                    signals = await self.get_active_signals(session)

                    if not signals:
                        print(f"[{datetime.utcnow().strftime('%H:%M:%S')}] No active signals to monitor")
                    else:
                        print(f"[{datetime.utcnow().strftime('%H:%M:%S')}] Monitoring {len(signals)} signal(s)...")
                        for sig in signals:
                            symbol = sig.get("symbol", "")
                            price  = await self.get_price(symbol)
                            if price is None:
                                continue

                            outcome = self.check_outcome(sig, price)
                            direction = sig.get("direction", "?")
                            tp = sig.get("take_profit", "?")
                            sl = sig.get("stop_loss", "?")
                            print(f"   {symbol} {direction} | price={price} | TP={tp} SL={sl} → {outcome or 'active'}")

                            if outcome:
                                await self.record_outcome(session, sig, outcome, price)

                            await asyncio.sleep(1)  # rate limit between symbols

                except Exception as e:
                    print(f"❌ Monitor loop error: {e}")

                print("⏳ Next check in 60s...\n")
                await asyncio.sleep(60)

    async def cleanup(self):
        await self.exchange.close()


async def main():
    monitor = SignalMonitor()
    try:
        await monitor.run()
    except KeyboardInterrupt:
        print("\n👋 Monitor shutting down...")
    finally:
        await monitor.cleanup()


if __name__ == "__main__":
    asyncio.run(main())
