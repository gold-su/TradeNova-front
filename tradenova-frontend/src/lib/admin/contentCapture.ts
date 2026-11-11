import type { BlindContentCandle } from "@/api/contentStudioApi";

export const CONTENT_CAPTURE_WIDTH = 1080;
export const CONTENT_CAPTURE_HEIGHT = 1350;
export const CONTENT_PREVIEW_MAX_WIDTH = 430;

export type ContentCandleQuality = {
  invalidOhlc: boolean;
  possibleCorporateAction: boolean;
  maxCloseJumpRatio: number;
};

export function previewScaleForWidth(width: number) {
  if (!Number.isFinite(width) || width <= 0) return 0;
  return Math.min(1, width / CONTENT_CAPTURE_WIDTH);
}

export function createContentCaptureFilename(
  contentNumber: number,
  revealed: boolean,
  now = new Date(),
) {
  const safeNumber = Math.max(1, Math.trunc(contentNumber));
  const timestamp = now.toISOString().replace(/\D/g, "").slice(0, 14);
  const state = revealed ? "revealed" : "blind";
  return `decireps-content-${String(safeNumber).padStart(3, "0")}-${state}-${timestamp}.png`;
}

export function inspectContentCandleQuality(
  candles: Pick<BlindContentCandle, "o" | "h" | "l" | "c">[],
): ContentCandleQuality {
  let invalidOhlc = false;
  let maxCloseJumpRatio = 1;

  candles.forEach((candle, index) => {
    const values = [candle.o, candle.h, candle.l, candle.c];
    const validValues = values.every((value) => Number.isFinite(value) && value > 0);
    if (
      !validValues
      || candle.h < Math.max(candle.o, candle.c, candle.l)
      || candle.l > Math.min(candle.o, candle.c, candle.h)
    ) {
      invalidOhlc = true;
    }

    if (index === 0 || candle.c <= 0) return;
    const previousClose = candles[index - 1]?.c;
    if (!Number.isFinite(previousClose) || !previousClose || previousClose <= 0) return;
    const ratio = Math.max(candle.c / previousClose, previousClose / candle.c);
    if (Number.isFinite(ratio)) maxCloseJumpRatio = Math.max(maxCloseJumpRatio, ratio);
  });

  return {
    invalidOhlc,
    possibleCorporateAction: maxCloseJumpRatio >= 1.8,
    maxCloseJumpRatio,
  };
}
