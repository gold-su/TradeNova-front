import { useEffect, useMemo, useState } from "react";
import http from "@/api/http";
import { reportApi } from "@/api/reportApi";
import { trainingApi } from "@/api/trainingApi";
import type {
  Candle,
  CreateSessionResponse,
  ProgressResponse,
  QuickPhraseResponse,
  ReportDocumentResponse,
  ReportDraftContent,
  TradeResponse,
  TrainingChartDto,
  TrainingEventResponse,
  TrainingStatus,
} from "@/types/training";

export type ViewMode = "grid" | "single";

type CandlesMap = Record<number, Candle[]>;
type ProgressMap = Record<number, ProgressResponse>;

export type PaperAccountDto = {
  id: number;
  name: string;
  description?: string | null;
  cashBalance: number;
  isDefault?: boolean;
};

function emptyProgress(
  chartId: number,
  status: TrainingStatus,
  price = 0,
): ProgressResponse {
  return {
    chartId,
    progressIndex: 0,
    currentPrice: price,
    status,
    cashBalance: 0,
    positionQty: 0,
    avgPrice: 0,
    autoExited: false,
    reason: null,
  };
}

const emptyDraft: ReportDraftContent = {
  thesis: "",
  entryReason: "",
  exitPlan: "",
  riskNote: "",
  freeNote: "",
  tags: [],
};

export function useTrainingSessionPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [syncNext, setSyncNext] = useState(true);

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [status, setStatus] = useState<TrainingStatus>("IN_PROGRESS");

  const [accounts, setAccounts] = useState<PaperAccountDto[]>([]);
  const [accountId, setAccountId] = useState<number | null>(null);

  const [charts, setCharts] = useState<TrainingChartDto[]>([]);
  const [activeChartId, setActiveChartId] = useState<number | null>(null);

  const [candlesByChart, setCandlesByChart] = useState<CandlesMap>({});
  const [progressByChart, setProgressByChart] = useState<ProgressMap>({});

  const [quickPhrases, setQuickPhrases] = useState<QuickPhraseResponse[]>([]);
  const [events, setEvents] = useState<TrainingEventResponse[]>([]);
  const [snapshots, setSnapshots] = useState<ReportDocumentResponse[]>([]);
  const [draft, setDraft] = useState<ReportDraftContent>(emptyDraft);

  const [loading, setLoading] = useState(false);
  const [draftSaving, setDraftSaving] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeSessionLoading, setActiveSessionLoading] = useState(true);

  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState<"BUY" | "SELL" | null>(null);
  const [tradeForm, setTradeForm] = useState({
    qty: 1,
    entryReason: "",
    riskNote: "",
  });

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
  function pickCharts(res: CreateSessionResponse): TrainingChartDto[] {
    return res.charts;
  }
  const sortedCharts = useMemo(
    () => charts.slice().sort((a, b) => a.chartIndex - b.chartIndex),
    [charts],
  );

  const activeChart = useMemo(
    () => sortedCharts.find((c) => c.chartId === activeChartId) ?? null,
    [sortedCharts, activeChartId],
  );

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
    const end = Math.min(
      activeProgress.progressIndex + 1,
      activeCandles.length,
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
        setDraft(emptyDraft);
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
    loadActiveSession();
  }, []);

  useEffect(() => {
    loadQuickPhrases();
  }, []);

  useEffect(() => {
    if (!activeChartId) return;
    loadDraft(activeChartId);
    loadEvents(activeChartId);
    loadSnapshots(activeChartId);
  }, [activeChartId]);

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

  const hydrateSession = async (session: {
    sessionId: number;
    accountId?: number;
    status: TrainingStatus;
    charts: TrainingChartDto[];
  }) => {
    if (session.accountId != null) {
      setAccountId(session.accountId);
    }
    
    const sorted = session.charts
      .slice()
      .sort((a, b) => a.chartIndex - b.chartIndex);

    setSessionId(session.sessionId);
    setCharts(sorted);
    setStatus(session.status);

    const first = sorted[0] ?? null;
    setActiveChartId(first?.chartId ?? null);

    const candlePairs = await Promise.all(
      sorted.map(async (chart) => {
        const candles = await trainingApi.getChartCandles(chart.chartId);
        return [chart.chartId, candles] as const;
      }),
    );

    const candleMap: Record<number, Candle[]> = {};
    candlePairs.forEach(([chartId, candles]) => {
      candleMap[chartId] = candles;
    });
    setCandlesByChart(candleMap);

    const progressMap: Record<number, ProgressResponse> = {};
    sorted.forEach((chart) => {
      progressMap[chart.chartId] = {
        chartId: chart.chartId,
        progressIndex: chart.progressIndex ?? 0,
        currentPrice: 0,
        status: chart.status,
        cashBalance: 0,
        positionQty: 0,
        avgPrice: 0,
        autoExited: false,
        reason: null,
      };
    });
    setProgressByChart(progressMap);
  };

  const onCreateSession = async () => {
    setError(null);

    if (!accountId) {
      setError("먼저 계좌를 선택하거나 생성해하세요.");
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

      await hydrateSession({
        sessionId: active.sessionId,
        accountId: active.accountId,
        status: active.status,
        charts: active.charts,
      });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "훈련 세션 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTrade = async () => {
    if (!activeChartId || !tradeType) return;

    try {
      setLoading(true);
      setError(null);

      const tradeRes =
        tradeType === "BUY"
          ? await trainingApi.buy(activeChartId, { qty: tradeForm.qty })
          : await trainingApi.sell(activeChartId, { qty: tradeForm.qty });

      applyTrade(tradeRes);

      const event = await reportApi.createEvent(activeChartId, {
        type: "TRADE",
        title: `${tradeType} 실행`,
        payloadJson: {
          qty: tradeForm.qty,
          entryReason: tradeForm.entryReason,
          riskNote: tradeForm.riskNote,
          price: tradeRes.executedPrice,
        },
      });

      const snapshot = await reportApi.createSnapshot(activeChartId, {
        linkedEventId: event.id,
        contentJson: {
          thesis: "",
          entryReason: tradeForm.entryReason,
          exitPlan: "",
          riskNote: tradeForm.riskNote,
          freeNote: "",
          tags: [],
        },
      });

      setSnapshots((prev) => [snapshot, ...prev]);

      setTradeModalOpen(false);
      setTradeForm({
        qty: 1,
        entryReason: "",
        riskNote: "",
      });

      await loadEvents(activeChartId);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "거래 실패");
    } finally {
      setLoading(false);
    }
  };

  const loadActiveSession = async () => {
    try {
      setActiveSessionLoading(true);
      setError(null);

      const active = await trainingApi.getActiveSession();

      if (!active) {
        return;
      }

      await hydrateSession({
        sessionId: active.sessionId,
        status: active.status,
        charts: active.charts,
      });
    } catch (e: any) {
      setError(
        e?.response?.data?.message ?? "진행 중 세션 복구에 실패했습니다.",
      );
    } finally {
      setActiveSessionLoading(false);
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
        const results = await Promise.all(
          ids.map((id) => trainingApi.next(id)),
        );
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

  const openBuyModal = () => {
    setTradeType("BUY");
    setTradeModalOpen(true);
  };

  const openSellModal = () => {
    setTradeType("SELL");
    setTradeModalOpen(true);
  };

  return {
    viewMode,
    setViewMode,
    syncNext,
    setSyncNext,

    sessionId,
    status,
    accounts,
    accountId,
    setAccountId,
    charts: sortedCharts,
    activeChartId,
    setActiveChartId,

    activeSessionLoading,
    loadActiveSession,

    candlesByChart,
    progressByChart,
    activeChart,
    activeCandles,
    activeProgress,
    visibleActiveCandles,

    quickPhrases,
    events,
    snapshots,
    draft,
    setDraft,

    loading,
    draftSaving,
    eventLoading,
    error,
    disabled,

    tradeModalOpen,
    setTradeModalOpen,
    tradeType,
    tradeForm,
    setTradeForm,

    onCreateSession,
    onNext,
    onSellAll,
    onSaveDraft,
    onCreateSnapshot,
    onCreateNoteEvent,
    appendQuickPhrase,
    handleConfirmTrade,
    openBuyModal,
    openSellModal,
  };
}
