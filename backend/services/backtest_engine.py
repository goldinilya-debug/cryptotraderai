/**
 * Advanced Backtesting Engine - From Manus Integration
 * 
 * Features:
 * - SMC + Wyckoff + TA analysis on historical data
 * - Win rate, P&L, max drawdown, Sharpe ratio
 * - Equity curve generation
 * - Multi-timeframe analysis
 */

import { fetchOHLCV } from "../services/market_data";
import { analyzeSMC } from "./smc_analysis";
import { analyzeWyckoff } from "./wyckoff_analysis";
import { calculateTechnicalIndicators } from "./technical_analysis";

export interface BacktestConfig {
  symbol: string;
  exchange: string;
  timeframe: string;
  startDate: number;
  endDate: number;
  initialCapital: number;
  riskPerTrade: number;
  leverage: number;
  minConfidence: number;
  tpMultiplier: number;
  maxOpenTrades: number;
}

export interface BacktestTrade {
  id: number;
  symbol: string;
  direction: "long" | "short";
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  entryTime: number;
  exitTime: number;
  pnlPercent: number;
  pnlAmount: number;
  result: "win" | "loss";
  holdingPeriod: number;
  confidence: number;
  smcBias: string;
  wyckoffPhase: string;
  exitReason: "tp" | "sl" | "timeout";
}

export interface BacktestResult {
  config: BacktestConfig;
  trades: BacktestTrade[];
  totalReturn: number;
  totalReturnPercent: number;
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  averageHoldingPeriod: number;
  equityCurve: { time: number; equity: number }[];
}

export async function runBacktest(config: BacktestConfig): Promise<BacktestResult> {
  // Fetch historical data
  const ohlcv = await fetchOHLCV(
    config.symbol,
    config.timeframe,
    1000,
    config.exchange
  );

  // Filter by date range
  const filteredData = ohlcv.filter(
    (candle) => candle.timestamp >= config.startDate && candle.timestamp <= config.endDate
  );

  const trades: BacktestTrade[] = [];
  let equity = config.initialCapital;
  let maxEquity = equity;
  let maxDrawdown = 0;
  const equityCurve: { time: number; equity: number }[] = [];

  // Sliding window analysis
  const windowSize = 50;
  let openTrades: BacktestTrade[] = [];

  for (let i = windowSize; i < filteredData.length - 1; i++) {
    const currentCandle = filteredData[i];
    const nextCandle = filteredData[i + 1];

    // Update equity curve
    equityCurve.push({
      time: currentCandle.timestamp,
      equity: equity,
    });

    // Check for exits on open trades
    openTrades = openTrades.filter((trade) => {
      const exit = checkExit(trade, currentCandle, nextCandle);
      if (exit) {
        trade.exitPrice = exit.price;
        trade.exitTime = currentCandle.timestamp;
        trade.pnlPercent =
          trade.direction === "long"
            ? ((exit.price - trade.entryPrice) / trade.entryPrice) * 100 * config.leverage
            : ((trade.entryPrice - exit.price) / trade.entryPrice) * 100 * config.leverage;
        trade.pnlAmount = (trade.pnlPercent / 100) * (equity * (config.riskPerTrade / 100));
        trade.result = trade.pnlPercent > 0 ? "win" : "loss";
        trade.exitReason = exit.reason;

        equity += trade.pnlAmount;
        trades.push(trade);

        // Update max drawdown
        if (equity > maxEquity) {
          maxEquity = equity;
        }
        const drawdown = maxEquity - equity;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }

        return false; // Remove from open trades
      }
      return true;
    });

    // Check for new entry signals
    if (openTrades.length < config.maxOpenTrades) {
      const signal = await generateSignal(filteredData.slice(i - windowSize, i), config);

      if (signal && signal.confidence >= config.minConfidence) {
        const positionSize = (equity * (config.riskPerTrade / 100)) / Math.abs(signal.entryPrice - signal.stopLoss);

        const newTrade: BacktestTrade = {
          id: trades.length + openTrades.length + 1,
          symbol: config.symbol,
          direction: signal.direction,
          entryPrice: signal.entryPrice,
          exitPrice: 0,
          stopLoss: signal.stopLoss,
          takeProfit: signal.takeProfit,
          entryTime: nextCandle.timestamp,
          exitTime: 0,
          pnlPercent: 0,
          pnlAmount: 0,
          result: "loss",
          holdingPeriod: 0,
          confidence: signal.confidence,
          smcBias: signal.smcBias,
          wyckoffPhase: signal.wyckoffPhase,
          exitReason: "sl",
        };

        openTrades.push(newTrade);
      }
    }
  }

  // Close remaining open trades at last price
  const lastPrice = filteredData[filteredData.length - 1].close;
  openTrades.forEach((trade) => {
    trade.exitPrice = lastPrice;
    trade.exitTime = filteredData[filteredData.length - 1].timestamp;
    trade.pnlPercent =
      trade.direction === "long"
        ? ((lastPrice - trade.entryPrice) / trade.entryPrice) * 100 * config.leverage
        : ((trade.entryPrice - lastPrice) / trade.entryPrice) * 100 * config.leverage;
    trade.pnlAmount = (trade.pnlPercent / 100) * (config.initialCapital * (config.riskPerTrade / 100));
    trade.result = trade.pnlPercent > 0 ? "win" : "loss";
    trade.exitReason = "timeout";
    trades.push(trade);
  });

  // Calculate metrics
  const winningTrades = trades.filter((t) => t.result === "win");
  const losingTrades = trades.filter((t) => t.result === "loss");
  const totalProfit = winningTrades.reduce((sum, t) => sum + t.pnlAmount, 0);
  const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnlAmount, 0));

  return {
    config,
    trades,
    totalReturn: equity - config.initialCapital,
    totalReturnPercent: ((equity - config.initialCapital) / config.initialCapital) * 100,
    winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
    profitFactor: totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0,
    sharpeRatio: calculateSharpeRatio(trades),
    maxDrawdown,
    maxDrawdownPercent: (maxDrawdown / config.initialCapital) * 100,
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    averageWin: winningTrades.length > 0 ? totalProfit / winningTrades.length : 0,
    averageLoss: losingTrades.length > 0 ? totalLoss / losingTrades.length : 0,
    averageHoldingPeriod: trades.length > 0 ? trades.reduce((sum, t) => sum + t.holdingPeriod, 0) / trades.length : 0,
    equityCurve,
  };
}

function checkExit(
  trade: BacktestTrade,
  currentCandle: any,
  nextCandle: any
): { price: number; reason: "tp" | "sl" | "timeout" } | null {
  // Check SL
  if (trade.direction === "long") {
    if (currentCandle.low <= trade.stopLoss) {
      return { price: trade.stopLoss, reason: "sl" };
    }
    if (currentCandle.high >= trade.takeProfit) {
      return { price: trade.takeProfit, reason: "tp" };
    }
  } else {
    if (currentCandle.high >= trade.stopLoss) {
      return { price: trade.stopLoss, reason: "sl" };
    }
    if (currentCandle.low <= trade.takeProfit) {
      return { price: trade.takeProfit, reason: "tp" };
    }
  }

  // Max holding period (e.g., 100 candles)
  trade.holdingPeriod++;
  if (trade.holdingPeriod >= 100) {
    return { price: currentCandle.close, reason: "timeout" };
  }

  return null;
}

async function generateSignal(data: any[], config: BacktestConfig): Promise<any> {
  const currentCandle = data[data.length - 1];
  
  // Run analysis
  const ta = calculateTechnicalIndicators(data);
  const smc = analyzeSMC(data);
  const wyckoff = analyzeWyckoff(data);

  // Combine signals
  const longScore =
    (ta.rsi < 70 ? 1 : 0) +
    (ta.macd > 0 ? 1 : 0) +
    (smc.bias === "bullish" ? 2 : 0) +
    (wyckoff.phase === "accumulation" || wyckoff.phase === "markup" ? 2 : 0);

  const shortScore =
    (ta.rsi > 30 ? 1 : 0) +
    (ta.macd < 0 ? 1 : 0) +
    (smc.bias === "bearish" ? 2 : 0) +
    (wyckoff.phase === "distribution" || wyckoff.phase === "markdown" ? 2 : 0);

  if (longScore >= 4 && longScore > shortScore) {
    const stopLoss = currentCandle.low * 0.985;
    const takeProfit = currentCandle.close + (currentCandle.close - stopLoss) * config.tpMultiplier;

    return {
      direction: "long",
      entryPrice: currentCandle.close,
      stopLoss,
      takeProfit,
      confidence: Math.min(longScore * 15, 95),
      smcBias: smc.bias,
      wyckoffPhase: wyckoff.phase,
    };
  }

  if (shortScore >= 4 && shortScore > longScore) {
    const stopLoss = currentCandle.high * 1.015;
    const takeProfit = currentCandle.close - (stopLoss - currentCandle.close) * config.tpMultiplier;

    return {
      direction: "short",
      entryPrice: currentCandle.close,
      stopLoss,
      takeProfit,
      confidence: Math.min(shortScore * 15, 95),
      smcBias: smc.bias,
      wyckoffPhase: wyckoff.phase,
    };
  }

  return null;
}

function calculateSharpeRatio(trades: BacktestTrade[]): number {
  if (trades.length < 2) return 0;

  const returns = trades.map((t) => t.pnlPercent);
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  return stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(365) : 0;
}
