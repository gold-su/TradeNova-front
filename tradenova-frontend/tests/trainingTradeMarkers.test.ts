import assert from "node:assert/strict";
import test from "node:test";
import { tradesToMarkers } from "../src/hooks/training/trainingTradeMarkers.ts";

const trade = (
  tradeId: number,
  side: "BUY" | "SELL",
  candleTime: number,
  qty = 1,
  price = 100,
) => ({
  tradeId,
  chartId: 7,
  accountId: 1,
  symbolId: 2,
  side,
  price,
  qty,
  createdAt: "2026-08-29T00:00:00Z",
  candleTime,
});

test("restores BUY and SELL markers from canonical trades", () => {
  const markers = tradesToMarkers([
    trade(1, "BUY", 1000),
    trade(2, "SELL", 2000),
  ]);

  assert.deepEqual(markers.map(({ side }) => side), ["BUY", "SELL"]);
});

test("groups multiple same-side trades on one candle consistently", () => {
  const markers = tradesToMarkers([
    trade(1, "BUY", 1000, 2, 100),
    trade(2, "BUY", 1000, 3, 110),
  ]);

  assert.equal(markers.length, 1);
  assert.equal(markers[0].count, 2);
  assert.equal(markers[0].qty, 5);
  assert.equal(markers[0].price, 106);
});

test("deduplicates repeated hydration data by canonical trade id", () => {
  const canonicalTrade = trade(9, "SELL", 3000, 4, 120);
  const markers = tradesToMarkers([canonicalTrade, canonicalTrade]);

  assert.equal(markers.length, 1);
  assert.equal(markers[0].qty, 4);
  assert.equal(markers[0].count, 1);
});

test("does not create markers without server trades", () => {
  assert.deepEqual(tradesToMarkers([]), []);
});
