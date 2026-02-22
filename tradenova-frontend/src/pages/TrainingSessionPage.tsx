import { useMemo, useState } from "react";
import { trainingApi } from "@/api/trainingApi";
import CandleChart from "@/components/training/CandleChart";
import type {
  Candle,
  SessionProgressResponse,
  TradeResponse,
  TrainingStatus,
} from "@/types/training";

export default function TrainingSessionPage() {
  // ===== Core State =====
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);

  const [progressIndex, setProgressIndex] = useState<number>(0);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [cashBalance, setCashBalance] = useState<number | null>(null);
  const [positionQty, setPositionQty] = useState<number | null>(null);
  const [avgPrice, setAvgPrice] = useState<number | null>(null);
  const [status, setStatus] = useState<TrainingStatus>("IN_PROGRESS");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 멀티 차트 느낌용
  const [activeChartIndex, setActiveChartIndex] = useState<number>(0);
  const chartSlots = [0, 1, 2, 3]; // PREMIUM 기준 4개

  const visibleCandles = useMemo(() => {
    if (!candles.length) return [];
    const end = Math.min(progressIndex + 1, candles.length);
    return candles.slice(0, end);
  }, [candles, progressIndex]);

  const disabled = !sessionId || status === "COMPLETED" || loading;

  const applyProgressSnapshot = (res: SessionProgressResponse) => {
    setProgressIndex(res.progressIndex);
    setCurrentPrice(res.currentPrice);
    setCashBalance(res.cashBalance);
    setPositionQty(res.positionQty);
    setAvgPrice(res.avgPrice);
    setStatus(res.status);
  };

  const applyTradeSnapshot = (res: TradeResponse) => {
    setCashBalance(res.cashBalance);
    setPositionQty(res.positionQty);
    setAvgPrice(res.avgPrice);
    setCurrentPrice(res.executedPrice);
  };

  const onCreateSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const created = await trainingSessionApi.createSession({
        accountId: 3,
        mode: "RANDOM",
        bars: 100,
      });

      setSessionId(created.sessionId);
      setStatus(created.status);

      const cs = await trainingSessionApi.getSessionCandles(created.sessionId);
      setCandles(cs);
      setProgressIndex(29); // 🔥 초기 30봉 공개
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "세션 생성 실패");
    } finally {
      setLoading(false);
    }
  };

  const onNext = async () => {
    if (!sessionId) return;
    const res = await trainingSessionApi.next(sessionId);
    applyProgressSnapshot(res);
  };

  const onBuy = async () => {
    if (!sessionId) return;
    const res = await trainingSessionApi.buy(sessionId, 1);
    applyTradeSnapshot(res);
  };

  return (
    <div className="h-[calc(100vh-80px)] w-full flex overflow-hidden">
      {/* ===== LEFT SIDEBAR ===== */}
      <aside className="w-64 border-r bg-muted/20 p-4 flex flex-col gap-6">
        <div>
          <h2 className="text-sm font-semibold mb-2">계좌</h2>
          <div className="rounded-lg border p-3 text-sm">
            <div>
              Cash: <b>{cashBalance ?? "-"}</b>
            </div>
            <div>
              Position: <b>{positionQty ?? "-"}</b>
            </div>
            <div>
              Avg: <b>{avgPrice ?? "-"}</b>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-2">차트 목록</h2>
          <div className="flex flex-col gap-2">
            {chartSlots.map((i) => (
              <button
                key={i}
                onClick={() => setActiveChartIndex(i)}
                className={`text-left rounded-md px-3 py-2 text-sm border transition 
                ${
                  activeChartIndex === i
                    ? "border-red-500 bg-red-50 font-semibold"
                    : "border-border hover:bg-muted"
                }`}
              >
                Chart {i + 1}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onCreateSession}
          className="mt-auto rounded-lg border px-3 py-2 text-sm hover:bg-muted"
        >
          세션 시작
        </button>
      </aside>

      {/* ===== CENTER CHART ===== */}
      <main className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-bold">
            Active Chart: {activeChartIndex + 1}
          </h1>

          <span className="text-sm opacity-70">Status: {status}</span>
        </div>

        <div className="flex-1 rounded-xl border p-4 overflow-hidden">
          {visibleCandles.length > 0 ? (
            <CandleChart candles={visibleCandles} height={520} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              세션 시작 후 차트가 표시됩니다.
            </div>
          )}
        </div>
      </main>

      {/* ===== RIGHT PANEL ===== */}
      <aside className="w-80 border-l p-6 overflow-y-auto bg-muted/10">
        {/* 매매 영역 */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold mb-3">주문</h2>
          <div className="flex flex-col gap-3">
            <button
              disabled={disabled}
              onClick={onNext}
              className="rounded-lg border px-4 py-2 hover:bg-muted"
            >
              NEXT (1봉)
            </button>

            <button
              disabled={disabled}
              onClick={onBuy}
              className="rounded-lg border px-4 py-2 hover:bg-muted"
            >
              BUY
            </button>
          </div>
        </div>

        {/* 리스크 룰 영역 */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold mb-3">리스크 설정</h2>
          <div className="flex flex-col gap-3 text-sm">
            <input
              placeholder="손절가"
              className="rounded-md border px-3 py-2 bg-background"
            />
            <input
              placeholder="익절가"
              className="rounded-md border px-3 py-2 bg-background"
            />
            <button className="rounded-md border px-3 py-2 hover:bg-muted">
              적용
            </button>
          </div>
        </div>

        {/* 리포트 영역 */}
        <div>
          <h2 className="text-sm font-semibold mb-3">트레이딩 리포트</h2>
          <textarea
            placeholder="이번 매매에 대한 분석을 기록하세요..."
            className="w-full min-h-[200px] rounded-md border p-3 text-sm bg-background"
          />
        </div>
      </aside>
    </div>
  );
}
