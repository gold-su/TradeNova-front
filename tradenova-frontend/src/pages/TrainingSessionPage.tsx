import { useEffect, useMemo, useState } from "react";
import CandleChart from "@/components/training/CandleChart";
import { trainingApi } from "@/api/trainingApi";
import http from "@/api/http";
import type {
  Candle,
  CreateSessionResponse,
  ProgressResponse,
  TradeResponse,
  TrainingChartDto,
  TrainingStatus,
} from "@/types/training";

// ===== Types =====
type CandlesMap = Record<number, Candle[]>;
type ProgressMap = Record<number, ProgressResponse>;

type PaperAccountDto = {
  id: number;
  name: string;
  description?: string | null;
  cashBalance: number;
  isDefault?: boolean; // 백엔드 필드명 다르면 아래 매핑만 바꾸면 됨
};

// ===== Utils =====
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

function n(v: number | null | undefined) {
  if (v === null || v === undefined) return "-";
  return new Intl.NumberFormat("ko-KR").format(v);
}
function n2(v: number | null | undefined) {
  if (v === null || v === undefined) return "-";
  return new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 }).format(v);
}

// ===== Component =====
export default function TrainingSessionPage() {
  // viewMode: "grid" = 4분할, "single" = 확대
  const [viewMode, setViewMode] = useState<"grid" | "single">("grid");

  // grid에서 NEXT를 동시 진행할지
  const [syncNext, setSyncNext] = useState<boolean>(true);

  // session
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [status, setStatus] = useState<TrainingStatus>("IN_PROGRESS");

  // accounts
  const [accounts, setAccounts] = useState<PaperAccountDto[]>([]);
  const [accountId, setAccountId] = useState<number | null>(null);

  // charts
  const [charts, setCharts] = useState<TrainingChartDto[]>([]);
  const [activeChartId, setActiveChartId] = useState<number | null>(null);

  // data maps
  const [candlesByChart, setCandlesByChart] = useState<CandlesMap>({});
  const [progressByChart, setProgressByChart] = useState<ProgressMap>({});

  // ui
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== Load accounts on mount =====
  useEffect(() => {
    (async () => {
      try {
        const list = await http.get<PaperAccountDto[]>("/api/paper-accounts").then((r) => r.data);
        setAccounts(list);

        // default 계좌 자동 선택 (필드명이 다르면 여기만 수정)
        const def = list.find((a) => a.isDefault) ?? list[0];
        setAccountId(def?.id ?? null);
      } catch (e: any) {
        // 계좌 API 없거나 토큰 문제면 여기서 막힘
        console.warn(e);
      }
    })();
  }, []);

  // ===== Derived =====
  const activeCandles = useMemo(() => {
    if (!activeChartId) return [];
    return candlesByChart[activeChartId] ?? [];
  }, [activeChartId, candlesByChart]);

  const activeProgress = useMemo(() => {
    if (!activeChartId) return null;
    return progressByChart[activeChartId] ?? null;
  }, [activeChartId, progressByChart]);

  const visibleActiveCandles = useMemo(() => {
    if (!activeProgress) return activeCandles;
    const end = Math.min(activeProgress.progressIndex + 1, activeCandles.length);
    return activeCandles.slice(0, end);
  }, [activeCandles, activeProgress]);

  const disabled = !activeChartId || status === "COMPLETED" || loading;

  const sortedCharts = useMemo(
    () => charts.slice().sort((a, b) => a.chartIndex - b.chartIndex),
    [charts]
  );

  // ===== Apply snapshot =====
  const applyProgress = (res: ProgressResponse) => {
    setProgressByChart((prev) => ({ ...prev, [res.chartId]: res }));
    setStatus(res.status);
  };

  const applyTrade = (res: TradeResponse) => {
    setProgressByChart((prev) => {
      const cur = prev[res.chartId] ?? emptyProgress(res.chartId, status, Number(res.executedPrice));
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

  // ===== Actions =====
  const onCreateSession = async () => {
    setError(null);

    if (!accountId) {
      setError("먼저 계좌를 선택/생성해줘.");
      return;
    }

    setLoading(true);
    try {
      const created = await trainingApi.createSession({
        accountId,
        mode: "RANDOM",
        bars: 100,
        chartCount: 4,
      });

      const cs = pickCharts(created);

      setSessionId(created.sessionId);
      setCharts(cs);
      setStatus(created.status);

      // 첫 차트 선택
      const first = cs.slice().sort((a, b) => a.chartIndex - b.chartIndex)[0];
      setActiveChartId(first?.chartId ?? null);

      // candles 병렬 로딩
      const pairs = await Promise.all(
        cs.map(async (c) => {
          const candles = await trainingApi.getChartCandles(c.chartId);
          return [c.chartId, candles] as const;
        })
      );

      const map: CandlesMap = {};
      pairs.forEach(([chartId, candles]) => (map[chartId] = candles));
      setCandlesByChart(map);

      // progress 초기화(표시용)
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
      const msg = e?.response?.data?.message ?? "훈련 세션 생성에 실패했습니다.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // NEXT: viewMode/syncNext 정책 반영
  const onNext = async () => {
    if (!activeChartId) return;
    setLoading(true);
    setError(null);

    try {
      // 단일 보기면 무조건 active만
      if (viewMode === "single") {
        const res = await trainingApi.next(activeChartId);
        applyProgress(res);
        return;
      }

      // grid 보기
      if (syncNext) {
        // 4개 동시 진행
        const ids = sortedCharts.map((c) => c.chartId);
        const results = await Promise.all(ids.map((id) => trainingApi.next(id)));
        results.forEach(applyProgress);
      } else {
        // 선택 차트만 진행
        const res = await trainingApi.next(activeChartId);
        applyProgress(res);
      }
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

  // ===== Grid render helpers =====
  const renderTile = (c: TrainingChartDto) => {
    const candles = candlesByChart[c.chartId] ?? [];
    const prog = progressByChart[c.chartId] ?? null;

    const visible = prog ? candles.slice(0, Math.min(prog.progressIndex + 1, candles.length)) : candles;

    return (
      <button
        key={c.chartId}
        onClick={() => {
          setActiveChartId(c.chartId);
          setViewMode("single"); // 클릭하면 확대 보기로 전환(원하면 이 줄 삭제)
        }}
        className={[
          "group relative rounded-2xl border border-border/60 bg-background/10 p-2 text-left",
          activeChartId === c.chartId ? "ring-2 ring-primary/40" : "hover:bg-background/20",
        ].join(" ")}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <div className="text-xs text-muted-foreground">Chart {c.chartIndex + 1}</div>
            <div className="text-sm font-semibold">
              {c.symbolTicker} <span className="text-muted-foreground">· {c.symbolName}</span>
            </div>
          </div>

          <div className="text-right text-xs text-muted-foreground">
            <div>idx: {prog?.progressIndex ?? "-"}</div>
            <div>px: <span className="text-foreground">{n2(prog?.currentPrice)}</span></div>
          </div>
        </div>

        <div className="h-[220px]">
          {visible.length > 0 ? (
            <CandleChart candles={visible} height={220} />
          ) : (
            <div className="h-full rounded-xl border border-border/60 bg-background/20 flex items-center justify-center text-xs text-muted-foreground">
              no data
            </div>
          )}
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-xl border border-border/60 bg-background/20 p-2">
            <div className="text-muted-foreground">Cash</div>
            <div className="font-semibold">{n(prog?.cashBalance)}</div>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/20 p-2">
            <div className="text-muted-foreground">Qty</div>
            <div className="font-semibold">{n2(prog?.positionQty)}</div>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/20 p-2">
            <div className="text-muted-foreground">Avg</div>
            <div className="font-semibold">{n2(prog?.avgPrice)}</div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="h-[calc(100vh-56px)] w-full flex overflow-hidden">
      {/* LEFT */}
      <aside className="w-80 border-r border-border/60 bg-muted/10 p-4 flex flex-col gap-4">
        <div className="rounded-2xl border border-border/60 bg-background/10 p-3 text-sm">
          <div className="font-semibold">Session</div>
          <div className="mt-1 text-muted-foreground">id: {sessionId ?? "-"}</div>
          <div className="text-muted-foreground">status: {status}</div>
        </div>

        {/* Account selector */}
        <div className="rounded-2xl border border-border/60 bg-background/10 p-3">
          <div className="mb-2 text-sm font-semibold">계좌</div>
          <select
            className="w-full rounded-xl border border-border/60 bg-background/30 px-3 py-2 text-sm"
            value={accountId ?? ""}
            onChange={(e) => setAccountId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">계좌 선택</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                #{a.id} · {a.name}
              </option>
            ))}
          </select>
          <div className="mt-2 text-xs text-muted-foreground">
            계좌가 없으면 계좌 생성 페이지를 먼저 만들고 연결하자.
          </div>
        </div>

        {/* View / Sync controls */}
        <div className="rounded-2xl border border-border/60 bg-background/10 p-3">
          <div className="mb-2 text-sm font-semibold">View</div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={[
                "flex-1 rounded-xl border px-3 py-2 text-sm",
                viewMode === "grid"
                  ? "border-primary/50 bg-primary/10 font-semibold"
                  : "border-border/60 hover:bg-muted/30",
              ].join(" ")}
            >
              4분할
            </button>
            <button
              onClick={() => setViewMode("single")}
              className={[
                "flex-1 rounded-xl border px-3 py-2 text-sm",
                viewMode === "single"
                  ? "border-primary/50 bg-primary/10 font-semibold"
                  : "border-border/60 hover:bg-muted/30",
              ].join(" ")}
            >
              확대
            </button>
          </div>

          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={syncNext}
              onChange={(e) => setSyncNext(e.target.checked)}
              disabled={viewMode === "single"}
            />
            <span className={viewMode === "single" ? "text-muted-foreground" : ""}>
              NEXT 동시 진행(4개)
            </span>
          </label>
          <div className="mt-1 text-xs text-muted-foreground">
            확대 보기에서는 무조건 선택 차트만 진행.
          </div>
        </div>

        {/* Chart list */}
        <div className="flex-1 overflow-auto rounded-2xl border border-border/60 bg-background/10 p-3">
          <div className="mb-2 text-sm font-semibold">Charts</div>
          <div className="flex flex-col gap-2">
            {sortedCharts.map((c) => (
              <button
                key={c.chartId}
                onClick={() => setActiveChartId(c.chartId)}
                className={[
                  "text-left rounded-xl px-3 py-2 text-sm border transition",
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
            {sortedCharts.length === 0 && (
              <div className="text-xs text-muted-foreground">세션 시작 후 표시됨</div>
            )}
          </div>
        </div>

        <button
          onClick={onCreateSession}
          disabled={loading}
          className="rounded-2xl border border-border/60 px-3 py-3 text-sm hover:bg-muted/30 disabled:opacity-60"
        >
          {loading ? "세션 생성 중..." : "세션 시작(4차트)"}
        </button>
      </aside>

      {/* CENTER */}
      <main className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">
              Active Chart: {activeChartId ?? "-"}
            </div>
            <div className="text-sm text-muted-foreground">
              progress: {activeProgress?.progressIndex ?? "-"} /{" "}
              {activeCandles.length ? activeCandles.length - 1 : "-"}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Price:{" "}
            <b className="text-foreground">
              {n2(activeProgress?.currentPrice)}
            </b>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          {viewMode === "grid" ? (
            <div className="grid h-full grid-cols-2 gap-4">
              {sortedCharts.map(renderTile)}
              {sortedCharts.length === 0 && (
                <div className="col-span-2 h-full rounded-2xl border border-border/60 bg-background/20 flex items-center justify-center text-muted-foreground">
                  세션 시작 후 4분할 차트가 표시됩니다.
                </div>
              )}
            </div>
          ) : (
            <div className="h-full">
              {visibleActiveCandles.length > 0 ? (
                <CandleChart candles={visibleActiveCandles} height={520} />
              ) : (
                <div className="h-full rounded-2xl border border-border/60 bg-background/20 flex items-center justify-center text-muted-foreground">
                  세션 시작 후 차트가 표시됩니다.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* RIGHT */}
      <aside className="w-96 border-l border-border/60 p-6 overflow-y-auto bg-muted/10">
        {/* Snapshot */}
        <div className="mb-6">
          <div className="text-sm font-semibold mb-2">Account Snapshot</div>
          <div className="rounded-2xl border border-border/60 bg-background/10 p-4">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border border-border/60 bg-background/20 p-3">
                <div className="text-xs text-muted-foreground">Cash</div>
                <div className="mt-1 text-base font-semibold">{n(activeProgress?.cashBalance)}</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/20 p-3">
                <div className="text-xs text-muted-foreground">Qty</div>
                <div className="mt-1 text-base font-semibold">{n2(activeProgress?.positionQty)}</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/20 p-3">
                <div className="text-xs text-muted-foreground">Avg</div>
                <div className="mt-1 text-base font-semibold">{n2(activeProgress?.avgPrice)}</div>
              </div>
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              ※ BUY/SELL 후에 snapshot이 갱신됩니다. (세션 생성 직후는 0으로 보일 수 있음)
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <div className="text-sm font-semibold mb-3">Actions</div>
          <div className="flex flex-col gap-2">
            <button
              disabled={disabled}
              onClick={onNext}
              className="rounded-2xl border border-border/60 px-4 py-3 hover:bg-muted/30 disabled:opacity-60"
            >
              NEXT {viewMode === "grid" && syncNext ? "(ALL)" : "(Active)"}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={disabled}
                onClick={onBuy}
                className="rounded-2xl border border-border/60 px-4 py-3 hover:bg-muted/30 disabled:opacity-60"
              >
                BUY (qty=1)
              </button>
              <button
                disabled={disabled}
                onClick={onSell}
                className="rounded-2xl border border-border/60 px-4 py-3 hover:bg-muted/30 disabled:opacity-60"
              >
                SELL (qty=1)
              </button>
            </div>

            <button
              disabled={disabled}
              onClick={onSellAll}
              className="rounded-2xl border border-border/60 px-4 py-3 hover:bg-muted/30 disabled:opacity-60"
            >
              SELL ALL
            </button>
          </div>
        </div>

        {/* Notes (리포트/복기: 다음 단계에서 저장/조회 붙임) */}
        <div>
          <div className="text-sm font-semibold mb-3">리포트 / 복기</div>
          <textarea
            placeholder="복기 메모... (다음 단계에서 저장/조회 API 붙일 예정)"
            className="w-full min-h-[220px] rounded-2xl border border-border/60 p-4 text-sm bg-background/20"
          />
          <div className="mt-2 text-xs text-muted-foreground">
            다음 단계: (1) 저장/조회 API 연결 → (2) AI 리포트 생성 버튼 붙이기
          </div>
        </div>
      </aside>
    </div>
  );
}