import { useEffect, useMemo, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  type LineData,
} from "lightweight-charts";
import type {
  Candle,
  IndicatorSettings,
  MaLineSetting,
} from "@/types/training";

type Props = {
  candles: Candle[];
  height?: number;
  indicatorSettings?: IndicatorSettings;
};

const DEFAULT_INDICATORS: IndicatorSettings = {
  volume: {
    enabled: true,
  },
  ma: {
    enabled: true,
    lines: [
      { period: 5, color: "#facc15", width: 1 },
      { period: 20, color: "#38bdf8", width: 1 },
      { period: 60, color: "#a78bfa", width: 1 },
      { period: 120, color: "#22c55e", width: 1 },
    ],
  },
  bollinger: {
    enabled: false,
    disabled: true,
  },
  ichimoku: {
    enabled: false,
    disabled: true,
  },
  volumeProfile: {
    enabled: false,
    disabled: true,
  },
  rsi: {
    enabled: false,
    disabled: true,
  },
  macd: {
    enabled: false,
    disabled: true,
  },
};

function toCandlestickData(candles: Candle[]): CandlestickData[] {
  return candles
    .map((x) => ({
      time: Math.floor(x.t / 1000),
      open: x.o,
      high: x.h,
      low: x.l,
      close: x.c,
    }))
    .sort((a, b) => Number(a.time) - Number(b.time));
}

function toVolumeData(candles: Candle[]): HistogramData[] {
  return candles
    .map((x) => ({
      time: Math.floor(x.t / 1000),
      value: x.v,
      color: x.c >= x.o ? "rgba(34,197,94,0.28)" : "rgba(239,68,68,0.28)",
    }))
    .sort((a, b) => Number(a.time) - Number(b.time));
}

function toMovingAverageData(candles: Candle[], period: number): LineData[] {
  const sorted = candles.slice().sort((a, b) => a.t - b.t);
  const result: LineData[] = [];

  for (let i = period - 1; i < sorted.length; i++) {
    const window = sorted.slice(i - period + 1, i + 1);
    const avg = window.reduce((sum, c) => sum + c.c, 0) / period;

    result.push({
      time: Math.floor(sorted[i].t / 1000),
      value: avg,
    });
  }

  return result;
}

function normalizeMaLines(lines: MaLineSetting[]): MaLineSetting[] {
  const map = new Map<number, MaLineSetting>();

  lines.forEach((line) => {
    if (!Number.isFinite(line.period) || line.period <= 0) return;

    map.set(line.period, {
      period: line.period,
      color: line.color || "#facc15",
      width: line.width || 1,
    });
  });

  return Array.from(map.values()).sort((a, b) => a.period - b.period);
}

export default function CandleChart({
  candles,
  height = 520,
  indicatorSettings = DEFAULT_INDICATORS,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<typeof CandlestickSeries> | null>(
    null,
  );
  const volumeSeriesRef = useRef<ISeriesApi<typeof HistogramSeries> | null>(
    null,
  );
  const maSeriesMapRef = useRef<Record<number, ISeriesApi<typeof LineSeries>>>(
    {},
  );

  const mountedRef = useRef(false);

  const candleData = useMemo(() => toCandlestickData(candles), [candles]);
  const volumeData = useMemo(() => toVolumeData(candles), [candles]);

  const maLines = useMemo(() => {
    if (!indicatorSettings.ma.enabled) return [];
    return normalizeMaLines(indicatorSettings.ma.lines);
  }, [indicatorSettings.ma.enabled, indicatorSettings.ma.lines]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (chartRef.current || mountedRef.current) return;

    mountedRef.current = true;

    const chart = createChart(containerRef.current, {
      height,
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

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "volume",
      lastValueVisible: false,
      priceLineVisible: false,
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: {
        top: 0.78,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const ro = new ResizeObserver(() => {
      if (!containerRef.current) return;

      chart.applyOptions({
        width: containerRef.current.clientWidth,
        height,
      });
    });

    ro.observe(containerRef.current);

    chart.applyOptions({
      width: containerRef.current.clientWidth,
      height,
    });

    return () => {
      ro.disconnect();
      chart.remove();

      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      maSeriesMapRef.current = {};
      mountedRef.current = false;
    };
  }, [height]);

  useEffect(() => {
    if (!chartRef.current) return;

    candleSeriesRef.current?.setData(candleData);

    volumeSeriesRef.current?.setData(
      indicatorSettings.volume.enabled ? volumeData : [],
    );

    chartRef.current.applyOptions({
      rightPriceScale: {
        scaleMargins: {
          top: 0.08,
          bottom: indicatorSettings.volume.enabled ? 0.22 : 0.08,
        },
      },
    });

    const currentPeriods = new Set(maLines.map((line) => line.period));

    Object.keys(maSeriesMapRef.current).forEach((key) => {
      const period = Number(key);

      if (!currentPeriods.has(period)) {
        chartRef.current?.removeSeries(maSeriesMapRef.current[period]);
        delete maSeriesMapRef.current[period];
      }
    });

    maLines.forEach((line) => {
      if (!chartRef.current) return;

      if (!maSeriesMapRef.current[line.period]) {
        maSeriesMapRef.current[line.period] = chartRef.current.addSeries(
          LineSeries,
          {
            color: line.color,
            lineWidth: line.width as 1 | 2 | 3 | 4,
            priceLineVisible: false,
            lastValueVisible: false,
            priceScaleId: "right",
          },
        );
      }

      maSeriesMapRef.current[line.period].applyOptions({
        color: line.color,
        lineWidth: line.width as 1 | 2 | 3 | 4,
      });

      maSeriesMapRef.current[line.period].setData(
        toMovingAverageData(candles, line.period),
      );
    });

    chartRef.current.timeScale().fitContent();
  }, [
    candleData,
    volumeData,
    candles,
    indicatorSettings.volume.enabled,
    maLines,
  ]);

  return (
    <div className="w-full rounded-2xl border border-border/60 bg-background/20 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2 px-1 text-[11px] text-muted-foreground">
        {indicatorSettings.volume.enabled && <span>Volume</span>}

        {maLines.map((line) => (
          <span key={line.period} style={{ color: line.color }}>
            MA{line.period}
          </span>
        ))}
      </div>

      <div ref={containerRef} className="w-full" style={{ height }} />
    </div>
  );
}
