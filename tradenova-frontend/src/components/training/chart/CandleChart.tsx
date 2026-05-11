import { useEffect, useMemo, useRef } from "react";
import { createChart, type IChartApi } from "lightweight-charts";
import type { Candle, IndicatorSettings } from "@/types/training";
import { DEFAULT_INDICATORS } from "@/components/training/chart/indicator/indicatorDefaults";
import { createMainPricePane } from "@/components/training/chart/panes/MainPricePane";
import { createVolumePane } from "@/components/training/chart/panes/VolumePane";
import { createRsiPane } from "@/components/training/chart/panes/RsiPane";

type Props = {
  candles: Candle[];
  height?: number;
  indicatorSettings?: IndicatorSettings;
};

export default function CandleChart({
  candles,
  height = 520,
  indicatorSettings = DEFAULT_INDICATORS,
}: Props) {
  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const rsiContainerRef = useRef<HTMLDivElement | null>(null);

  const mainChartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);

  const showRsi = indicatorSettings.rsi.enabled;

  const rsiHeight = showRsi ? 90 : 0;
  const gapHeight = showRsi ? 8 : 0;
  const mainHeight = Math.max(120, height - rsiHeight - gapHeight);

  const settingsKey = useMemo(
    () => JSON.stringify(indicatorSettings),
    [indicatorSettings],
  );

  useEffect(() => {
    const mainEl = mainContainerRef.current;
    const rsiEl = rsiContainerRef.current;

    if (!mainEl) return;

    const mainChart = createChart(mainEl, {
      height: mainHeight,
      layout: {
        attributionLogo: false,
        background: { color: "transparent" },
        textColor: "#9CA3AF",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.06)" },
        horzLines: { color: "rgba(255,255,255,0.06)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.12)",
        autoScale: true,
        scaleMargins: {
          top: 0.08,
          bottom: indicatorSettings.volume.enabled ? 0.22 : 0.08,
        },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.12)",
        rightOffset: 5,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      crosshair: {
        mode: 1,
      },
    });

    mainChartRef.current = mainChart;

    createMainPricePane({
      chart: mainChart,
      candles,
      indicatorSettings,
    });

    if (indicatorSettings.volume.enabled) {
      createVolumePane({
        chart: mainChart,
        candles,
      });
    }

    let rsiChart: IChartApi | null = null;

    if (showRsi && rsiEl) {
      rsiChart = createChart(rsiEl, {
        height: rsiHeight,
        layout: {
          attributionLogo: false,
          background: { color: "transparent" },
          textColor: "#9CA3AF",
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.04)" },
          horzLines: { color: "rgba(255,255,255,0.04)" },
        },
        rightPriceScale: {
          borderColor: "rgba(255,255,255,0.12)",
          autoScale: true,
          scaleMargins: {
            top: 0.12,
            bottom: 0.12,
          },
        },
        timeScale: {
          borderColor: "rgba(255,255,255,0.12)",
          rightOffset: 5,
          fixLeftEdge: true,
          fixRightEdge: true,
          visible: false,
        },
        crosshair: {
          mode: 1,
        },
      });

      rsiChartRef.current = rsiChart;

      createRsiPane({
        chart: rsiChart,
        candles,
        period: 14,
      });

      const syncFromMain = () => {
        const range = mainChart.timeScale().getVisibleLogicalRange();
        if (range) {
          rsiChart?.timeScale().setVisibleLogicalRange(range);
        }
      };

      const syncFromRsi = () => {
        const range = rsiChart?.timeScale().getVisibleLogicalRange();
        if (range) {
          mainChart.timeScale().setVisibleLogicalRange(range);
        }
      };

      mainChart.timeScale().subscribeVisibleLogicalRangeChange(syncFromMain);
      rsiChart.timeScale().subscribeVisibleLogicalRangeChange(syncFromRsi);
    }

    const ro = new ResizeObserver(() => {
      mainChart.applyOptions({
        width: mainEl.clientWidth,
        height: mainHeight,
      });

      if (rsiChart && rsiEl) {
        rsiChart.applyOptions({
          width: rsiEl.clientWidth,
          height: rsiHeight,
        });
      }
    });

    ro.observe(mainEl);
    if (rsiEl) ro.observe(rsiEl);

    mainChart.applyOptions({
      width: mainEl.clientWidth,
      height: mainHeight,
    });

    if (rsiChart && rsiEl) {
      rsiChart.applyOptions({
        width: rsiEl.clientWidth,
        height: rsiHeight,
      });
    }

    mainChart.timeScale().fitContent();
    rsiChart?.timeScale().fitContent();

    return () => {
      ro.disconnect();

      mainChart.remove();
      rsiChart?.remove();

      mainChartRef.current = null;
      rsiChartRef.current = null;
    };
  }, [
    candles,
    height,
    mainHeight,
    rsiHeight,
    showRsi,
    settingsKey,
    indicatorSettings,
  ]);

  return (
    <div className="w-full rounded-2xl border border-border/60 bg-background/20 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2 px-1 text-[11px] text-muted-foreground">
        {indicatorSettings.volume.enabled && <span>Volume</span>}

        {indicatorSettings.ma.enabled &&
          indicatorSettings.ma.lines.map((line) => (
            <span key={line.period} style={{ color: line.color }}>
              MA{line.period}
            </span>
          ))}

        {showRsi && <span className="text-orange-400">RSI14</span>}
      </div>

      <div
        ref={mainContainerRef}
        className="w-full"
        style={{ height: mainHeight }}
      />

      {showRsi && (
        <div className="mt-2 rounded-xl border border-border/40 bg-background/10 p-2">
          <div className="mb-1 px-1 text-[10px] text-muted-foreground">
            RSI 14
          </div>
          <div
            ref={rsiContainerRef}
            className="w-full"
            style={{ height: rsiHeight }}
          />
        </div>
      )}
    </div>
  );
}
