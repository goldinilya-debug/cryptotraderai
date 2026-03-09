/**
 * ML Model for Signal Prediction - From Manus Integration
 * 
 * Logistic Regression classifier trained on historical signal data
 * Features: TA, SMC, Wyckoff, Kill Zone
 */

import { signal_ml } from "./ml_engine";

export const FEATURE_NAMES = [
  "rsi",
  "macd_histogram",
  "ema_cross_20_50",
  "ema_cross_50_200",
  "bollinger_position",
  "atr_normalized",
  "adx",
  "stoch_rsi_k",
  "trend_bullish",
  "trend_bearish",
  "smc_bias_bullish",
  "smc_bias_bearish",
  "order_blocks_count",
  "fvg_count",
  "structure_breaks_bullish",
  "structure_breaks_bearish",
  "liquidity_zones_count",
  "wyckoff_accumulation",
  "wyckoff_distribution",
  "wyckoff_confidence",
  "kill_zone_active",
  "kill_zone_volatility_high",
  "confidence_score",
  "risk_reward_ratio",
  "direction_long",
];

export interface MLModelState {
  weights: number[];
  bias: number;
  learningRate: number;
  epochs: number;
  trained: boolean;
}

export interface PredictionResult {
  signal: "buy" | "sell" | "neutral";
  confidence: number;
  probability: number;
  featureImportance: { feature: string; importance: number }[];
}

class MLModel {
  private weights: number[];
  private bias: number;
  private learningRate: number;
  private trained: boolean = false;

  constructor(learningRate: number = 0.01) {
    this.weights = new Array(FEATURE_NAMES.length).fill(0);
    this.bias = 0;
    this.learningRate = learningRate;
  }

  /**
   * Sigmoid activation function
   */
  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-z));
  }

  /**
   * Extract features from signal data
   */
  extractFeatures(signalData: any): number[] {
    return [
      // TA features
      signalData.rsi ?? 50,
      signalData.macd ?? 0,
      signalData.ema20 > signalData.ema50 ? 1 : 0,
      signalData.ema50 > signalData.ema200 ? 1 : 0,
      signalData.bollingerPosition ?? 0.5,
      (signalData.atr ?? 0) / (signalData.price ?? 1),
      signalData.adx ?? 25,
      signalData.stochRSI ?? 50,
      signalData.trend === "bullish" ? 1 : 0,
      signalData.trend === "bearish" ? 1 : 0,

      // SMC features
      signalData.smcBias === "bullish" ? 1 : 0,
      signalData.smcBias === "bearish" ? 1 : 0,
      signalData.orderBlocks?.length ?? 0,
      signalData.fvgCount ?? 0,
      signalData.bullishBreaks ?? 0,
      signalData.bearishBreaks ?? 0,
      signalData.liquidityZones?.length ?? 0,

      // Wyckoff features
      signalData.wyckoffPhase === "accumulation" ? 1 : 0,
      signalData.wyckoffPhase === "distribution" ? 1 : 0,
      signalData.wyckoffConfidence ?? 50,

      // Kill zone features
      signalData.inKillZone ? 1 : 0,
      signalData.highVolatilityExpected ? 1 : 0,

      // Signal features
      signalData.confidence ?? 50,
      signalData.riskRewardRatio ?? 2,
      signalData.direction === "LONG" ? 1 : 0,
    ];
  }

  /**
   * Train the model on historical signals
   */
  train(trainingData: { features: number[]; label: number }[], epochs: number = 1000): void {
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;

      for (const sample of trainingData) {
        // Forward pass
        const prediction = this.predictRaw(sample.features);
        const error = sample.label - prediction;
        totalLoss += error ** 2;

        // Backward pass (gradient descent)
        const gradient = error * prediction * (1 - prediction);

        // Update weights
        for (let i = 0; i < this.weights.length; i++) {
          this.weights[i] += this.learningRate * gradient * sample.features[i];
        }

        // Update bias
        this.bias += this.learningRate * gradient;
      }

      // Log progress every 100 epochs
      if (epoch % 100 === 0) {
        const mse = totalLoss / trainingData.length;
        console.log(`Epoch ${epoch}, MSE: ${mse.toFixed(6)}`);
      }
    }

    this.trained = true;

    // Record training in ML engine
    signal_ml.record_training({
      samples: trainingData.length,
      epochs,
      finalWeights: this.weights,
      bias: this.bias,
    });
  }

  /**
   * Make prediction on new signal
   */
  predict(signalData: any): PredictionResult {
    const features = this.extractFeatures(signalData);
    const probability = this.predictRaw(features);

    // Determine signal
    let signal: "buy" | "sell" | "neutral";
    if (probability > 0.6) {
      signal = "buy";
    } else if (probability < 0.4) {
      signal = "sell";
    } else {
      signal = "neutral";
    }

    // Calculate feature importance
    const featureImportance = FEATURE_NAMES.map((name, i) => ({
      feature: name,
      importance: Math.abs(this.weights[i] * features[i]),
    })).sort((a, b) => b.importance - a.importance);

    return {
      signal,
      confidence: Math.round(Math.abs(probability - 0.5) * 200),
      probability,
      featureImportance: featureImportance.slice(0, 5),
    };
  }

  /**
   * Get raw prediction probability
   */
  private predictRaw(features: number[]): number {
    let z = this.bias;
    for (let i = 0; i < this.weights.length; i++) {
      z += this.weights[i] * features[i];
    }
    return this.sigmoid(z);
  }

  /**
   * Get model state for saving
   */
  getState(): MLModelState {
    return {
      weights: this.weights,
      bias: this.bias,
      learningRate: this.learningRate,
      epochs: this.trained ? 1000 : 0,
      trained: this.trained,
    };
  }

  /**
   * Load model state
   */
  loadState(state: MLModelState): void {
    this.weights = state.weights;
    this.bias = state.bias;
    this.learningRate = state.learningRate;
    this.trained = state.trained;
  }

  /**
   * Get feature importance (coefficients)
   */
  getFeatureImportance(): { feature: string; weight: number }[] {
    return FEATURE_NAMES.map((name, i) => ({
      feature: name,
      weight: this.weights[i],
    })).sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
  }
}

// Singleton instance
let mlModel: MLModel | null = null;

export function getMLModel(): MLModel {
  if (!mlModel) {
    mlModel = new MLModel();
  }
  return mlModel;
}

export function resetMLModel(): void {
  mlModel = new MLModel();
}

export { MLModel };
