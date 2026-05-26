import { useCallback, useState } from "react";
import { trainingApi } from "@/api/trainingApi";
import type { TradeResponse } from "@/types/training";
import type { TradeChartMarker } from "@/components/training/chart/CandleChart";

export function useTrainingTradeMarkers() {
  const [tradeMarkersByChart, setTradeMarkersByChart] = useState<
    Record<number, TradeChartMarker[]>
  >({});

  const loadTradeMarkers = useCallback(async (chartIds: number[]) => {
    if (chartIds.length === 0) {
      setTradeMarkersByChart({});
      return;
    }

    const pairs = await Promise.all(
      chartIds.map(async (chartId) => {
        const trades = await trainingApi.getTrades(chartId);

        const markers: TradeChartMarker[] = trades.map((trade) => ({
          id: `${trade.chartId}-${trade.tradeId}-${trade.side}`,
          side: trade.side,
          time: trade.candleTime,
          price: Number(trade.price),
          qty: Number(trade.qty),
        }));

        return [chartId, markers] as const;
      }),
    );

    setTradeMarkersByChart(Object.fromEntries(pairs));
  }, []);

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

      const marker: TradeChartMarker = {
        id: `${res.chartId}-${res.tradeId}-${side}`,
        side,
        time: res.candleTime ?? fallbackTime ?? Date.now(),
        price: Number(res.executedPrice),
        qty,
      };

      setTradeMarkersByChart((prev) => ({
        ...prev,
        [res.chartId]: [...(prev[res.chartId] ?? []), marker],
      }));
    },
    [],
  );

  return {
    tradeMarkersByChart,
    loadTradeMarkers,
    addTradeMarker,
  };
}
