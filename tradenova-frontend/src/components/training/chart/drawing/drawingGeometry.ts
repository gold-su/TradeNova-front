export type PixelPoint = { x: number; y: number };

export const FIBONACCI_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1] as const;

export function normalizeZoneRect(start: PixelPoint, end: PixelPoint) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

export function getRayEndpoint(start: PixelPoint, direction: PixelPoint, chartWidth: number): PixelPoint | null {
  const dx = direction.x - start.x;
  const dy = direction.y - start.y;
  if (Math.abs(dx) < 0.001) return null;
  const boundaryX = dx > 0 ? chartWidth : 0;
  const scale = (boundaryX - start.x) / dx;
  return { x: boundaryX, y: start.y + dy * scale };
}

export function getParallelChannelGeometry(start: PixelPoint, end: PixelPoint, anchor3: PixelPoint) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared < 0.01) return null;
  const relativeX = anchor3.x - start.x;
  const relativeY = anchor3.y - start.y;
  const projection = (relativeX * dx + relativeY * dy) / lengthSquared;
  const offset = {
    x: relativeX - projection * dx,
    y: relativeY - projection * dy,
  };
  return {
    baseStart: start,
    baseEnd: end,
    parallelStart: { x: start.x + offset.x, y: start.y + offset.y },
    parallelEnd: { x: end.x + offset.x, y: end.y + offset.y },
    offset,
  };
}

export function getFibonacciLevels(startPrice: number, endPrice: number) {
  return FIBONACCI_LEVELS.map((ratio) => ({
    ratio,
    price: startPrice + (endPrice - startPrice) * ratio,
  }));
}
