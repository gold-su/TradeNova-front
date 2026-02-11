// src/components/training/CandleChart.tsx
import { useEffect, useMemo, useRef } from "react";
import {
    createChart,
    CandlestickSeries,
    type IChartApi,
    type ISeriesApi,
    type CandlestickData,
} from "lightweight-charts";
import type { Candle } from "@/types/training";

type Props = {
    candles: Candle[];
    height?: number;
};

function toCandlestickData(candles: Candle[]): CandlestickData[] {
    return candles
        .map((x) => ({
            time: Math.floor(x.t / 1000), // epoch millis -> sec
            open: x.o,
            high: x.h,
            low: x.l,
            close: x.c,
        }))
        .sort((a, b) => Number(a.time) - Number(b.time));
}

export default function CandleChart({ candles, height = 520 }: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<typeof CandlestickSeries> | null>(null);

    // StrictMode(Dev)에서 mount/unmount 2번 되는 경우 가드용
    const mountedRef = useRef(false);

    const data = useMemo(() => toCandlestickData(candles), [candles]);

    useEffect(() => {
        if (!containerRef.current) return;

        // 이미 차트가 만들어졌으면 재생성 방지
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
            },
            timeScale: {
                borderColor: "rgba(255,255,255,0.12)",
                rightOffset: 5,
                fixLeftEdge: true,
                fixRightEdge: true,
            },
            crosshair: { mode: 1 },
        });

        const series = chart.addSeries(CandlestickSeries, {
            upColor: "#22c55e",
            downColor: "#ef4444",
            borderUpColor: "#22c55e",
            borderDownColor: "#ef4444",
            wickUpColor: "#22c55e",
            wickDownColor: "#ef4444",
        });

        chartRef.current = chart;
        seriesRef.current = series;

        const ro = new ResizeObserver(() => {
            if (!containerRef.current) return;
            chart.applyOptions({ width: containerRef.current.clientWidth, height });
        });
        ro.observe(containerRef.current);

        // 초기 사이즈 적용
        chart.applyOptions({ width: containerRef.current.clientWidth, height });

        return () => {
            ro.disconnect();
            chart.remove();
            chartRef.current = null;
            seriesRef.current = null;
            mountedRef.current = false;
        };
    }, [height]);

    useEffect(() => {
        if (!seriesRef.current) return;

        seriesRef.current.setData(data.length ? data : []);
        chartRef.current?.timeScale().fitContent();
    }, [data]);

    return (
        <div className="w-full rounded-2xl border border-border/60 bg-background/20 p-3">
            <div ref={containerRef} className="w-full" style={{ height }} />
        </div>
    );
}