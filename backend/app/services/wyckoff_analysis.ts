/**
 * Wyckoff Method Analysis
 * From Manus Integration
 */

export type WyckoffPhase =
  | "accumulation"
  | "markup"
  | "distribution"
  | "markdown"
  | "unknown";

export interface WyckoffResult {
  phase: WyckoffPhase;
  confidence: number;
  events: WyckoffEvent[];
  volumeProfile: VolumeProfile;
  springsAndUpthrusts: PriceTest[];
}

export interface WyckoffEvent {
  type: string;
  timestamp: number;
  price: number;
  description: string;
}

export interface VolumeProfile {
  averageVolume: number;
  currentVolume: number;
  volumeTrend: "increasing" | "decreasing" | "stable";
  significantClimax: boolean;
}

export interface PriceTest {
  type: "spring" | "upthrust" | "test";
  price: number;
  timestamp: number;
  success: boolean;
}

export function analyzeWyckoff(data: any[]): WyckoffResult {
  if (data.length < 30) {
    return {
      phase: "unknown",
      confidence: 0,
      events: [],
      volumeProfile: {
        averageVolume: 0,
        currentVolume: data[data.length - 1]?.volume ?? 0,
        volumeTrend: "stable",
        significantClimax: false,
      },
      springsAndUpthrusts: [],
    };
  }

  // Calculate volume profile
  const volumes = data.map((d) => d.volume);
  const averageVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
  const currentVolume = data[data.length - 1].volume;
  const recentVolumes = volumes.slice(-10);
  const previousVolumes = volumes.slice(-20, -10);

  const avgRecent = recentVolumes.reduce((sum, v) => sum + v, 0) / recentVolumes.length;
  const avgPrevious = previousVolumes.reduce((sum, v) => sum + v, 0) / previousVolumes.length;

  let volumeTrend: "increasing" | "decreasing" | "stable" = "stable";
  if (avgRecent > avgPrevious * 1.2) {
    volumeTrend = "increasing";
  } else if (avgRecent < avgPrevious * 0.8) {
    volumeTrend = "decreasing";
  }

  const significantClimax = currentVolume > averageVolume * 2;

  // Identify trading range
  const prices = data.map((d) => d.close);
  const rangeHigh = Math.max(...prices.slice(-30));
  const rangeLow = Math.min(...prices.slice(-30));
  const rangeMid = (rangeHigh + rangeLow) / 2;

  const currentPrice = data[data.length - 1].close;
  const positionInRange = (currentPrice - rangeLow) / (rangeHigh - rangeLow);

  // Find springs (false breakdowns below support)
  const springsAndUpthrusts: PriceTest[] = [];
  for (let i = 5; i < data.length - 1; i++) {
    const candle = data[i];
    const prevCandle = data[i - 1];
    const nextCandle = data[i + 1];

    // Spring: price breaks below low but closes back up
    if (
      candle.low < rangeLow * 1.02 &&
      candle.close > candle.open &&
      nextCandle.close > rangeLow
    ) {
      springsAndUpthrusts.push({
        type: "spring",
        price: candle.low,
        timestamp: candle.timestamp,
        success: nextCandle.close > candle.close,
      });
    }

    // Upthrust: price breaks above high but closes back down
    if (
      candle.high > rangeHigh * 0.98 &&
      candle.close < candle.open &&
      nextCandle.close < rangeHigh
    ) {
      springsAndUpthrusts.push({
        type: "upthrust",
        price: candle.high,
        timestamp: candle.timestamp,
        success: nextCandle.close < candle.close,
      });
    }
  }

  // Determine phase based on price action and volume
  const events: WyckoffEvent[] = [];
  let phase: WyckoffPhase = "unknown";
  let confidence = 50;

  // Count characteristics
  const hasSpring = springsAndUpthrusts.some((t) => t.type === "spring" && t.success);
  const hasUpthrust = springsAndUpthrusts.some((t) => t.type === "upthrust" && t.success);

  // Analyze recent price movement
  const recentPrices = prices.slice(-10);
  const isUptrend = recentPrices[recentPrices.length - 1] > recentPrices[0];
  const isDowntrend = recentPrices[recentPrices.length - 1] < recentPrices[0];

  // Determine phase
  if (positionInRange < 0.3) {
    // Near support
    if (hasSpring && volumeTrend === "increasing") {
      phase = "accumulation";
      confidence = 75;
      events.push({
        type: "Spring",
        timestamp: data[data.length - 1].timestamp,
        price: currentPrice,
        description: "Price tested support with absorption",
      });
    } else if (isDowntrend) {
      phase = "markdown";
      confidence = 60;
    } else {
      phase = "accumulation";
      confidence = 55;
    }
  } else if (positionInRange > 0.7) {
    // Near resistance
    if (hasUpthrust && volumeTrend === "increasing") {
      phase = "distribution";
      confidence = 75;
      events.push({
        type: "Upthrust",
        timestamp: data[data.length - 1].timestamp,
        price: currentPrice,
        description: "Price tested resistance with distribution",
      });
    } else if (isUptrend) {
      phase = "markup";
      confidence = 60;
    } else {
      phase = "distribution";
      confidence = 55;
    }
  } else {
    // Middle of range
    if (isUptrend && volumeTrend === "increasing") {
      phase = "markup";
      confidence = 65;
    } else if (isDowntrend && volumeTrend === "increasing") {
      phase = "markdown";
      confidence = 65;
    } else {
      phase = "accumulation";
      confidence = 45;
    }
  }

  // Volume confirmation
  if (significantClimax) {
    events.push({
      type: "Climax Volume",
      timestamp: data[data.length - 1].timestamp,
      price: currentPrice,
      description: "High volume indicates potential turning point",
    });
    confidence += 10;
  }

  return {
    phase,
    confidence: Math.min(confidence, 95),
    events,
    volumeProfile: {
      averageVolume,
      currentVolume,
      volumeTrend,
      significantClimax,
    },
    springsAndUpthrusts: springsAndUpthrusts.slice(-3),
  };
}
