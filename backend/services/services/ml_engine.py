import os
import json
import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict
import httpx

# Initialize Groq for ML-enhanced prompts (optional)
groq_api_key = os.getenv("GROQ_API_KEY")
groq_client = None
if groq_api_key:
    try:
        from groq import Groq
        groq_client = Groq(api_key=groq_api_key)
    except:
        pass

class SignalML:
    """Machine Learning system for signal optimization"""
    
    def __init__(self):
        self.signal_history = []
        self.pair_performance = defaultdict(lambda: {'wins': 0, 'losses': 0, 'total': 0})
        self.wyckoff_performance = defaultdict(lambda: {'wins': 0, 'losses': 0})
        self.killzone_performance = defaultdict(lambda: {'wins': 0, 'losses': 0})
        self.confidence_accuracy = {}
        
        # ML Settings
        self.min_confidence_threshold = 70
        self.min_risk_reward = 1.5
        self.max_daily_signals = 10
        self.auto_adjust = True
        self.learning_rate = 0.1
        self.learning_enabled = True
        self.weight_recent = 0.7
        self.volatility_adjust = True
        self.trend_filter = True
        
    def record_signal(self, signal: Dict) -> str:
        """Record new signal for tracking"""
        signal_id = f"sig_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{signal['pair'].replace('/', '')}"
        
        record = {
            'id': signal_id,
            'pair': signal['pair'],
            'direction': signal['direction'],
            'entry': signal['entry'],
            'stop_loss': signal['stop_loss'],
            'take_profit_1': signal['take_profit_1'],
            'take_profit_2': signal.get('take_profit_2'),
            'confidence': signal['confidence'],
            'wyckoff_phase': signal.get('wyckoff_phase', 'unknown'),
            'kill_zone': signal.get('kill_zone', 'unknown'),
            'timeframe': signal['timeframe'],
            'timestamp': datetime.utcnow().isoformat(),
            'result': None,  # 'WIN', 'LOSS', 'PENDING'
            'exit_price': None,
            'pnl_percent': None,
            'market_conditions': {}
        }
        
        self.signal_history.append(record)
        return signal_id
    
    def update_result(self, signal_id: str, result: str, exit_price: float = None, pnl: float = None):
        """Update signal with actual result"""
        for signal in self.signal_history:
            if signal['id'] == signal_id:
                signal['result'] = result
                signal['exit_price'] = exit_price
                signal['pnl_percent'] = pnl
                
                # Update performance metrics
                pair = signal['pair']
                wyckoff = signal['wyckoff_phase']
                kz = signal['kill_zone']
                
                self.pair_performance[pair]['total'] += 1
                self.wyckoff_performance[wyckoff]['total'] = \
                    self.wyckoff_performance[wyckoff].get('total', 0) + 1
                self.killzone_performance[kz]['total'] = \
                    self.killzone_performance[kz].get('total', 0) + 1
                
                if result == 'WIN':
                    self.pair_performance[pair]['wins'] += 1
                    self.wyckoff_performance[wyckoff]['wins'] += 1
                    self.killzone_performance[kz]['wins'] += 1
                else:
                    self.pair_performance[pair]['losses'] += 1
                    self.wyckoff_performance[wyckoff]['losses'] += 1
                    self.killzone_performance[kz]['losses'] += 1
                
                break
    
    def get_win_rate(self, pair: str = None, wyckoff: str = None, killzone: str = None) -> float:
        """Calculate win rate for given filters"""
        if pair and pair in self.pair_performance:
            p = self.pair_performance[pair]
            if p['total'] > 0:
                return (p['wins'] / p['total']) * 100
        
        # Overall win rate
        total_wins = sum(p['wins'] for p in self.pair_performance.values())
        total_signals = sum(p['total'] for p in self.pair_performance.values())
        
        if total_signals > 0:
            return (total_wins / total_signals) * 100
        return 50.0  # Default
    
    def get_best_performing_pairs(self, min_signals: int = 5) -> List[Tuple[str, float]]:
        """Get pairs with best win rates"""
        results = []
        for pair, stats in self.pair_performance.items():
            if stats['total'] >= min_signals:
                wr = (stats['wins'] / stats['total']) * 100
                results.append((pair, wr))
        return sorted(results, key=lambda x: x[1], reverse=True)
    
    def get_optimal_confidence_threshold(self) -> int:
        """Find confidence threshold with best performance"""
        confidence_buckets = defaultdict(lambda: {'wins': 0, 'total': 0})
        
        for signal in self.signal_history:
            if signal['result']:
                bucket = (signal['confidence'] // 10) * 10  # 70, 80, 90, etc
                confidence_buckets[bucket]['total'] += 1
                if signal['result'] == 'WIN':
                    confidence_buckets[bucket]['wins'] += 1
        
        best_threshold = 70
        best_wr = 0
        
        for bucket, stats in confidence_buckets.items():
            if stats['total'] >= 3:  # Min sample size
                wr = stats['wins'] / stats['total']
                if wr > best_wr:
                    best_wr = wr
                    best_threshold = bucket
        
        return best_threshold
    
    def enhance_prompt_with_ml(self, base_prompt: str, pair: str, wyckoff: str, killzone: str) -> str:
        """Enhance AI prompt with ML insights"""
        
        # Get performance data
        pair_wr = self.get_win_rate(pair=pair)
        wyckoff_wr = 50
        kz_wr = 50
        
        if wyckoff in self.wyckoff_performance:
            w = self.wyckoff_performance[wyckoff]
            if w.get('total', 0) > 0:
                wyckoff_wr = (w['wins'] / w['total']) * 100
        
        if killzone in self.killzone_performance:
            k = self.killzone_performance[killzone]
            if k.get('total', 0) > 0:
                kz_wr = (k['wins'] / k['total']) * 100
        
        # Build ML insights
        ml_insights = f"""
ML PERFORMANCE DATA:
- {pair} historical win rate: {pair_wr:.1f}%
- Wyckoff phase '{wyckoff}' win rate: {wyckoff_wr:.1f}%
- Kill Zone '{killzone}' win rate: {kz_wr:.1f}%
- Recommended confidence threshold: {self.get_optimal_confidence_threshold()}%

"""
        
        # Add best performing pairs hint
        best_pairs = self.get_best_performing_pairs(min_signals=3)
        if best_pairs:
            ml_insights += "- Best performing pairs: " + ", ".join([f"{p[0]} ({p[1]:.0f}%)" for p in best_pairs[:3]]) + "\n"
        
        # Combine with base prompt
        enhanced = ml_insights + "\n" + base_prompt
        
        return enhanced
    
    async def generate_ml_enhanced_signal(self, pair: str, timeframe: str, exchange: str) -> Dict:
        """Generate signal with ML enhancements"""
        
        # Get current market data (simplified)
        current_price = await self._get_price(pair, exchange)
        
        # Build ML-enhanced prompt
        base_prompt = self._build_base_prompt(pair, timeframe, current_price)
        enhanced_prompt = self.enhance_prompt_with_ml(base_prompt, pair, "unknown", "unknown")
        
        try:
            if not groq_client:
                raise Exception("Groq client not initialized")
            
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are an expert crypto trading analyst with ML-enhanced insights."},
                    {"role": "user", "content": enhanced_prompt}
                ],
                temperature=0.2,
                max_tokens=1000,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            signal_data = json.loads(content)
            
            # Add ML metadata
            signal_data['ml_enhanced'] = True
            signal_data['ml_win_rate'] = self.get_win_rate(pair=pair)
            signal_data['ml_recommended'] = self.get_win_rate(pair=pair) > 55
            
            return signal_data
            
        except Exception as e:
            print(f"ML generation error: {e}")
            return None
    
    def _build_base_prompt(self, pair: str, timeframe: str, price: float) -> str:
        """Build base prompt for signal generation"""
        return f"""Generate trading signal for {pair} on {timeframe} timeframe.
Current price: ${price}

Consider ML performance data above.

Output JSON with:
- direction (LONG/SHORT)
- entry, stop_loss, take_profit_1, take_profit_2
- confidence (0-100)
- wyckoff_phase
- analysis explanation
"""
    
    async def _get_price(self, pair: str, exchange: str) -> float:
        """Get current price"""
        try:
            symbol = pair.replace("/", "")
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://api.binance.com/api/v3/ticker/price?symbol={symbol}"
                )
                data = response.json()
                return float(data["price"])
        except:
            return 0.0
    
    def get_stats(self) -> Dict:
        """Get ML system statistics"""
        total_signals = len(self.signal_history)
        completed_signals = [s for s in self.signal_history if s['result']]
        wins = len([s for s in completed_signals if s['result'] == 'WIN'])
        
        return {
            'total_signals': total_signals,
            'completed_signals': len(completed_signals),
            'wins': wins,
            'losses': len(completed_signals) - wins,
            'win_rate': (wins / len(completed_signals) * 100) if completed_signals else 0,
            'best_pairs': self.get_best_performing_pairs(min_signals=3),
            'optimal_confidence': self.get_optimal_confidence_threshold()
        }

# Global ML instance
signal_ml = SignalML()
