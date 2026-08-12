import type { Dispatch, SetStateAction } from "react";
import type {
  Candle,
  ProgressResponse,
  TrainingChartDto,
} from "@/types/training";
import type { ViewMode } from "@/hooks/training/training.types";
import { TrainingChartGrid } from "@/components/training/chart/TrainingChartGrid";
import { TrainingChartSingle } from "@/components/training/chart/TrainingChartSingle";
import type { ChartRefreshRequest, IndicatorSettings } from "@/types/training";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { IndicatorDrawer } from "@/components/training/chart/indicator/IndicatorDrawer";
import { DEFAULT_INDICATORS } from "@/components/training/chart/indicator/indicatorDefaults";
import type { TradeChartMarker } from "@/components/training/chart/CandleChart";
import {
  PencilLine,
  Activity,
  Building2,
  Newspaper,
  Camera,
} from "lucide-react";

function sectorLabel(sector?: string) {
  switch (sector) {
    case "SEMICONDUCTOR":
      return "반도체";
    case "SECONDARY_BATTERY":
      return "2차전지";
    case "PLATFORM":
      return "플랫폼";
    case "BIO":
      return "바이오";
    case "FINANCE":
      return "금융";
    case "DEFENSE":
      return "방산";
    case "SHIPBUILDING":
      return "조선";
    default:
      return "블라인드";
  }
}

type Props = {
  charts: TrainingChartDto[];
  activeChartId: number | null;
  setActiveChartId: Dispatch<SetStateAction<number | null>>;
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  candlesByChart: Record<number, Candle[]>;
  progressByChart: Record<number, ProgressResponse>;
  activeChart: TrainingChartDto | null;
  activeProgress: ProgressResponse | null;
  visibleActiveCandles: Candle[];
  error: string | null;
  autoExitNotices: Array<{ id: number; message: string }>;
  onRefreshChart: (chartId: number) => void;
  refreshing: boolean;
  refreshRequest: ChartRefreshRequest;
  setRefreshRequest: React.Dispatch<React.SetStateAction<ChartRefreshRequest>>;
  globalIndicators: IndicatorSettings;
  setGlobalIndicators: React.Dispatch<React.SetStateAction<IndicatorSettings>>;
  chartIndicators: Record<number, IndicatorSettings>;
  setChartIndicators: React.Dispatch<
    React.SetStateAction<Record<number, IndicatorSettings>>
  >;
  getIndicatorSettings: (chartId: number | null) => IndicatorSettings;
  tradeMarkersByChart: Record<number, TradeChartMarker[]>;
};

export function TrainingCenterPanel({
  charts,
  activeChartId,
  setActiveChartId,
  viewMode,
  setViewMode,
  candlesByChart,
  progressByChart,
  activeChart,
  visibleActiveCandles,
  onRefreshChart,
  error,
  autoExitNotices,
  refreshing,
  refreshRequest,
  setRefreshRequest,
  globalIndicators,
  setGlobalIndicators,
  chartIndicators,
  setChartIndicators,
  getIndicatorSettings,
  activeProgress,
  tradeMarkersByChart = {},
}: Props) {
  const [indicatorOpen, setIndicatorOpen] = useState(false);

  const [indicatorScope, setIndicatorScope] = useState<"GLOBAL" | "CHART">(
    "GLOBAL",
  );

  const [visibleError, setVisibleError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;

    setVisibleError(error);

    const timer = window.setTimeout(() => {
      setVisibleError(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [error]);

  return (
    <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-2">
      {/* 상단 헤더 */}
      <div className="shrink-0 border-b border-border/40 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70">
              ACTIVE CHART
            </div>

            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-md border border-border/50 bg-background/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                Chart {activeChart ? activeChart.chartIndex + 1 : "-"}
              </span>

              <span className="text-xl font-bold tracking-tight text-foreground">
                {activeChart
                  ? sectorLabel(activeChart.trainingSector)
                  : "차트를 선택하세요"}
              </span>
            </div>
          </div>

          <div className="flex rounded-xl bg-background/40 p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${viewMode === "grid"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Grid
            </button>

            <button
              type="button"
              onClick={() => setViewMode("single")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${viewMode === "single"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Single
            </button>
          </div>
        </div>

        {/* 툴바 */}
        <div className="mt-2 flex h-9 items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_14px_rgba(52,211,153,0.18)]"
            >
              <PencilLine className="h-3.5 w-3.5" />
              그리기
            </button>

            <button
              type="button"
              onClick={() => {
                setIndicatorScope("GLOBAL");
                setIndicatorOpen(true);
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_14px_rgba(52,211,153,0.18)]"
            >
              <Activity className="h-3.5 w-3.5" />
              보조지표
            </button>

            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_14px_rgba(52,211,153,0.18)]"
            >
              <Building2 className="h-3.5 w-3.5" />
              재무
            </button>

            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_14px_rgba(52,211,153,0.18)]"
            >
              <Newspaper className="h-3.5 w-3.5" />
              뉴스
            </button>

            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_14px_rgba(52,211,153,0.18)]"
            >
              <Camera className="h-3.5 w-3.5" />
              캡처
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">새로고침</span>

            <Select
              value={refreshRequest.refreshType}
              onValueChange={(value) => {
                const type = value as ChartRefreshRequest["refreshType"];

                setRefreshRequest({
                  refreshType: type,
                  optionValue:
                    type === "RANDOM"
                      ? null
                      : (refreshRequest.optionValue ?? "SEMICONDUCTOR"),
                });
              }}
            >
              <SelectTrigger className="h-8 w-[110px] border-border/40 bg-background/30 text-xs">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="RANDOM">전체 랜덤</SelectItem>
                <SelectItem value="TRAINING_SECTOR">섹터 선택</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={refreshRequest.optionValue ?? "SEMICONDUCTOR"}
              onValueChange={(value) =>
                setRefreshRequest((prev) => ({
                  ...prev,
                  optionValue: value,
                }))
              }
              disabled={refreshRequest.refreshType === "RANDOM"}
            >
              <SelectTrigger className="h-8 w-[110px] border-border/40 bg-background/30 text-xs disabled:opacity-40">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="SEMICONDUCTOR">반도체</SelectItem>
                <SelectItem value="SECONDARY_BATTERY">2차전지</SelectItem>
                <SelectItem value="PLATFORM">플랫폼</SelectItem>
                <SelectItem value="BIO">바이오</SelectItem>
                <SelectItem value="FINANCE">금융</SelectItem>
                <SelectItem value="DEFENSE">방산</SelectItem>
                <SelectItem value="SHIPBUILDING">조선</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {visibleError && (
        <div className="pointer-events-none absolute left-6 right-6 top-[92px] z-30 rounded-2xl border border-red-500/35 bg-red-500/15 px-5 py-3 text-sm font-semibold text-red-100 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span>{visibleError}</span>
          </div>
        </div>
      )}

      {autoExitNotices.length > 0 && (
        <div
          className={`pointer-events-none absolute left-6 right-6 z-30 space-y-2 ${
            visibleError ? "top-[150px]" : "top-[92px]"
          }`}
        >
          {autoExitNotices.map((notice) => (
            <div
              key={notice.id}
              role="status"
              className="rounded-2xl border border-amber-400/35 bg-amber-400/15 px-5 py-3 text-sm font-semibold text-amber-50 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                <span>{notice.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="min-h-0 flex-1 pt-3">
        {viewMode === "grid" ? (
          <TrainingChartGrid
            charts={charts}
            activeChartId={activeChartId}
            setActiveChartId={setActiveChartId}
            candlesByChart={candlesByChart}
            progressByChart={progressByChart}
            onOpenSingle={() => setViewMode("single")}
            onRefreshChart={onRefreshChart}
            refreshing={refreshing}
            globalIndicators={globalIndicators}
            chartIndicators={chartIndicators}
            tradeMarkersByChart={tradeMarkersByChart ?? {}}
          />
        ) : (
          <TrainingChartSingle
            chart={activeChart}
            progress={activeProgress}
            candles={visibleActiveCandles}
            onRefresh={onRefreshChart}
            refreshing={refreshing}
            indicatorSettings={getIndicatorSettings(activeChartId)}
            tradeMarkers={
              activeChartId ? (tradeMarkersByChart[activeChartId] ?? []) : []
            }
          />
        )}
      </div>
      <IndicatorDrawer
        open={indicatorOpen}
        onClose={() => setIndicatorOpen(false)}
        scope={indicatorScope}
        onScopeChange={setIndicatorScope}
        activeChartLabel={
          activeChart
            ? `Chart ${activeChart.chartIndex + 1} · 블라인드 차트`
            : "차트를 선택하세요."
        }
        hasChartOverride={!!(activeChartId && chartIndicators[activeChartId])}
        settings={
          indicatorScope === "GLOBAL"
            ? globalIndicators
            : getIndicatorSettings(activeChartId)
        }
        onChange={(next) => {
          if (indicatorScope === "GLOBAL") {
            setGlobalIndicators(next);
            return;
          }

          if (!activeChartId) return;

          setChartIndicators((prev) => ({
            ...prev,
            [activeChartId]: next,
          }));
        }}
        onResetChart={() => {
          if (!activeChartId) return;

          setChartIndicators((prev) => {
            const next = { ...prev };
            delete next[activeChartId];
            return next;
          });

          setIndicatorScope("GLOBAL");
        }}
        onApplyChartToGlobal={() => {
          if (!activeChartId) return;

          const current = getIndicatorSettings(activeChartId);

          setGlobalIndicators(current);
          setIndicatorScope("GLOBAL");
        }}
        hasAnyChartOverride={Object.keys(chartIndicators).length > 0}
        onResetGlobal={() => {
          setGlobalIndicators(DEFAULT_INDICATORS);
        }}
        onClearAllChartOverrides={() => {
          setChartIndicators({});
        }}
      />
    </main>
  );
}
