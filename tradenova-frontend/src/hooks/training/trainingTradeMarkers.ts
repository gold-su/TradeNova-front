import type { TradeChartMarker } from "@/components/training/chart/CandleChart";
import type { TrainingTradeItemResponse } from "@/types/training";

export function groupTradeMarkers(markers: TradeChartMarker[]) {
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

/** 서버의 canonical trade id로 중복을 제거한 뒤 실시간과 같은 정책으로 묶는다. */
export function tradesToMarkers(trades: TrainingTradeItemResponse[]) {
  const uniqueTrades = Array.from(
    new Map(
      trades.map((trade) => [`${trade.chartId}-${trade.tradeId}`, trade]),
    ).values(),
  );

  return groupTradeMarkers(uniqueTrades.map((trade) => ({
    id: `${trade.chartId}-${trade.tradeId}-${trade.side}`,
    side: trade.side,
    time: trade.candleTime,
    price: Number(trade.price),
    qty: Number(trade.qty),
  })));
}
