import type { GrowthTrendPointResponse } from "@/types/training";

export type ChartPoint = GrowthTrendPointResponse & { x: number; y: number };

export function buildScoreChart(points: GrowthTrendPointResponse[], width = 760, height = 220): ChartPoint[] {
  if (!points.length) return [];
  const left = 36, right = 12, top = 12, bottom = 28;
  return points.map((point, index) => ({ ...point,
    x: points.length === 1 ? width / 2 : left + index * ((width - left - right) / (points.length - 1)),
    y: top + (100 - Math.max(0, Math.min(100, point.score))) * ((height - top - bottom) / 100),
  }));
}

export function scorePolyline(points: ChartPoint[]) { return points.map(({ x, y }) => `${x},${y}`).join(" "); }
