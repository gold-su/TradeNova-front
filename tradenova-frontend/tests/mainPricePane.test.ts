import assert from "node:assert/strict";
import test from "node:test";
import type { ISeriesApi } from "lightweight-charts";
import { syncMaSeries } from "../src/components/training/chart/panes/MainPricePane.ts";

test("syncing an existing MA updates it instead of leaking another series", () => {
  let addCount = 0;
  const appliedOptions: unknown[] = [];
  const series = {
    applyOptions: (options: unknown) => appliedOptions.push(options),
  } as ISeriesApi<"Line">;
  const chart = {
    addSeries: () => {
      addCount += 1;
      return series;
    },
    removeSeries: () => undefined,
  } as never;
  const maSeriesMap: Record<number, ISeriesApi<"Line">> = {};
  const lines = [{ period: 5, color: "#ffffff", width: 1 as const }];

  syncMaSeries({ chart, maSeriesMap, lines });
  syncMaSeries({
    chart,
    maSeriesMap,
    lines: [{ ...lines[0], color: "#000000" }],
  });

  assert.equal(addCount, 1);
  assert.equal(maSeriesMap[5], series);
  assert.deepEqual(appliedOptions, [{ color: "#000000", lineWidth: 1 }]);
});
