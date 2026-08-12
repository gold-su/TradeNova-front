import { useEffect, useMemo, useRef, useState } from "react";
import {
  createChart,
  LineSeries,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import type { Candle, IndicatorSettings } from "@/types/training";
import { DEFAULT_INDICATORS } from "@/components/training/chart/indicator/indicatorDefaults";
import { calculateBollinger } from "@/lib/chart/indicators/bollinger";
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

export type TradeChartMarker = {
  id: string;
  side: "BUY" | "SELL";
  time: number; // epoch millis
  price: number;
  qty?: number;
  count?: number;
};

type Props = {
  candles: Candle[];
  height?: number;
  indicatorSettings?: IndicatorSettings;
  tradeMarkers?: TradeChartMarker[];
};

function formatTooltipDate(timestamp: number) {
  const date = new Date(timestamp);

  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const day = weekdays[date.getDay()];

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `(${day}) ${yyyy}.${mm}.${dd}`;
}

function formatAxisMonth(timestamp: number) {
  const date = new Date(timestamp);

  const yyyy = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month === 1) {
    return String(yyyy);
  }

  return `${month}월`;
}

export default function CandleChart({
  candles,
  height = 520,
  indicatorSettings = DEFAULT_INDICATORS,
  tradeMarkers = [],
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
  const bollingerSeriesRef = useRef<{
    upper: ISeriesApi<"Line">;
    middle: ISeriesApi<"Line">;
    lower: ISeriesApi<"Line">;
  } | null>(null);

  const prevCandleLengthRef = useRef(0);
  const initializedRef = useRef(false);

  const tradeMarkersRef = useRef<any>(null);

  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    candle: Candle;
  } | null>(null);

  const [tradeTooltip, setTradeTooltip] = useState<{
    x: number;
    y: number;
    trade: TradeChartMarker;
  } | null>(null);

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
  }, [
    indicatorSettings.ma.enabled,
    indicatorSettings.ma.lines,
    indicatorSettings.ma.type,
  ]);

  const candleByTime = useMemo(() => {
    const map = new Map<number, Candle>();

    candles.forEach((candle) => {
      map.set(Math.floor(candle.t / 1000), candle);
    });

    return map;
  }, [candles]);

  const candleByTimeRef = useRef(candleByTime);

  useEffect(() => {
    candleByTimeRef.current = candleByTime;
  }, [candleByTime]);

  const tooltipStyle = useMemo(() => {
    if (!tooltip) return undefined;

    const width = mainContainerRef.current?.clientWidth ?? 0;
    const tooltipWidth = 150;
    const gap = 12;

    const left =
      tooltip.x + tooltipWidth + gap > width
        ? tooltip.x - tooltipWidth - gap
        : tooltip.x + gap;

    return {
      left: Math.max(8, left),
      top: Math.max(36, tooltip.y - 12),
    };
  }, [tooltip]);

  const tradeTooltipStyle = useMemo(() => {
    if (!tradeTooltip) return undefined;

    const width = mainContainerRef.current?.clientWidth ?? 0;
    const tooltipWidth = 140;
    const gap = 12;

    const left =
      tradeTooltip.x + tooltipWidth + gap > width
        ? tradeTooltip.x - tooltipWidth - gap
        : tradeTooltip.x + gap;

    return {
      left: Math.max(8, left),
      top: Math.max(36, tradeTooltip.y - 12),
    };
  }, [tradeTooltip]);

  const tradeMarkersByTime = useMemo(() => {
    const map = new Map<number, TradeChartMarker[]>();

    tradeMarkers.forEach((marker) => {
      const time = Math.floor(marker.time / 1000);
      map.set(time, [...(map.get(time) ?? []), marker]);
    });

    return map;
  }, [tradeMarkers]);

  const tradeMarkersByTimeRef = useRef(tradeMarkersByTime);

  useEffect(() => {
    tradeMarkersByTimeRef.current = tradeMarkersByTime;
  }, [tradeMarkersByTime]);

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
      localization: {
        timeFormatter: (time: any) => {
          const timestamp =
            typeof time === "number"
              ? time * 1000
              : new Date(`${time.year}-${time.month}-${time.day}`).getTime();

          return formatTooltipDate(timestamp);
        },
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
        tickMarkFormatter: (time: any) => {
          const timestamp =
            typeof time === "number"
              ? time * 1000
              : new Date(`${time.year}-${time.month}-${time.day}`).getTime();

          return formatAxisMonth(timestamp);
        },
      },
      crosshair: {
        mode: 0,
      },
    });

    mainChartRef.current = mainChart;
    mainSeriesRef.current = createMainPriceSeries(mainChart);

    tradeMarkersRef.current = createSeriesMarkers(
      mainSeriesRef.current.candleSeries,
      [],
    );

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
          mode: 0,
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
          mode: 0,
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

    const handleCrosshairMove = (param: any) => {
      const containerWidth = mainEl.clientWidth;
      const containerHeight = mainEl.clientHeight;

      if (
        !param?.point ||
        param.time === undefined ||
        param.point.x < 0 ||
        param.point.y < 0 ||
        param.point.x > containerWidth ||
        param.point.y > containerHeight
      ) {
        setTooltip(null);
        setTradeTooltip(null);
        return;
      }

      const time =
        typeof param.time === "number" ? param.time : Number(param.time);

      const candle = candleByTimeRef.current.get(time);

      if (!candle || !mainSeriesRef.current) {
        setTooltip(null);
        setTradeTooltip(null);
        return;
      }

      const highY = mainSeriesRef.current.candleSeries.priceToCoordinate(
        candle.h,
      );
      const lowY = mainSeriesRef.current.candleSeries.priceToCoordinate(
        candle.l,
      );

      if (highY == null || lowY == null) {
        setTooltip(null);
        setTradeTooltip(null);
        return;
      }

      const tradesAtTime = tradeMarkersByTimeRef.current.get(time) ?? [];

      const candleX = mainChart.timeScale().timeToCoordinate(time as any);

      if (candleX == null) {
        setTooltip(null);
        setTradeTooltip(null);
        return;
      }

      const hoveredTrade = tradesAtTime.find((trade) => {
        if (!mainSeriesRef.current || candleX == null) return false;

        const highY = mainSeriesRef.current.candleSeries.priceToCoordinate(
          candle.h,
        );
        const lowY = mainSeriesRef.current.candleSeries.priceToCoordinate(
          candle.l,
        );

        if (highY == null || lowY == null) return false;

        const markerY = trade.side === "BUY" ? lowY + 22 : highY - 22;

        const xTolerance = 16;
        const yTolerance = 22;

        return (
          Math.abs(param.point.x - candleX) <= xTolerance &&
          Math.abs(param.point.y - markerY) <= yTolerance
        );
      });

      if (hoveredTrade) {
        setTooltip(null);
        setTradeTooltip({
          x: param.point.x,
          y: param.point.y,
          trade: hoveredTrade,
        });
        return;
      }

      setTradeTooltip(null);

      const top = Math.min(highY, lowY);
      const bottom = Math.max(highY, lowY);

      const isNearCandleX = Math.abs(param.point.x - candleX) <= 10;

      const tolerance = 8;
      const isNearCandle =
        isNearCandleX &&
        param.point.y >= top - tolerance &&
        param.point.y <= bottom + tolerance;

      if (!isNearCandle) {
        setTooltip(null);
        setTradeTooltip(null);
        return;
      }

      setTooltip({
        x: param.point.x,
        y: param.point.y,
        candle,
      });
    };

    mainChart.timeScale().subscribeVisibleLogicalRangeChange(syncSubPanes);
    mainChart.subscribeCrosshairMove(handleCrosshairMove);

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
      mainChart.unsubscribeCrosshairMove(handleCrosshairMove);
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
      bollingerSeriesRef.current = null;
      initializedRef.current = false;
      prevCandleLengthRef.current = 0;
      tradeMarkersRef.current = null;
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
        toMovingAverageData(candles, line.period, indicatorSettings.ma.type),
      );
    });

    if (indicatorSettings.bollinger.enabled) {
      if (!bollingerSeriesRef.current) {
        bollingerSeriesRef.current = {
          upper: mainChart.addSeries(LineSeries, {
            color: indicatorSettings.bollinger.upperColor,
            lineWidth: indicatorSettings.bollinger.upperWidth as 1 | 2 | 3 | 4,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          }),
          middle: mainChart.addSeries(LineSeries, {
            color: indicatorSettings.bollinger.middleColor,
            lineWidth: indicatorSettings.bollinger.middleWidth as 1 | 2 | 3 | 4,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          }),
          lower: mainChart.addSeries(LineSeries, {
            color: indicatorSettings.bollinger.lowerColor,
            lineWidth: indicatorSettings.bollinger.lowerWidth as 1 | 2 | 3 | 4,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          }),
        };
      }

      const bollingerSeries = bollingerSeriesRef.current;

      bollingerSeries.upper.applyOptions({
        color: indicatorSettings.bollinger.upperColor,
        lineWidth: indicatorSettings.bollinger.upperWidth as 1 | 2 | 3 | 4,
      });

      bollingerSeries.middle.applyOptions({
        color: indicatorSettings.bollinger.middleColor,
        lineWidth: indicatorSettings.bollinger.middleWidth as 1 | 2 | 3 | 4,
      });

      bollingerSeries.lower.applyOptions({
        color: indicatorSettings.bollinger.lowerColor,
        lineWidth: indicatorSettings.bollinger.lowerWidth as 1 | 2 | 3 | 4,
      });

      const bollinger = calculateBollinger(
        candles,
        indicatorSettings.bollinger.period,
        indicatorSettings.bollinger.multiplier,
      );

      bollingerSeries.upper.setData(bollinger.upper);
      bollingerSeries.middle.setData(bollinger.middle);
      bollingerSeries.lower.setData(bollinger.lower);
    } else {
      const existingBollingerSeries = bollingerSeriesRef.current;

      if (existingBollingerSeries) {
        mainChart.removeSeries(existingBollingerSeries.upper);
        mainChart.removeSeries(existingBollingerSeries.middle);
        mainChart.removeSeries(existingBollingerSeries.lower);

        bollingerSeriesRef.current = null;
      }
    }

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

  useEffect(() => {
    if (!tradeMarkersRef.current) return;

    tradeMarkersRef.current.setMarkers(
      tradeMarkers.map((marker) => ({
        time: Math.floor(marker.time / 1000) as any,
        position: marker.side === "BUY" ? "belowBar" : "aboveBar",
        color: marker.side === "BUY" ? "#22c55e" : "#ef4444",
        shape: marker.side === "BUY" ? "arrowUp" : "arrowDown",
        text: "",
      })),
    );
  }, [tradeMarkers]);

  return (
    <div className="relative h-full w-full">
      <div className="mb-2 flex flex-wrap items-center gap-2 px-1 text-[11px] text-muted-foreground">
        {indicatorSettings.volume.enabled && <span>Volume</span>}

        {indicatorSettings.ma.enabled &&
          indicatorSettings.ma.lines.map((line) => {
            const prefix =
              indicatorSettings.ma.type === "EMA"
                ? "EMA"
                : indicatorSettings.ma.type === "WMA"
                  ? "WMA"
                  : "MA";

            return (
              <span key={line.period} style={{ color: line.color }}>
                {prefix}
                {line.period}
              </span>
            );
          })}

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

        {indicatorSettings.bollinger.enabled && (
          <span style={{ color: indicatorSettings.bollinger.upperColor }}>
            BB {indicatorSettings.bollinger.period}
          </span>
        )}
      </div>

      <div
        ref={mainContainerRef}
        className="w-full"
        style={{ height: mainHeight }}
      />

      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 w-[150px] rounded-lg border border-border/50 bg-background/95 px-3 py-2 text-[11px] shadow-xl backdrop-blur"
          style={tooltipStyle}
        >
          {formatTooltipDate(tooltip.candle.t)}

          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">
            <span>시가</span>
            <span className="text-right text-foreground">
              {tooltip.candle.o.toLocaleString()}
            </span>

            <span>고가</span>
            <span className="text-right text-red-400">
              {tooltip.candle.h.toLocaleString()}
            </span>

            <span>저가</span>
            <span className="text-right text-blue-400">
              {tooltip.candle.l.toLocaleString()}
            </span>

            <span>종가</span>
            <span className="text-right text-foreground">
              {tooltip.candle.c.toLocaleString()}
            </span>

            <span>거래량</span>
            <span className="text-right text-foreground">
              {tooltip.candle.v.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {tradeTooltip && (
        <div
          className="pointer-events-none absolute z-30 w-[140px] rounded-lg border border-border/50 bg-background/95 px-3 py-2 text-[11px] shadow-xl backdrop-blur"
          style={tradeTooltipStyle}
        >
          <div
            className={
              tradeTooltip.trade.side === "BUY"
                ? "font-semibold text-green-400"
                : "font-semibold text-red-400"
            }
          >
            {tradeTooltip.trade.side}
            {(tradeTooltip.trade.count ?? 1) > 1
              ? ` ×${tradeTooltip.trade.count}`
              : ""}
          </div>

          <div className="mt-1 flex justify-between text-muted-foreground">
            <span>가격</span>
            <span className="text-foreground">
              {tradeTooltip.trade.price.toLocaleString()}
            </span>
          </div>

          {tradeTooltip.trade.qty && (
            <div className="flex justify-between text-muted-foreground">
              <span>수량</span>
              <span className="text-foreground">
                {tradeTooltip.trade.qty}주
              </span>
            </div>
          )}
        </div>
      )}

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
