import { useEffect, useMemo, useState } from "react";
import CandleChart from "@/components/training/CandleChart";
import { trainingApi } from "@/api/trainingApi";
import { reportApi } from "@/api/reportApi";
import http from "@/api/http";
import type {
  Candle,
  CreateSessionResponse,
  ProgressResponse,
  TradeResponse,
  TrainingChartDto,
  TrainingStatus,
  QuickPhraseResponse,
  TrainingEventResponse,
  ReportDocumentResponse,
  ReportDraftContent,
} from "@/types/training";

// ===== Types =====
type CandlesMap = Record<number, Candle[]>;
type ProgressMap = Record<number, ProgressResponse>;

type PaperAccountDto = {
  id: number;
  name: string;
  description?: string | null;
  cashBalance: number;
  isDefault?: boolean;
};

// ===== Utils =====
function pickCharts(res: CreateSessionResponse): TrainingChartDto[] {
  if ("charts" in res) return res.charts;

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
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 2,
  }).format(v);
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

  // report / events / snapshot
  const [quickPhrases, setQuickPhrases] = useState<QuickPhraseResponse[]>([]);
  const [events, setEvents] = useState<TrainingEventResponse[]>([]);
  const [snapshots, setSnapshots] = useState<ReportDocumentResponse[]>([]);

  const [draft, setDraft] = useState<ReportDraftContent>({
    thesis: "",
    entryReason: "",
    exitPlan: "",
    riskNote: "",
    freeNote: "",
    tags: [],
  });

  // ui
  const [loading, setLoading] = useState(false);
  const [draftSaving, setDraftSaving] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== Load accounts on mount =====
  useEffect(() => {
    (async () => {
      try {
        const list = await http
          .get<PaperAccountDto[]>("/api/paper-accounts")
          .then((r) => r.data);

        setAccounts(list);

        const def = list.find((a) => a.isDefault) ?? list[0];
        setAccountId(def?.id ?? null);
      } catch (e) {
        console.warn("계좌 목록 로드 실패", e);
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

  // ===== Report loaders =====
  const loadQuickPhrases = async () => {
    try {
      const data = await reportApi.getQuickPhrases();
      setQuickPhrases(data);
    } catch (e) {
      console.error("quick phrase load failed", e);
    }
  };

  const loadDraft = async (chartId: number) => {
    try {
      const data = await reportApi.getDraft(chartId);

      if (data?.contentJson) {
        setDraft({
          thesis: data.contentJson.thesis ?? "",
          entryReason: data.contentJson.entryReason ?? "",
          exitPlan: data.contentJson.exitPlan ?? "",
          riskNote: data.contentJson.riskNote ?? "",
          freeNote: data.contentJson.freeNote ?? "",
          tags: data.contentJson.tags ?? [],
        });
      } else {
        setDraft({
          thesis: "",
          entryReason: "",
          exitPlan: "",
          riskNote: "",
          freeNote: "",
          tags: [],
        });
      }
    } catch (e) {
      console.error("draft load failed", e);
    }
  };

  const loadEvents = async (chartId: number) => {
    try {
      setEventLoading(true);
      const data = await reportApi.getEvents(chartId, 50);
      setEvents(data);
    } catch (e) {
      console.error("event load failed", e);
    } finally {
      setEventLoading(false);
    }
  };

  const loadSnapshots = async (chartId: number) => {
    try {
      const data = await reportApi.getSnapshots(chartId);
      setSnapshots(data);
    } catch (e) {
      console.error("snapshot load failed", e);
    }
  };

  useEffect(() => {
    loadQuickPhrases();
  }, []);

  useEffect(() => {
    if (!activeChartId) return;

    loadDraft(activeChartId);
    loadEvents(activeChartId);
    loadSnapshots(activeChartId);
  }, [activeChartId]);

  // ===== Draft / Phrase / Snapshot =====
  const onSaveDraft = async () => {
    if (!activeChartId) return;

    try {
      setDraftSaving(true);
      setError(null);

      await reportApi.upsertDraft(activeChartId, {
        contentJson: draft,
      });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "드래프트 저장 실패");
    } finally {
      setDraftSaving(false);
    }
  };

  const onCreateSnapshot = async () => {
    if (!activeChartId) return;

    try {
      setError(null);

      const saved = await reportApi.createSnapshot(activeChartId, {
        linkedEventId: null,
        contentJson: draft,
      });

      setSnapshots((prev) => [saved, ...prev]);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "스냅샷 저장 실패");
    }
  };

  const onCreateNoteEvent = async () => {
    if (!activeChartId) return;

    try {
      setError(null);

      await reportApi.createEvent(activeChartId, {
        type: "NOTE",
        title: draft.thesis?.trim() || "수동 메모",
        payloadJson: {
          thesis: draft.thesis ?? "",
          entryReason: draft.entryReason ?? "",
          exitPlan: draft.exitPlan ?? "",
          riskNote: draft.riskNote ?? "",
          freeNote: draft.freeNote ?? "",
          tags: draft.tags ?? [],
        },
      });

      await loadEvents(activeChartId);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "메모 이벤트 저장 실패");
    }
  };

  const appendQuickPhrase = (content: string) => {
    setDraft((prev) => ({
      ...prev,
      freeNote: [prev.freeNote ?? "", content].filter(Boolean).join("\n"),
    }));
  };

  // ===== Actions =====
  const onCreateSession = async () => {
    setError(null);

    if (!accountId) {
      setError("먼저 계좌를 선택하거나 생성해줘.");
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

      const first = cs.slice().sort((a, b) => a.chartIndex - b.chartIndex)[0];
      setActiveChartId(first?.chartId ?? null);

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
      setError(e?.response?.data?.message ?? "훈련 세션 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onNext = async () => {
    if (!activeChartId) return;
    setLoading(true);
    setError(null);

    try {
      if (viewMode === "single") {
        const res = await trainingApi.next(activeChartId);
        applyProgress(res);
        await loadEvents(activeChartId);
        return;
      }

      if (syncNext) {
        const ids = sortedCharts.map((c) => c.chartId);
        const results = await Promise.all(ids.map((id) => trainingApi.next(id)));
        results.forEach(applyProgress);

        if (activeChartId) {
          await loadEvents(activeChartId);
        }
      } else {
        const res = await trainingApi.next(activeChartId);
        applyProgress(res);
        await loadEvents(activeChartId);
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
      await loadEvents(activeChartId);
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
      await loadEvents(activeChartId);
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
      await loadEvents(activeChartId);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "SELL ALL 실패");
    } finally {
      setLoading(false);
    }
  };

  // ===== Grid helper =====
  const renderTile = (c: TrainingChartDto) => {
    const candles = candlesByChart[c.chartId] ?? [];
    const prog = progressByChart[c.chartId] ?? null;

    const visible = prog
      ? candles.slice(0, Math.min(prog.progressIndex + 1, candles.length))
      : candles;

    return (
      <button
        key={c.chartId}
        onClick={() => {
          setActiveChartId(c.chartId);
          setViewMode("single");
        }}
        className={[
          "group relative rounded-2xl border border-border/60 bg-background/10 p-2 text-left",
          activeChartId === c.chartId
            ? "ring-2 ring-primary/40"
            : "hover:bg-background/20",
        ].join(" ")}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <div className="text-xs text-muted-foreground">
              Chart {c.chartIndex + 1}
            </div>
            <div className="text-sm font-semibold">
              {c.symbolTicker}{" "}
              <span className="text-muted-foreground">· {c.symbolName}</span>
            </div>
          </div>

          <div className="text-right text-xs text-muted-foreground">
            <div>idx: {prog?.progressIndex ?? "-"}</div>
            <div>
              px: <span className="text-foreground">{n2(prog?.currentPrice)}</span>
            </div>
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

        <div className="rounded-2xl border border-border/60 bg-background/10 p-3">
          <div className="mb-2 text-sm font-semibold">계좌</div>
          <select
            className="w-full rounded-xl border border-border/60 bg-background/30 px-3 py-2 text-sm"
            value={accountId ?? ""}
            onChange={(e) =>
              setAccountId(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">계좌 선택</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                #{a.id} · {a.name}
              </option>
            ))}
          </select>
          <div className="mt-2 text-xs text-muted-foreground">
            계좌가 없으면 계좌 생성 페이지를 먼저 연결하면 돼.
          </div>
        </div>

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
            확대 보기에서는 무조건 선택 차트만 진행됨.
          </div>
        </div>

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
              <div className="text-xs text-muted-foreground">
                세션 시작 후 표시됨
              </div>
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
            Price: <b className="text-foreground">{n2(activeProgress?.currentPrice)}</b>
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
      <aside className="w-[420px] border-l border-border/60 p-6 overflow-y-auto bg-muted/10">
        <div className="mb-6">
          <div className="text-sm font-semibold mb-2">Account Snapshot</div>
          <div className="rounded-2xl border border-border/60 bg-background/10 p-4">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border border-border/60 bg-background/20 p-3">
                <div className="text-xs text-muted-foreground">Cash</div>
                <div className="mt-1 text-base font-semibold">
                  {n(activeProgress?.cashBalance)}
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/20 p-3">
                <div className="text-xs text-muted-foreground">Qty</div>
                <div className="mt-1 text-base font-semibold">
                  {n2(activeProgress?.positionQty)}
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/20 p-3">
                <div className="text-xs text-muted-foreground">Avg</div>
                <div className="mt-1 text-base font-semibold">
                  {n2(activeProgress?.avgPrice)}
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              BUY / SELL 후 스냅샷이 갱신됨
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="text-sm font-semibold mb-3">Actions</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={disabled}
              onClick={onNext}
              className="rounded-2xl border border-border/60 px-4 py-3 hover:bg-muted/30 disabled:opacity-60 col-span-2"
            >
              NEXT {viewMode === "grid" && syncNext ? "(ALL)" : "(Active)"}
            </button>

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

            <button
              disabled={disabled}
              onClick={onSellAll}
              className="rounded-2xl border border-border/60 px-4 py-3 hover:bg-muted/30 disabled:opacity-60"
            >
              SELL ALL
            </button>

            <button
              disabled={!activeChartId}
              onClick={onCreateSnapshot}
              className="rounded-2xl border border-border/60 px-4 py-3 hover:bg-muted/30 disabled:opacity-60"
            >
              SNAPSHOT
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="text-sm font-semibold mb-3">Quick Phrases</div>
          <div className="flex flex-wrap gap-2">
            {quickPhrases.map((phrase) => (
              <button
                key={phrase.id}
                type="button"
                onClick={() => appendQuickPhrase(phrase.content)}
                className="rounded-full border border-border/60 px-3 py-1 text-xs hover:bg-muted/30"
              >
                {phrase.title}
              </button>
            ))}

            {quickPhrases.length === 0 && (
              <div className="text-xs text-muted-foreground">
                등록된 빠른 문장이 없어
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Draft Report</div>
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={!activeChartId || draftSaving}
              className="rounded-md border border-border/60 px-3 py-1 text-xs hover:bg-muted/30 disabled:opacity-60"
            >
              {draftSaving ? "저장 중..." : "Draft 저장"}
            </button>
          </div>

          <div className="space-y-3">
            <input
              value={draft.thesis ?? ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, thesis: e.target.value }))
              }
              placeholder="한 줄 관점"
              className="w-full rounded-2xl border border-border/60 p-3 text-sm bg-background/20"
            />

            <textarea
              value={draft.entryReason ?? ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, entryReason: e.target.value }))
              }
              placeholder="진입 근거"
              className="w-full min-h-[90px] rounded-2xl border border-border/60 p-3 text-sm bg-background/20"
            />

            <textarea
              value={draft.exitPlan ?? ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, exitPlan: e.target.value }))
              }
              placeholder="청산 계획"
              className="w-full min-h-[90px] rounded-2xl border border-border/60 p-3 text-sm bg-background/20"
            />

            <textarea
              value={draft.riskNote ?? ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, riskNote: e.target.value }))
              }
              placeholder="리스크 / 손절 기준"
              className="w-full min-h-[90px] rounded-2xl border border-border/60 p-3 text-sm bg-background/20"
            />

            <textarea
              value={draft.freeNote ?? ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, freeNote: e.target.value }))
              }
              placeholder="자유 메모"
              className="w-full min-h-[140px] rounded-2xl border border-border/60 p-3 text-sm bg-background/20"
            />

            <button
              type="button"
              onClick={onCreateNoteEvent}
              disabled={!activeChartId}
              className="w-full rounded-2xl border border-border/60 px-4 py-3 text-sm hover:bg-muted/30 disabled:opacity-60"
            >
              현재 메모를 이벤트로 기록
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="text-sm font-semibold mb-3">Event Log</div>

          <div className="space-y-2">
            {eventLoading && (
              <div className="text-xs text-muted-foreground">불러오는 중...</div>
            )}

            {!eventLoading && events.length === 0 && (
              <div className="text-xs text-muted-foreground">이벤트가 없어</div>
            )}

            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl border border-border/60 bg-background/10 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{event.title}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {event.type}
                  </div>
                </div>

                <div className="mt-1 text-[11px] text-muted-foreground">
                  {new Date(event.createdAt).toLocaleString()}
                </div>

                {event.payloadJson && (
                  <pre className="mt-2 overflow-x-auto rounded-md bg-black/20 p-2 text-[11px] text-muted-foreground">
                    {JSON.stringify(event.payloadJson, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold mb-3">Snapshots</div>

          <div className="space-y-2">
            {snapshots.length === 0 && (
              <div className="text-xs text-muted-foreground">
                저장된 스냅샷이 없어
              </div>
            )}

            {snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                className="rounded-2xl border border-border/60 bg-background/10 p-3"
              >
                <div className="text-sm font-medium">
                  Snapshot #{snapshot.id}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {new Date(snapshot.createdAt).toLocaleString()}
                </div>

                <pre className="mt-2 overflow-x-auto rounded-md bg-black/20 p-2 text-[11px] text-muted-foreground">
                  {JSON.stringify(snapshot.contentJson, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}