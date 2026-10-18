import type { IndicatorSettings, MaLineSetting } from "../../../../types/training.ts";
import { DEFAULT_INDICATORS } from "./indicatorDefaults.ts";

export type IndicatorPresetKey = "BASIC" | "TREND" | "MOMENTUM" | "VOLATILITY";

export const INDICATOR_PRESETS: ReadonlyArray<{ key: IndicatorPresetKey; label: string }> = [
  { key: "BASIC", label: "기본" },
  { key: "TREND", label: "추세" },
  { key: "MOMENTUM", label: "모멘텀" },
  { key: "VOLATILITY", label: "변동성" },
];

function getMaLines(settings: IndicatorSettings, periods: readonly number[]): MaLineSetting[] {
  return periods.map((period) => {
    const existing = settings.ma.lines.find((line) => line.period === period);
    const fallback = DEFAULT_INDICATORS.ma.lines.find((line) => line.period === period);
    return { ...(existing ?? fallback ?? { color: "#22c55e", width: 1 }), period };
  });
}

export function applyIndicatorPreset(
  settings: IndicatorSettings,
  preset: IndicatorPresetKey,
): IndicatorSettings {
  switch (preset) {
    case "BASIC":
      return {
        ...settings,
        ma: { ...settings.ma, enabled: true, type: "SMA", lines: getMaLines(settings, [20, 60]) },
        volume: { ...settings.volume, enabled: true },
      };
    case "TREND":
      return {
        ...settings,
        ma: { ...settings.ma, enabled: true, type: "EMA", lines: getMaLines(settings, [20, 60]) },
        macd: { ...settings.macd, enabled: true, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
      };
    case "MOMENTUM":
      return { ...settings, rsi: { ...settings.rsi, enabled: true, period: 14 } };
    case "VOLATILITY":
      return {
        ...settings,
        bollinger: { ...settings.bollinger, enabled: true, period: 20, multiplier: 2 },
      };
  }
}
