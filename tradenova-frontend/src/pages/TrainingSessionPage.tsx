import { useMemo, useState } from "react";
import CandleChart from "@/components/training/CandleChart";
import { trainingApi } from "@/api/trainingApi";
import type {
  Candle,
  CreateSessionResponse,
  ProgressResponse,
  TradeResponse,
  TrainingChartDto,
  TrainingStatus,
} from "@/types/training";

type CandlesMap = Record<number, Candle[]>;
type ProgressMap = Record<number, ProgressResponse>;

function pickCharts(res: CreateSessionResponse): TrainingChartDto[] {
  if ("charts" in res) return res.charts;

  // 단일 응답 호환
  return [
    {
      chartId: res.chartId,
      chartIndex: res.chartIndex,
      accountId: res.accountId,
      symbolId: res.symbolId,
      symbolTicker: res.symbolTicker,
      symbolName: res.symbolName,
      bars: res.bars,
      progressIndex: res.progressIndex,
      startDate: res.startDate,
      endDate: res.endDate,
      status: res.status,
    },
  ];
}

const emptyProgress = (
  chartId: number,
  status: TrainingStatus,
  price = 0
): ProgressResponse => ({
  chartId,
  progressIndex: 0,
  currentPrice: price,
  status,
  cashBalance: 0,
  positionQty: 0,
  avgPrice: 0,
  autoExited: false,
  reason: null,
});

export default function TrainingSessionPage() {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [status, setStatus] = useState<TrainingStatus>("IN_PROGRESS");

  const [charts, setCharts] = useState<TrainingChartDto[]>([]);
  const [activeChartId, setActiveChartId] = useState<number | null>(null);

  const [candlesByChart, setCandlesByChart] = useState<CandlesMap>({});
  const [progressByChart, setProgressByChart] = useState<ProgressMap>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeCandles = useMemo(() => {
    if (!activeChartId) return [];
    return candlesByChart[activeChartId] ?? [];
  }, [activeChartId, candlesByChart]);

  const activeProgress = useMemo(() => {
    if (!activeChartId) return null;
    return progressByChart[activeChartId] ?? null;
  }, [activeChartId, progressByChart]);

  const visibleCandles = useMemo(() => {
    if (!activeProgress) return activeCandles;
    const end = Math.min(
      activeProgress.progressIndex + 1,
      activeCandles.length
    );
    return activeCandles.slice(0, end);
  }, [activeCandles, activeProgress]);

  const disabled = !activeChartId || status === "COMPLETED" || loading;

  const applyProgress = (res: ProgressResponse) => {
    setProgressByChart((prev) => ({
      ...prev,
      [res.chartId]: res,
    }));
    setStatus(res.status);
  };

  const applyTrade = (res: TradeResponse) => {
    setProgressByChart((prev) => {
      const cur =
        prev[res.chartId] ??
        emptyProgress(res.chartId, status, Number(res.executedPrice));

      return {
        ...prev,
        [res.chartId]: {
          ...cur,
          cashBalance: res.cashBalance,
          positionQty: res.positionQty,
          avgPrice: res.avgPrice,
          currentPrice: Number(res.executedPrice),
        },
      };
    });
  };

  const onCreateSession = async () => {
    setError(null);
    setLoading(true);

    try {
      const created = await trainingApi.createSession({
        accountId: 3, // TODO: default accountId로 교체
        mode: "RANDOM",
        bars: 120,
        chartCount: 4,
      });

      const cs = pickCharts(created);

      setSessionId(created.sessionId);
      setCharts(cs);
      setStatus(created.status);

      // 첫 차트 선택
      const first = cs
        .slice()
        .sort((a, b) => a.chartIndex - b.chartIndex)[0];

      setActiveChartId(first?.chartId ?? null);

      // 캔들 병렬 로딩
      const pairs = await Promise.all(
        cs.map(async (c) => {
          const candles = await trainingApi.getChartCandles(c.chartId);
          return [c.chartId, candles] as const;
        })
      );

      const map: CandlesMap = {};
      pairs.forEach(([chartId, candles]) => {
        map[chartId] = candles;
      });

      setCandlesByChart(map);

      // progress 초기화
      setProgressByChart(() => {
        const next: ProgressMap = {};
        cs.forEach((c) => {
          next[c.chartId] = {
            chartId: c.chartId,
            progressIndex: c.progressIndex ?? 0,
            currentPrice: 0,
            status: c.status,
            cashBalance: 0,
            positionQty: 0,
            avgPrice: 0,
            autoExited: false,
            reason: null,
          };
        });
        return next;
      });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "세션 생성 실패");
    } finally {
      setLoading(false);
    }
  };

  const onNext = async () => {
    if (!activeChartId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await trainingApi.next(activeChartId);
      applyProgress(res);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "NEXT 실패");
    } finally {
      setLoading(false);
    }
  };

  const onBuy = async () => {
    if (!activeChartId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await trainingApi.buy(activeChartId, { qty: 1 });
      applyTrade(res);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "BUY 실패");
    } finally {
      setLoading(false);
    }
  };

  const onSell = async () => {
    if (!activeChartId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await trainingApi.sell(activeChartId, { qty: 1 });
      applyTrade(res);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "SELL 실패");
    } finally {
      setLoading(false);
    }
  };

  const onSellAll = async () => {
    if (!activeChartId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await trainingApi.sellAll(activeChartId);
      applyTrade(res);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "SELL ALL 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-56px)] w-full flex overflow-hidden">
      {/* LEFT */}
      <aside className="w-72 border-r bg-muted/10 p-4 flex flex-col gap-4">
        <div className="text-sm">
          <div className="font-semibold">Session</div>
          <div className="text-muted-foreground">id: {sessionId ?? "-"}</div>
          <div className="text-muted-foreground">status: {status}</div>
        </div>

        <div>
          <div className="text-sm font-semibold mb-2">Charts</div>
          <div className="flex flex-col gap-2">
            {charts
              .slice()
              .sort((a, b) => a.chartIndex - b.chartIndex)
              .map((c) => (
                <button
                  key={c.chartId}
                  onClick={() => setActiveChartId(c.chartId)}
                  className={[
                    "text-left rounded-md px-3 py-2 text-sm border transition",
                    activeChartId === c.chartId
                      ? "border-primary/60 bg-primary/10 font-semibold"
                      : "border-border/60 hover:bg-muted/30",
                  ].join(" ")}
                >
                  <div>Chart {c.chartIndex + 1}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.symbolTicker} · {c.symbolName}
                  </div>
                </button>
              ))}
          </div>
        </div>

        <button
          onClick={onCreateSession}
          disabled={loading}
          className="mt-auto rounded-lg border border-border/60 px-3 py-2 text-sm hover:bg-muted/30 disabled:opacity-60"
        >
          {loading ? "세션 생성 중..." : "세션 시작(4차트)"}
        </button>
      </aside>

      {/* CENTER */}
      <main className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">
              Active Chart: {activeChartId ?? "-"}
            </div>
            <div className="text-sm text-muted-foreground">
              progress: {activeProgress?.progressIndex ?? "-"} /{" "}
              {activeCandles.length
                ? activeCandles.length - 1
                : "-"}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Price:{" "}
            <b className="text-foreground">
              {activeProgress?.currentPrice ?? "-"}
            </b>
          </div>
        </div>

        {error && (
          <div className="mb-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          {visibleCandles.length > 0 ? (
            <CandleChart candles={visibleCandles} height={520} />
          ) : (
            <div className="h-full rounded-2xl border border-border/60 bg-background/20 flex items-center justify-center text-muted-foreground">
              세션 시작 후 차트가 표시됩니다.
            </div>
          )}
        </div>
      </main>

      {/* RIGHT */}
      <aside className="w-80 border-l p-6 overflow-y-auto bg-muted/10">
        <div className="mb-6">
          <div className="text-sm font-semibold mb-2">
            Account Snapshot
          </div>
          <div className="rounded-xl border border-border/60 bg-background/20 p-3 text-sm space-y-1">
            <div>Cash: <b>{activeProgress?.cashBalance ?? "-"}</b></div>
            <div>Qty: <b>{activeProgress?.positionQty ?? "-"}</b></div>
            <div>Avg: <b>{activeProgress?.avgPrice ?? "-"}</b></div>
          </div>
        </div>

        <div className="mb-8">
          <div className="text-sm font-semibold mb-3">Actions</div>
          <div className="flex flex-col gap-2">
            <button disabled={disabled} onClick={onNext} className="rounded-lg border px-4 py-2 hover:bg-muted/30 disabled:opacity-60">
              NEXT (1)
            </button>
            <button disabled={disabled} onClick={onBuy} className="rounded-lg border px-4 py-2 hover:bg-muted/30 disabled:opacity-60">
              BUY (qty=1)
            </button>
            <button disabled={disabled} onClick={onSell} className="rounded-lg border px-4 py-2 hover:bg-muted/30 disabled:opacity-60">
              SELL (qty=1)
            </button>
            <button disabled={disabled} onClick={onSellAll} className="rounded-lg border px-4 py-2 hover:bg-muted/30 disabled:opacity-60">
              SELL ALL
            </button>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold mb-3">Notes</div>
          <textarea
            placeholder="복기 메모..."
            className="w-full min-h-[180px] rounded-md border border-border/60 p-3 text-sm bg-background"
          />
        </div>
      </aside>
    </div>
  );
}