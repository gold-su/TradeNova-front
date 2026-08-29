import { useCallback, useRef, useState } from "react";
import { trainingApi } from "@/api/trainingApi";
import type { TradeResponse } from "@/types/training";
import type { TradeChartMarker } from "@/components/training/chart/CandleChart";
import { groupTradeMarkers, tradesToMarkers } from "./trainingTradeMarkers";

export function useTrainingTradeMarkers() {
  const [tradeMarkersByChart, setTradeMarkersByChart] = useState<
    Record<number, TradeChartMarker[]>
  >({});
  const requestVersionByChart = useRef<Record<number, number>>({});
  const activeChartIds = useRef(new Set<number>());

  const syncTradeMarkers = useCallback(async (chartId: number) => {
    const requestVersion = (requestVersionByChart.current[chartId] ?? 0) + 1;
    requestVersionByChart.current[chartId] = requestVersion;

    try {
      const trades = await trainingApi.getTrades(chartId);

      if (
        requestVersionByChart.current[chartId] !== requestVersion ||
        !activeChartIds.current.has(chartId)
      ) return;

      setTradeMarkersByChart((prev) => ({
        ...prev,
        [chartId]: tradesToMarkers(trades),
      }));
    } catch (error) {
      console.error("trade marker sync failed", error);
    }
  }, []);

  const loadTradeMarkers = useCallback(async (chartIds: number[]) => {
    const nextChartIds = new Set(chartIds);
    activeChartIds.current = nextChartIds;

    setTradeMarkersByChart((prev) => Object.fromEntries(
      Object.entries(prev).filter(([chartId]) => nextChartIds.has(Number(chartId))),
    ));

    await Promise.all(chartIds.map(syncTradeMarkers));
  }, [syncTradeMarkers]);

  const addTradeMarker = useCallback(
    ({
      side,
      res,
      qty,
      fallbackTime,
    }: {
      side: "BUY" | "SELL";
      res: TradeResponse;
      qty?: number;
      fallbackTime?: number;
    }) => {
      if (!res.tradeId) return;

      // 진행 중인 복원 요청이 방금 체결된 거래를 덮어쓰지 못하게 한다.
      requestVersionByChart.current[res.chartId] =
        (requestVersionByChart.current[res.chartId] ?? 0) + 1;

      const marker: TradeChartMarker = {
        id: `${res.chartId}-${res.tradeId}-${side}`,
        side,
        time: res.candleTime ?? fallbackTime ?? Date.now(),
        price: Number(res.executedPrice),
        qty,
      };
      const canonicalMarkerId = `${res.chartId}-${res.tradeId}-${side}`;
      const containsTrade = (id: string) =>
        new RegExp(`(^|-)${canonicalMarkerId}(-|$)`).test(id);

      setTradeMarkersByChart((prev) => ({
        ...prev,
        [res.chartId]: (prev[res.chartId] ?? []).some(({ id }) =>
          containsTrade(id))
          ? (prev[res.chartId] ?? [])
          : groupTradeMarkers([...(prev[res.chartId] ?? []), marker]),
      }));

      // 응답 marker는 즉시 표시하되 최종 상태는 canonical history로 교체한다.
      void syncTradeMarkers(res.chartId);
    },
    [syncTradeMarkers],
  );

  return {
    tradeMarkersByChart,
    loadTradeMarkers,
    syncTradeMarkers,
    addTradeMarker,
  };
}
