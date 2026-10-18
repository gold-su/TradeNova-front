import type { IndicatorSettings } from "../../../../types/training.ts";

export type IndicatorDisplayMode = "COMPACT" | "FULL";
export type RenderableIndicator = "ma" | "volume" | "bollinger" | "rsi" | "macd";

export function isIndicatorVisible(
  settings: IndicatorSettings,
  indicator: RenderableIndicator,
  displayMode: IndicatorDisplayMode,
): boolean {
  if (!settings[indicator].enabled) return false;

  return !(
    displayMode === "COMPACT" &&
    (indicator === "rsi" || indicator === "macd")
  );
}
