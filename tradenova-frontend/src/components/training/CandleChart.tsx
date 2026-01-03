// src/components/training/CandleChart.tsx
import { useEffect, useMemo, useRef } from "react";
import {
    createChart,
    CandlestickSeries, // ✅ v5: 캔들 시리즈는 addSeries에 이 “시리즈 타입”을 넘김
    type IChartApi,
    type ISeriesApi,
    type CandlestickData,
} from "lightweight-charts";
import type { Candle } from "@/api/trainingApi";

type Props = {
    candles: Candle[];
};

function toCandlestickData(candles: Candle[]): CandlestickData[] {
    /**
     * lightweight-charts는 time을 보통 “초(second)” 기반으로 받는다.
     * - 백엔드/우리 DTO: t = epoch millis 일 가능성이 높음
     * - 그래서 ms → sec 변환 ( / 1000 )
     *
     * 만약 t가 이미 초 단위라면 /1000 제거하면 됨.
     */
    return candles
        .map((x) => ({
            time: Math.floor(x.t / 1000),
            open: x.o,
            high: x.h,
            low: x.l,
            close: x.c,
        }))
        // 시간 오름차순 정렬 (차트 라이브러리 안정성/일관성)
        .sort((a, b) => Number(a.time) - Number(b.time));
}

export default function CandleChart({ candles }: Props) {
    // 차트가 붙을 DOM 컨테이너
    const containerRef = useRef<HTMLDivElement | null>(null);

    // 차트 인스턴스(한 번 만들고 유지)
    const chartRef = useRef<IChartApi | null>(null);

    // 캔들 시리즈 인스턴스
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    // candles가 바뀔 때만 변환해서 메모이징
    const data = useMemo(() => toCandlestickData(candles), [candles]);

    useEffect(() => {
        if (!containerRef.current) return;

        /**
         * 1) 차트 생성
         * - createChart는 차트 객체(IChartApi)를 반환
         * - v5에서 width는 안 넣어도 되지만, 리사이즈 대응을 위해 나중에 applyOptions로 갱신
         */
        const chart = createChart(containerRef.current, {
            height: 520,

            layout: {
                attributionLogo: false, // ✅ 이게 정답 (기본 true라서 로고 뜸)
                background: { color: "transparent" },
                textColor: "#9CA3AF",
            },

            grid: {
                vertLines: { color: "rgba(255,255,255,0.06)" },
                horzLines: { color: "rgba(255,255,255,0.06)" },
            },
            rightPriceScale: { borderColor: "rgba(255,255,255,0.12)" },
            timeScale: { borderColor: "rgba(255,255,255,0.12)" },
            crosshair: { mode: 1 },
        });


        /**
         * 2) ✅ 캔들 시리즈 추가 (v5 방식)
         * - v4까지는 chart.addCandlestickSeries()가 있었는데
         * - v5부터는 addSeries(SeriesType, options) 형태로 변경됨
         */
        const series = chart.addSeries(CandlestickSeries, {
            upColor: "#22c55e",
            downColor: "#ef4444",
            borderUpColor: "#22c55e",
            borderDownColor: "#ef4444",
            wickUpColor: "#22c55e",
            wickDownColor: "#ef4444",
        });

        // ref에 저장 (다른 useEffect에서 재사용)
        chartRef.current = chart;
        seriesRef.current = series;

        /**
         * 3) 리사이즈 대응
         * - 컨테이너 너비가 바뀌면 차트 width도 갱신
         */
        const ro = new ResizeObserver(() => {
            if (!containerRef.current) return;
            chart.applyOptions({ width: containerRef.current.clientWidth });
        });
        ro.observe(containerRef.current);

        // 초기 width 세팅
        chart.applyOptions({ width: containerRef.current.clientWidth });

        /**
         * 4) cleanup
         * - 컴포넌트 unmount 시 리소스 해제
         */
        return () => {
            ro.disconnect();
            chart.remove();
            chartRef.current = null;
            seriesRef.current = null;
        };
    }, []);

    useEffect(() => {
        /**
         * 데이터 주입
         * - 차트/시리즈가 만들어진 후에만 setData 가능
         */
        if (!seriesRef.current) return;

        seriesRef.current.setData(data);
        chartRef.current?.timeScale().fitContent();
    }, [data]);

    return (
        <div className="w-full rounded-2xl border border-border/60 bg-background/20 p-3">
            {/* 
        컨테이너 div의 높이가 0이면 차트가 제대로 안 보일 수 있어서
        안전하게 height를 명시해줌(차트 옵션 height와 맞춤)
      */}
            <div ref={containerRef} className="w-full" style={{ height: 520 }} />
        </div>
    );
}
