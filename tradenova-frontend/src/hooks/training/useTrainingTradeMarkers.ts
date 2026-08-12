import { useCallback, useState } from "react";
import { trainingApi } from "@/api/trainingApi";
import type { TradeResponse } from "@/types/training";
import type { TradeChartMarker } from "@/components/training/chart/CandleChart";

function groupTradeMarkers(markers: TradeChartMarker[]) {
  const grouped = new Map<string, TradeChartMarker>();

  markers.forEach((marker) => {
    const key = `${marker.time}-${marker.side}`;
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, { ...marker, count: marker.count ?? 1 });
      return;
    }

    const existingQty = existing.qty ?? 0;
    const markerQty = marker.qty ?? 0;
    const totalQty = existingQty + markerQty;

    grouped.set(key, {
      ...existing,
      id: `${existing.id}-${marker.id}`,
      price:
        totalQty > 0
          ? (existing.price * existingQty + marker.price * markerQty) / totalQty
          : marker.price,
      qty: totalQty,
      count: (existing.count ?? 1) + (marker.count ?? 1),
    });
  });

  return Array.from(grouped.values());
}

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

        const markers = groupTradeMarkers(trades.map((trade) => ({
          id: `${trade.chartId}-${trade.tradeId}-${trade.side}`,
          side: trade.side,
          time: trade.candleTime,
          price: Number(trade.price),
          qty: Number(trade.qty),
        })));

        return [chartId, markers] as const;
      }),
    );

    setTradeMarkersByChart(Object.fromEntries(pairs));
  }, []);

  const syncTradeMarkers = useCallback(async (chartId: number) => {
    try {
      const trades = await trainingApi.getTrades(chartId);
      const markers = groupTradeMarkers(trades.map((trade) => ({
        id: `${trade.chartId}-${trade.tradeId}-${trade.side}`,
        side: trade.side,
        time: trade.candleTime,
        price: Number(trade.price),
        qty: Number(trade.qty),
      })));

      setTradeMarkersByChart((prev) => ({
        ...prev,
        [chartId]: markers,
      }));
    } catch (error) {
      console.error("trade marker sync failed", error);
    }
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
        [res.chartId]: groupTradeMarkers([
          ...(prev[res.chartId] ?? []),
          marker,
        ]),
      }));
    },
    [],
  );

  return {
    tradeMarkersByChart,
    loadTradeMarkers,
    syncTradeMarkers,
    addTradeMarker,
  };
}
