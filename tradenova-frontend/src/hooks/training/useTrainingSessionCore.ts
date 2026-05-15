import { useEffect, useMemo, useState } from "react";
import http from "@/api/http";
import { trainingApi } from "@/api/trainingApi";
import type {
  Candle,
  ProgressResponse,
  TrainingChartDto,
  TrainingStatus,
  ChartRefreshRequest,
  IndicatorSettings,
} from "@/types/training";
import type {
  CandlesMap,
  HydrateSessionInput,
  PaperAccountDto,
  ProgressMap,
  ViewMode,
} from "./training.types";
import { DEFAULT_INDICATORS } from "@/components/training/chart/indicator/indicatorDefaults";

const INDICATOR_STORAGE_KEY = "tradenova.globalIndicators";

/**
 * 훈련 화면의 "세션/차트/캔들/진행도" 핵심 로직을 담당하는 훅
 *
 * 담당 책임:
 * - 계좌 목록 로드
 * - 진행 중(active) 세션 복구
 * - 새 세션 생성
 * - 차트/캔들/진행 상태 복구
 * - next 진행
 *
 * 일부러 여기에는
 * - draft / snapshot / event
 * - trade modal / 거래 저장
 * 를 넣지 않는다.
 * 그건 다른 훅에서 담당한다.
 */
export function useTrainingSessionCore() {
  // ===== 화면 제어 상태 =====
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [syncNext, setSyncNext] = useState(true);

  // ===== 세션 기본 상태 =====
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [status, setStatus] = useState<TrainingStatus>("IN_PROGRESS");

  // ===== 계좌 선택 상태 =====
  const [accounts, setAccounts] = useState<PaperAccountDto[]>([]);
  const [accountId, setAccountId] = useState<number | null>(null);

  // ===== 차트 선택 상태 =====
  const [charts, setCharts] = useState<TrainingChartDto[]>([]);
  const [activeChartId, setActiveChartId] = useState<number | null>(null);

  // ===== 차트 데이터 상태 =====
  const [candlesByChart, setCandlesByChart] = useState<CandlesMap>({});
  const [progressByChart, setProgressByChart] = useState<ProgressMap>({});

  // ===== 로딩 / 에러 =====
  const [loading, setLoading] = useState(false);
  const [activeSessionLoading, setActiveSessionLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 차트 새로고침 드롭다운
  const [refreshRequest, setRefreshRequest] = useState<ChartRefreshRequest>({
    refreshType: "RANDOM",
    optionValue: null,
  });

  /**
   * chartIndex 순서대로 항상 정렬된 차트 목록
   * UI에서는 이 값을 기준으로 쓰는 것이 안정적이다.
   */
  const sortedCharts = useMemo(
    () => charts.slice().sort((a, b) => a.chartIndex - b.chartIndex),
    [charts],
  );

  /**
   * 현재 선택된 차트 객체
   */
  const activeChart = useMemo(
    () => sortedCharts.find((c) => c.chartId === activeChartId) ?? null,
    [sortedCharts, activeChartId],
  );

  /**
   * 현재 선택된 차트의 전체 캔들
   */
  const activeCandles = useMemo(() => {
    if (!activeChartId) return [];
    return candlesByChart[activeChartId] ?? [];
  }, [activeChartId, candlesByChart]);

  /**
   * 현재 선택된 차트의 진행 상태
   */
  const activeProgress = useMemo(() => {
    if (!activeChartId) return null;
    return progressByChart[activeChartId] ?? null;
  }, [activeChartId, progressByChart]);

  /**
   * 현재 progressIndex까지만 잘라서 화면에 보여줄 캔들
   * 즉, 미래 봉은 아직 보이지 않게 하는 역할
   */
  const visibleActiveCandles = useMemo(() => {
    if (!activeProgress) return activeCandles;

    const end = Math.min(
      activeProgress.progressIndex + 1,
      activeCandles.length,
    );

    return activeCandles.slice(0, end);
  }, [activeCandles, activeProgress]);

  /**
   * 세션 응답(create / active 복구)을 받아서
   * 화면 상태(session/charts/candles/progress)를 한 번에 복구한다.
   */
  const hydrateSession = async (session: HydrateSessionInput) => {
    // active 세션 복구 시 계좌까지 같이 맞춰준다.
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

    // 각 차트의 캔들을 병렬 로드
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

    // progress 응답이 따로 없으므로 차트 DTO의 progressIndex 기반으로 초기화
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

  /**
   * 차트 진행 응답을 progress map에 반영한다.
   */
  const applyProgress = (res: ProgressResponse) => {
    setProgressByChart((prev) => ({
      ...prev,
      [res.chartId]: res,
    }));
    setStatus(res.status);
  };

  /**
   * 현재 진행 중(active) 세션이 있으면 복구한다.
   * 없으면 그대로 빈 상태 유지.
   */
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
        accountId: active.accountId,
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

  /**
   * 새 랜덤 훈련 세션을 생성하고,
   * 응답을 그대로 hydrateSession에 넣어 화면 상태를 초기화한다.
   */
  const onCreateSession = async () => {
    setError(null);

    if (!accountId) {
      setError("먼저 계좌를 선택하거나 생성해주세요.");
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

      await hydrateSession({
        sessionId: created.sessionId,
        accountId,
        status: created.status,
        charts: created.charts,
      });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "훈련 세션 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 현재 세션을 수동 종료한다.
   * - 세션 상태를 COMPLETED로 반영
   * - 모든 차트 상태도 COMPLETED로 반영
   */
  const onFinishSession = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);

      const finished = await trainingApi.finishSession(sessionId);

      setStatus("COMPLETED");

      setCharts((prev) =>
        prev.map((chart) => ({
          ...chart,
          status: "COMPLETED",
        })),
      );

      setProgressByChart((prev) => {
        const next: typeof prev = {};

        for (const key of Object.keys(prev)) {
          const chartId = Number(key);
          next[chartId] = {
            ...prev[chartId],
            status: "COMPLETED",
          };
        }

        return next;
      });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "세션 종료에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 현재 active chart 또는 전체 차트를 next 진행한다.
   * - single 모드: active chart만 진행
   * - grid + syncNext: 모든 차트를 동시에 진행
   * - grid + !syncNext: active chart만 진행
   */
  const onNext = async (
    afterProgress?: (chartId: number) => Promise<void> | void,
  ) => {
    if (!activeChartId) return;

    setLoading(true);
    setError(null);

    try {
      if (viewMode === "single") {
        const res = await trainingApi.next(activeChartId);
        applyProgress(res);
        await afterProgress?.(activeChartId);
        return;
      }

      if (syncNext) {
        const ids = sortedCharts.map((c) => c.chartId);
        const results = await Promise.all(
          ids.map((id) => trainingApi.next(id)),
        );

        results.forEach(applyProgress);

        if (activeChartId) {
          await afterProgress?.(activeChartId);
        }
      } else {
        const res = await trainingApi.next(activeChartId);
        applyProgress(res);
        await afterProgress?.(activeChartId);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "NEXT 실패");
    } finally {
      setLoading(false);
    }
  };


  const [globalIndicators, setGlobalIndicators] = useState<IndicatorSettings>(
    () => {
      try {
        const saved = localStorage.getItem(INDICATOR_STORAGE_KEY);

        if (!saved) {
          return DEFAULT_INDICATORS;
        }

        return {
          ...DEFAULT_INDICATORS,
          ...JSON.parse(saved),
        };
      } catch {
        return DEFAULT_INDICATORS;
      }
    },
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        INDICATOR_STORAGE_KEY,
        JSON.stringify(globalIndicators),
      );
    } catch {
      // localStorage 사용 불가 환경 대비
    }
  }, [globalIndicators]);

  // 차트별 개별 설정
  const [chartIndicators, setChartIndicators] = useState<
    Record<number, IndicatorSettings>
  >({});

  const getIndicatorSettings = (chartId: number | null) => {
    if (!chartId) return globalIndicators;

    return chartIndicators[chartId] ?? globalIndicators;
  };

  const onRefreshChart = async (chartId: number) => {
    try {
      setLoading(true);
      setError(null);

      const res = await trainingApi.refreshChart(chartId, refreshRequest);

      setCharts((prev) =>
        prev.map((c) => (c.chartIndex === res.chartIndex ? res : c)),
      );
      // 새 캔들 로드
      const candles = await trainingApi.getChartCandles(res.chartId);

      // 기존 chartId의 캔들 데이터는 제거하고,
      // 새 chartId의 캔들 데이터만 다시 넣는다.
      setCandlesByChart((prev) => {
        const next = { ...prev };
        delete next[chartId];

        next[res.chartId] = candles;

        return next;
      });

      // 기존 chartId의 progress 데이터는 제거하고,
      // 새 chartId의 progress 상태를 초기값으로 넣는다.
      setProgressByChart((prev) => {
        const next = { ...prev };
        delete next[chartId];

        next[res.chartId] = {
          chartId: res.chartId,
          progressIndex: res.progressIndex ?? 0,
          currentPrice: 0,
          status: res.status,
          cashBalance: 0,
          positionQty: 0,
          avgPrice: 0,
          autoExited: false,
          reason: null,
        };

        return next;
      });

      setActiveChartId((prev) => (prev === chartId ? res.chartId : prev));
    } catch (e: any) {
      console.error("[refresh] failed:", e);

      setError(
        e?.response?.data?.message ??
          e?.message ??
          "이미 거래 기록이 있는 차트는 새로고침할 수 없습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * 계좌 목록을 최초 1회 불러온다.
   * active 세션이 accountId를 먼저 세팅했더라도
   * 여기서는 기존 값이 없을 때만 기본 계좌를 채운다.
   */
  useEffect(() => {
    (async () => {
      try {
        const list = await http
          .get<PaperAccountDto[]>("/api/paper-accounts")
          .then((r) => r.data);

        setAccounts(list);

        const def = list.find((a) => a.isDefault) ?? list[0];

        setAccountId((prev) => prev ?? def?.id ?? null);
      } catch (e) {
        console.warn("계좌 목록 로드 실패", e);
      }
    })();
  }, []);

  /**
   * 페이지 최초 진입 시 진행 중 세션이 있으면 복구한다.
   */
  useEffect(() => {
    loadActiveSession();
  }, []);

  return {
    // 상태
    viewMode,
    setViewMode,
    syncNext,
    setSyncNext,

    sessionId,
    status,
    setStatus,

    accounts,
    accountId,
    setAccountId,

    charts: sortedCharts,
    setCharts,

    activeChartId,
    setActiveChartId,

    candlesByChart,
    setCandlesByChart,

    progressByChart,
    setProgressByChart,

    activeChart,
    activeCandles,
    activeProgress,
    visibleActiveCandles,

    loading,
    activeSessionLoading,
    error,
    setError,

    // 로직
    hydrateSession,
    loadActiveSession,
    onCreateSession,
    onNext,
    applyProgress,

    onFinishSession,

    // 차트 새로고침
    onRefreshChart,
    refreshRequest,
    setRefreshRequest,

    //지표
    globalIndicators,
    setGlobalIndicators,
    chartIndicators,
    setChartIndicators,
    getIndicatorSettings,
  };
}