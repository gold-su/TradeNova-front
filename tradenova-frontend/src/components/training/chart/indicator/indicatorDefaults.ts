import type { IndicatorSettings } from "@/types/training";

export const DEFAULT_INDICATORS: IndicatorSettings = {
  volume: {
    enabled: true,
  },
  ma: {
    enabled: true,
    lines: [
      { period: 5, color: "#facc15", width: 1 },
      { period: 20, color: "#38bdf8", width: 1 },
      { period: 60, color: "#a78bfa", width: 1 },
    ],
  },
  bollinger: {
    enabled: false,
    disabled: true,
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
    disabled: true,
  },
  macd: {
    enabled: false,
    disabled: true,
  },
};
