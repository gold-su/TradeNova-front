import type { IndicatorSettings } from "@/types/training";

export const DEFAULT_INDICATORS: IndicatorSettings = {
  volume: {
    enabled: true,
  },
  ma: {
    enabled: true,
    disabled: false,
    type: "SMA",
    lines: [
      { period: 5, color: "#facc15", width: 1 },
      { period: 20, color: "#38bdf8", width: 1 },
      { period: 60, color: "#a78bfa", width: 1 },
    ],
  },
  bollinger: {
    enabled: false,

    period: 20,
    multiplier: 2,

    upperColor: "#60a5fa",
    middleColor: "#facc15",
    lowerColor: "#60a5fa",

    upperWidth: 1,
    middleWidth: 1,
    lowerWidth: 1,
  },
  ichimoku: {
    enabled: false,
    disabled: true,
  },
  volumeProfile: {
    enabled: false,
    disabled: true,
  },
  rsi: {
    enabled: false,
    disabled: false,
    period: 14,
    upper: 70,
    lower: 30,
    color: "#f97316",
    upperColor: "rgba(239,68,68,0.45)",
    lowerColor: "rgba(34,197,94,0.45)",
  },
  macd: {
    enabled: false,
    disabled: false,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    macdColor: "#f97316",
    signalColor: "#38bdf8",
    histogramUpColor: "rgba(34,197,94,0.45)",
    histogramDownColor: "rgba(239,68,68,0.45)",
  },
};
