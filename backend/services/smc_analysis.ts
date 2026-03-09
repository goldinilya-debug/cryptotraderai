/**
 * Smart Money Concepts (SMC) Analysis
 * From Manus Integration
 */

export interface SMCResult {
  bias: "bullish" | "bearish" | "neutral";
  orderBlocks: OrderBlock[];
  fairValueGaps: FairValueGap[];
  liquidityZones: LiquidityZone[];
  structure: MarketStructure;
  breaks: StructureBreak[];
  confidence: number;
}

export interface OrderBlock {
  type: "bullish" | "bearish";
  price: number;
  high: number;
  low: number;
  timestamp: number;
  strength: number;
}

export interface FairValueGap {
  type: "bullish" | "bearish";
  top: number;
  bottom: number;
  timestamp: number;
}

export interface LiquidityZone {
  type: "buy_side" | "sell_side";
  price: number;
  volume: number;
}

export interface MarketStructure {
  trend: "uptrend" | "downtrend" | "ranging";
  higherHighs: number[];
  higherLows: number[];
  lowerHighs: number[];
  lowerLows: number[];
}

export interface StructureBreak {
  type: "BOS" | "CHoCH";
  direction: "bullish" | "bearish";
  price: number;
  timestamp: number;
}

export function analyzeSMC(data: any[]): SMCResult {
  if (data.length < 20) {
    return {
      bias: "neutral",
      orderBlocks: [],
      fairValueGaps: [],
      liquidityZones: [],
      structure: {
        trend: "ranging",
        higherHighs: [],
        higherLows: [],
        lowerHighs: [],
        lowerLows: [],
      },
      breaks: [],
      confidence: 0,
    };
  }

  // Identify swing points
  const swingHighs: number[] = [];
  const swingLows: number[] = [];

  for (let i = 2; i < data.length - 2; i++) {
    // Swing high
    if (
      data[i].high > data[i - 1].high &&
      data[i].high > data[i - 2].high &&
      data[i].high > data[i + 1].high &&
      data[i].high > data[i + 2].high
    ) {
      swingHighs.push(i);
    }

    // Swing low
    if (
      data[i].low < data[i - 1].low &&
      data[i].low < data[i - 2].low &&
      data[i].low < data[i + 1].low &&
      data[i].low < data[i + 2].low
    ) {
      swingLows.push(i);
    }
  }

  // Determine market structure
  const higherHighs: number[] = [];
  const higherLows: number[] = [];
  const lowerHighs: number[] = [];
  const lowerLows: number[] = [];

  for (let i = 1; i < swingHighs.length; i++) {
    if (data[swingHighs[i]].high > data[swingHighs[i - 1]].high) {
      higherHighs.push(swingHighs[i]);
    } else {
      lowerHighs.push(swingHighs[i]);
    }
  }

  for (let i = 1; i < swingLows.length; i++) {
    if (data[swingLows[i]].low > data[swingLows[i - 1]].low) {
      higherLows.push(swingLows[i]);
    } else {
      lowerLows.push(swingLows[i]);
    }
  }

  // Determine trend
  let trend: "uptrend" | "downtrend" | "ranging" = "ranging";
  if (higherHighs.length > lowerHighs.length && higherLows.length > lowerLows.length) {
    trend = "uptrend";
  } else if (lowerHighs.length > higherHighs.length && lowerLows.length > higherLows.length) {
    trend = "downtrend";
  }

  // Find order blocks
  const orderBlocks: OrderBlock[] = [];
  for (let i = 3; i < data.length - 1; i++) {
    const candle = data[i];
    const prevCandle = data[i - 1];
    const nextCandle = data[i + 1];

    // Bullish order block (before strong bullish move)
    if (
      candle.close < candle.open &&
      nextCandle.close > nextCandle.open &&
      nextCandle.close > candle.high
    ) {
      orderBlocks.push({
        type: "bullish",
        price: candle.close,
        high: candle.high,
        low: candle.low,
        timestamp: candle.timestamp,
        strength: (nextCandle.close - nextCandle.open) / candle.open,
      });
    }

    // Bearish order block (before strong bearish move)
    if (
      candle.close > candle.open &&
      nextCandle.close < nextCandle.open &&
      nextCandle.close < candle.low
    ) {
      orderBlocks.push({
        type: "bearish",
        price: candle.close,
        high: candle.high,
        low: candle.low,
        timestamp: candle.timestamp,
        strength: (candle.close - nextCandle.close) / candle.open,
      });
    }
  }

  // Find fair value gaps
  const fairValueGaps: FairValueGap[] = [];
  for (let i = 1; i < data.length - 1; i++) {
    const candle = data[i];
    const nextCandle = data[i + 1];

    // Bullish FVG
    if (nextCandle.low > candle.high) {
      fairValueGaps.push({
        type: "bullish",
        top: nextCandle.low,
        bottom: candle.high,
        timestamp: candle.timestamp,
      });
    }

    // Bearish FVG
    if (nextCandle.high < candle.low) {
      fairValueGaps.push({
        type: "bearish",
        top: candle.low,
        bottom: nextCandle.high,
        timestamp: candle.timestamp,
      });
    }
  }

  // Find liquidity zones (recent highs/lows)
  const liquidityZones: LiquidityZone[] = [];
  const recentHighs = swingHighs.slice(-3);
  const recentLows = swingLows.slice(-3);

  recentHighs.forEach((idx) => {
    liquidityZones.push({
      type: "sell_side",
      price: data[idx].high,
      volume: data[idx].volume,
    });
  });

  recentLows.forEach((idx) => {
    liquidityZones.push({
      type: "buy_side",
      price: data[idx].low,
      volume: data[idx].volume,
    });
  });

  // Find structure breaks
  const breaks: StructureBreak[] = [];
  for (let i = 1; i < data.length; i++) {
    // Break of Structure (BOS)
    if (
      trend === "uptrend" &&
      data[i].close > data[swingHighs[swingHighs.length - 2]]?.high
    ) {
      breaks.push({
        type: "BOS",
        direction: "bullish",
        price: data[i].close,
        timestamp: data[i].timestamp,
      });
    }

    if (
      trend === "downtrend" &&
      data[i].close < data[swingLows[swingLows.length - 2]]?.low
    ) {
      breaks.push({
        type: "BOS",
        direction: "bearish",
        price: data[i].close,
        timestamp: data[i].timestamp,
      });
    }
  }

  // Calculate bias
  let bias: "bullish" | "bearish" | "neutral" = "neutral";
  let confidence = 50;

  if (trend === "uptrend" && orderBlocks.some((ob) => ob.type === "bullish")) {
    bias = "bullish";
    confidence = 70 + orderBlocks.filter((ob) => ob.type === "bullish").length * 5;
  } else if (trend === "downtrend" && orderBlocks.some((ob) => ob.type === "bearish")) {
    bias = "bearish";
    confidence = 70 + orderBlocks.filter((ob) => ob.type === "bearish").length * 5;
  }

  return {
    bias,
    orderBlocks: orderBlocks.slice(-5),
    fairValueGaps: fairValueGaps.slice(-5),
    liquidityZones,
    structure: {
      trend,
      higherHighs,
      higherLows,
      lowerHighs,
      lowerLows,
    },
    breaks,
    confidence: Math.min(confidence, 95),
  };
}
