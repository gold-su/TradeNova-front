import { useEffect, useMemo, useRef } from "react";
import { createChart, type IChartApi } from "lightweight-charts";
import type { Candle, IndicatorSettings } from "@/types/training";
import { DEFAULT_INDICATORS } from "@/components/training/chart/indicator/indicatorDefaults";

import {
  createMainPriceSeries,
  syncMaSeries,
  type MainPriceSeriesRefs,
} from "@/components/training/chart/panes/MainPricePane";
import {
  createVolumeSeries,
  type VolumeSeriesRefs,
} from "@/components/training/chart/panes/VolumePane";
import {
  createRsiSeries,
  type RsiSeriesRefs,
} from "@/components/training/chart/panes/RsiPane";
import {
  createMacdSeries,
  type MacdSeriesRefs,
} from "@/components/training/chart/panes/MacdPane";

import {
  levelData,
  normalizeMaLines,
  toCandlestickData,
  toMovingAverageData,
  toVolumeData,
} from "@/lib/chart/indicators/seriesData";
import { calculateRSI } from "@/lib/chart/indicators/rsi";
import { calculateMACD } from "@/lib/chart/indicators/macd";

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

  const mainChartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const macdChartRef = useRef<IChartApi | null>(null);

  const mainSeriesRef = useRef<MainPriceSeriesRefs | null>(null);
  const volumeSeriesRef = useRef<VolumeSeriesRefs | null>(null);
  const rsiSeriesRef = useRef<RsiSeriesRefs | null>(null);
  const macdSeriesRef = useRef<MacdSeriesRefs | null>(null);

  const prevCandleLengthRef = useRef(0);
  const initializedRef = useRef(false);

  const showRsi = indicatorSettings.rsi.enabled;
  const showMacd = indicatorSettings.macd.enabled;

  const subPaneCount = Number(showRsi) + Number(showMacd);
  const subPaneHeight = subPaneCount > 0 ? 90 : 0;
  const totalSubHeight = subPaneHeight * subPaneCount;
  const totalGapHeight = subPaneCount > 0 ? 8 * subPaneCount : 0;
  const mainHeight = Math.max(120, height - totalSubHeight - totalGapHeight);

  const maLines = useMemo(() => {
    if (!indicatorSettings.ma.enabled) return [];
    return normalizeMaLines(indicatorSettings.ma.lines);
  }, [indicatorSettings.ma.enabled, indicatorSettings.ma.lines]);

  /**
   * 차트 생성 effect
   * - createChart는 여기서만 실행
   * - candles 변경으로는 재생성하지 않음
   * - RSI/MACD 표시 여부처럼 pane 구조가 바뀔 때만 재생성
   */
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
    mainSeriesRef.current = createMainPriceSeries(mainChart);

    let rsiChart: IChartApi | null = null;
    let macdChart: IChartApi | null = null;

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
          autoScale: false,
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
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
      rsiSeriesRef.current = createRsiSeries({
        chart: rsiChart,
        rsiColor: indicatorSettings.rsi.color,
        upperColor: indicatorSettings.rsi.upperColor,
        lowerColor: indicatorSettings.rsi.lowerColor,
      });
    }

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
      macdSeriesRef.current = createMacdSeries({
        chart: macdChart,
        macdColor: indicatorSettings.macd.macdColor,
        signalColor: indicatorSettings.macd.signalColor,
      });
    }

    const syncSubPanes = () => {
      const range = mainChart.timeScale().getVisibleLogicalRange();
      if (!range) return;

      rsiChart?.timeScale().setVisibleLogicalRange(range);
      macdChart?.timeScale().setVisibleLogicalRange(range);
    };

    mainChart.timeScale().subscribeVisibleLogicalRangeChange(syncSubPanes);

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
    if (macdEl) ro.observe(macdEl);

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
      mainChart.timeScale().unsubscribeVisibleLogicalRangeChange(syncSubPanes);
      ro.disconnect();

      mainChart.remove();
      rsiChart?.remove();
      macdChart?.remove();

      mainChartRef.current = null;
      rsiChartRef.current = null;
      macdChartRef.current = null;

      mainSeriesRef.current = null;
      volumeSeriesRef.current = null;
      rsiSeriesRef.current = null;
      macdSeriesRef.current = null;

      initializedRef.current = false;
      prevCandleLengthRef.current = 0;
    };
  }, [height, mainHeight, showRsi, showMacd, subPaneHeight]);

  /**
   * 데이터 업데이트 effect
   * - candles 변경 시 chart를 재생성하지 않고 setData만 실행
   * - NEXT로 봉이 하나 늘어나면 오른쪽 끝으로 부드럽게 이동
   */
  useEffect(() => {
    const mainChart = mainChartRef.current;
    const mainSeries = mainSeriesRef.current;

    if (!mainChart || !mainSeries) return;

    const candleData = toCandlestickData(candles);
    mainSeries.candleSeries.setData(candleData);

    mainChart.applyOptions({
      rightPriceScale: {
        scaleMargins: {
          top: 0.08,
          bottom: indicatorSettings.volume.enabled ? 0.22 : 0.08,
        },
      },
    });

    if (indicatorSettings.volume.enabled) {
      if (!volumeSeriesRef.current) {
        volumeSeriesRef.current = createVolumeSeries(mainChart);
      }

      volumeSeriesRef.current.volumeSeries.setData(toVolumeData(candles));
    } else if (volumeSeriesRef.current) {
      mainChart.removeSeries(volumeSeriesRef.current.volumeSeries);
      volumeSeriesRef.current = null;
    }

    syncMaSeries({
      chart: mainChart,
      maSeriesMap: mainSeries.maSeriesMap,
      lines: maLines,
    });

    maLines.forEach((line) => {
      mainSeries.maSeriesMap[line.period]?.setData(
        toMovingAverageData(candles, line.period),
      );
    });

    if (showRsi && rsiChartRef.current && rsiSeriesRef.current) {
      
      rsiSeriesRef.current.rsiSeries.applyOptions({
        color: indicatorSettings.rsi.color,
      });

      rsiSeriesRef.current.upperLine.applyOptions({
        color: indicatorSettings.rsi.upperColor,
      });

      rsiSeriesRef.current.lowerLine.applyOptions({
        color: indicatorSettings.rsi.lowerColor,
      });
      
      const rsiData = calculateRSI(candles, indicatorSettings.rsi.period);

      rsiSeriesRef.current.rsiSeries.setData(rsiData);
      rsiSeriesRef.current.upperLine.setData(
        levelData(candles, indicatorSettings.rsi.upper),
      );
      rsiSeriesRef.current.lowerLine.setData(
        levelData(candles, indicatorSettings.rsi.lower),
      );
    }

    if (showMacd && macdChartRef.current && macdSeriesRef.current) {
      
      macdSeriesRef.current.macdSeries.applyOptions({
        color: indicatorSettings.macd.macdColor,
      });

      macdSeriesRef.current.signalSeries.applyOptions({
        color: indicatorSettings.macd.signalColor,
      });
      
      const macd = calculateMACD(
        candles,
        indicatorSettings.macd.fastPeriod,
        indicatorSettings.macd.slowPeriod,
        indicatorSettings.macd.signalPeriod,
        indicatorSettings.macd.histogramUpColor,
        indicatorSettings.macd.histogramDownColor,
      );

      macdSeriesRef.current.histogramSeries.setData(macd.histogram);
      macdSeriesRef.current.macdSeries.setData(macd.macdLine);
      macdSeriesRef.current.signalSeries.setData(macd.signalLine);
    }

    const isFirstDataLoad = !initializedRef.current;
    const isNextCandle = candles.length > prevCandleLengthRef.current;

    requestAnimationFrame(() => {
      if (isFirstDataLoad) {
        mainChart.timeScale().fitContent();
        rsiChartRef.current?.timeScale().fitContent();
        macdChartRef.current?.timeScale().fitContent();
      } else if (isNextCandle) {
        mainChart.timeScale().scrollToPosition(0, true);
        rsiChartRef.current?.timeScale().scrollToPosition(0, true);
        macdChartRef.current?.timeScale().scrollToPosition(0, true);
      }
    });

    initializedRef.current = true;
    prevCandleLengthRef.current = candles.length;
  }, [candles, indicatorSettings, maLines, showRsi, showMacd]);

  return (
    <div className="h-full w-full">
      <div className="mb-2 flex flex-wrap items-center gap-2 px-1 text-[11px] text-muted-foreground">
        {indicatorSettings.volume.enabled && <span>Volume</span>}

        {indicatorSettings.ma.enabled &&
          indicatorSettings.ma.lines.map((line) => (
            <span key={line.period} style={{ color: line.color }}>
              MA{line.period}
            </span>
          ))}

        {showRsi && (
          <span className="text-orange-400">
            RSI{indicatorSettings.rsi.period}
          </span>
        )}

        {showMacd && (
          <span className="text-sky-400">
            MACD {indicatorSettings.macd.fastPeriod}{" "}
            {indicatorSettings.macd.slowPeriod}{" "}
            {indicatorSettings.macd.signalPeriod}
          </span>
        )}
      </div>

      <div
        ref={mainContainerRef}
        className="w-full"
        style={{ height: mainHeight }}
      />

      {showRsi && (
        <div className="mt-2 rounded-xl border border-border/40 bg-background/10 p-2">
          <div className="mb-1 px-1 text-[10px] text-muted-foreground">
            RSI {indicatorSettings.rsi.period}
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
            MACD {indicatorSettings.macd.fastPeriod}{" "}
            {indicatorSettings.macd.slowPeriod}{" "}
            {indicatorSettings.macd.signalPeriod}
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