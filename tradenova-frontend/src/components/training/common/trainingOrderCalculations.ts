export const ORDER_PERCENTAGES = [25, 50, 75, 100] as const;

function isUsableNumber(value: number) {
  return Number.isFinite(value) && value > 0;
}

export function calculateBuyQuantityByPercent(
  cashBalance: number,
  currentPrice: number,
  percent: number,
) {
  if (
    !isUsableNumber(cashBalance) ||
    !isUsableNumber(currentPrice) ||
    !isUsableNumber(percent)
  ) {
    return 0;
  }

  return Math.floor((cashBalance * Math.min(percent, 100)) / 100 / currentPrice);
}

export function calculateSellQuantityByPercent(
  positionQty: number,
  percent: number,
) {
  if (!isUsableNumber(positionQty) || !isUsableNumber(percent)) return 0;

  const wholePosition = Math.floor(positionQty);
  if (percent >= 100) return wholePosition;

  return Math.floor((wholePosition * percent) / 100);
}

export function calculateEstimatedAmount(quantity: number, currentPrice: number) {
  if (!isUsableNumber(quantity) || !isUsableNumber(currentPrice)) return 0;
  return quantity * currentPrice;
}
