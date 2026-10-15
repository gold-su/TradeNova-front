import type { ProgressResponse, TradeResponse } from "@/types/training";
import type { ProgressMap } from "./training.types";

export type ChartRequestToken = Readonly<{
  chartId: number;
  version: number;
}>;

/**
 * 같은 세션의 모든 차트는 하나의 모의 계좌 현금을 공유한다.
 * 거래한 차트의 포지션 값만 갱신하고, 응답의 현금 잔액은 모든 차트에 반영한다.
 */
export function applyTradeToProgressMap(
  progressByChart: ProgressMap,
  trade: TradeResponse,
  tradedChartFallback: ProgressResponse,
): ProgressMap {
  const withSharedCash = Object.fromEntries(
    Object.entries(progressByChart).map(([chartId, progress]) => [
      chartId,
      {
        ...progress,
        cashBalance: trade.cashBalance,
      },
    ]),
  ) as ProgressMap;

  const tradedChart =
    withSharedCash[trade.chartId] ?? {
      ...tradedChartFallback,
      cashBalance: trade.cashBalance,
    };

  return {
    ...withSharedCash,
    [trade.chartId]: {
      ...tradedChart,
      cashBalance: trade.cashBalance,
      positionQty: trade.positionQty,
      avgPrice: trade.avgPrice,
      currentPrice: Number(trade.executedPrice),
    },
  };
}

/**
 * 비동기 chart hydration 응답이 현재 선택과 최신 요청에 모두 해당하는지 확인한다.
 */
export function isCurrentChartRequest(
  activeChartId: number | null,
  currentVersion: number,
  token: ChartRequestToken,
) {
  return (
    activeChartId === token.chartId && currentVersion === token.version
  );
}
