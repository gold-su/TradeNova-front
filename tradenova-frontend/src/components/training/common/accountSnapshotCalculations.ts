export type UnrealizedPosition = {
  unrealizedPnL: number | null;
  returnRate: number | null;
};

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

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
  if (isFiniteNumber(positionQty) && positionQty <= 0) {
    return { unrealizedPnL: 0, returnRate: 0 };
  }

  if (
    !isFiniteNumber(positionQty) ||
    !isFiniteNumber(currentPrice) ||
    !isFiniteNumber(avgPrice) ||
    avgPrice <= 0
  ) {
    return { unrealizedPnL: null, returnRate: null };
  }

  return {
    unrealizedPnL: (currentPrice - avgPrice) * positionQty,
    returnRate: ((currentPrice - avgPrice) / avgPrice) * 100,
  };
}
