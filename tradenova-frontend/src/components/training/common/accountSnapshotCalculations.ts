export type UnrealizedPosition = {
  unrealizedPnl: number | null;
  returnRate: number | null;
};

/**
 * Calculates mark-to-market results for the remaining position.
 * A missing price for an open position is represented by null so the UI never
 * renders a misleading NaN/Infinity value.
 */
export function calculateUnrealizedPosition(
  currentPrice: number | null | undefined,
  avgPrice: number | null | undefined,
  positionQty: number | null | undefined,
): UnrealizedPosition {
  if (Number.isFinite(positionQty) && positionQty! <= 0) {
    return { unrealizedPnl: 0, returnRate: 0 };
  }

  if (
    !Number.isFinite(positionQty) ||
    positionQty! <= 0 ||
    !Number.isFinite(currentPrice) ||
    !Number.isFinite(avgPrice) ||
    avgPrice! <= 0
  ) {
    return { unrealizedPnl: null, returnRate: null };
  }

  return {
    unrealizedPnl: (currentPrice! - avgPrice!) * positionQty!,
    returnRate: ((currentPrice! - avgPrice!) / avgPrice!) * 100,
  };
}
