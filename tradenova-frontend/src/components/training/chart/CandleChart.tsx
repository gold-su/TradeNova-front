import { useEffect, useMemo, useRef } from "react";
import { createChart, type IChartApi } from "lightweight-charts";
import type { Candle, IndicatorSettings } from "@/types/training";
import { DEFAULT_INDICATORS } from "@/components/training/chart/indicator/indicatorDefaults";
import { createMainPricePane } from "@/components/training/chart/panes/MainPricePane";
import { createVolumePane } from "@/components/training/chart/panes/VolumePane";
import { createRsiPane } from "@/components/training/chart/panes/RsiPane";
import { createMacdPane } from "@/components/training/chart/panes/MacdPane";

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

  const macdContainerRef = useRef<HTMLDivElement | null>(null);
  const macdChartRef = useRef<IChartApi | null>(null);

  const mainChartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);

  const showRsi = indicatorSettings.rsi.enabled;
  const showMacd = indicatorSettings.macd.enabled;

  const subPaneCount = Number(showRsi) + Number(showMacd);
  const subPaneHeight = subPaneCount > 0 ? 90 : 0;
  const totalSubHeight = subPaneHeight * subPaneCount;
  const totalGapHeight = subPaneCount > 0 ? 8 * subPaneCount : 0;

  const mainHeight = Math.max(120, height - totalSubHeight - totalGapHeight);

  const visibleRangeRef = useRef<any>(null);

  const settingsKey = useMemo(
    () => JSON.stringify(indicatorSettings),
    [indicatorSettings],
  );

  useEffect(() => {
    const mainEl = mainContainerRef.current;
    const rsiEl = rsiContainerRef.current;
    const macdEl = macdContainerRef.current;

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
        height: subPaneHeight,
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

        period: indicatorSettings.rsi.period,
        upper: indicatorSettings.rsi.upper,
        lower: indicatorSettings.rsi.lower,
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

    let macdChart: IChartApi | null = null;

    if (showMacd && macdEl) {
      macdChart = createChart(macdEl, {
        height: subPaneHeight,
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
            top: 0.15,
            bottom: 0.15,
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

      macdChartRef.current = macdChart;

      createMacdPane({
        chart: macdChart,
        candles,
        fastPeriod: indicatorSettings.macd.fastPeriod,
        slowPeriod: indicatorSettings.macd.slowPeriod,
        signalPeriod: indicatorSettings.macd.signalPeriod,
      });

      const syncFromMainToMacd = () => {
        const range = mainChart.timeScale().getVisibleLogicalRange();
        if (range) {
          macdChart?.timeScale().setVisibleLogicalRange(range);
        }
      };

      const syncFromMacd = () => {
        const range = macdChart?.timeScale().getVisibleLogicalRange();
        if (range) {
          mainChart.timeScale().setVisibleLogicalRange(range);
        }
      };

      mainChart
        .timeScale()
        .subscribeVisibleLogicalRangeChange(syncFromMainToMacd);
      macdChart.timeScale().subscribeVisibleLogicalRangeChange(syncFromMacd);
    }

    const savedRange = visibleRangeRef.current;

    requestAnimationFrame(() => {
      if (savedRange) {
        mainChart.timeScale().setVisibleLogicalRange(savedRange);
        rsiChart?.timeScale().setVisibleLogicalRange(savedRange);
        macdChart?.timeScale().setVisibleLogicalRange(savedRange);
      } else {
        mainChart.timeScale().fitContent();
        rsiChart?.timeScale().fitContent();
        macdChart?.timeScale().fitContent();
      }
    });

    const ro = new ResizeObserver(() => {
      mainChart.applyOptions({
        width: mainEl.clientWidth,
        height: mainHeight,
      });

      if (rsiChart && rsiEl) {
        rsiChart.applyOptions({
          width: rsiEl.clientWidth,
          height: subPaneHeight,
        });
      }

      if (macdChart && macdEl) {
        macdChart.applyOptions({
          width: macdEl.clientWidth,
          height: subPaneHeight,
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
        height: subPaneHeight,
      });
    }

    if (macdChart && macdEl) {
      macdChart.applyOptions({
        width: macdEl.clientWidth,
        height: subPaneHeight,
      });
    }

    return () => {
      visibleRangeRef.current = mainChart.timeScale().getVisibleLogicalRange();

      ro.disconnect();

      mainChart.remove();
      rsiChart?.remove();

      mainChartRef.current = null;
      rsiChartRef.current = null;
      macdChart?.remove();
      macdChartRef.current = null;
    };
  }, [
    candles,
    height,
    mainHeight,
    showRsi,
    showMacd,
    subPaneHeight,
    settingsKey,
  ]);

  return (
    <div className="w-full h-full">
      <div className="mb-2 flex flex-wrap items-center gap-2 px-1 text-[11px] text-muted-foreground">
        {indicatorSettings.volume.enabled && <span>Volume</span>}

        {indicatorSettings.ma.enabled &&
          indicatorSettings.ma.lines.map((line) => (
            <span key={line.period} style={{ color: line.color }}>
              MA{line.period}
            </span>
          ))}

        {showRsi && <span className="text-orange-400">RSI14</span>}
        {showMacd && <span className="text-sky-400">MACD</span>}
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
            style={{ height: subPaneHeight }}
          />
        </div>
      )}

      {showMacd && (
        <div className="mt-2 rounded-xl border border-border/40 bg-background/10 p-2">
          <div className="mb-1 px-1 text-[10px] text-muted-foreground">
            MACD 12 26 9
          </div>
          <div
            ref={macdContainerRef}
            className="w-full"
            style={{ height: subPaneHeight }}
          />
        </div>
      )}
    </div>
  );
}
