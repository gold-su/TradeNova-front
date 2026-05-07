import type { Dispatch, SetStateAction } from "react";
import type {
  Candle,
  ProgressResponse,
  TrainingChartDto,
} from "@/types/training";
import type { ViewMode } from "@/pages/training/useTrainingSessionPage";
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
import { useState } from "react";
import { IndicatorDrawer } from "@/components/training/chart/indicator/IndicatorDrawer";
import { DEFAULT_INDICATORS } from "@/components/training/chart/indicator/indicatorDefaults";

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
  activeProgress,
  visibleActiveCandles,
  onRefreshChart,
  error,
  refreshing,
  refreshRequest,
  setRefreshRequest,
  globalIndicators,
  setGlobalIndicators,
  chartIndicators,
  setChartIndicators,
  getIndicatorSettings,
}: Props) {
  const [indicatorOpen, setIndicatorOpen] = useState(false);

  const [indicatorScope, setIndicatorScope] = useState<"GLOBAL" | "CHART">(
    "GLOBAL",
  );

  return (
    <main className="flex-1 overflow-hidden p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground">Active Chart</div>
          <div className="text-lg font-semibold">
            {activeChart
              ? `${activeChart.symbolTicker} · ${activeChart.symbolName}`
              : "차트를 선택하세요."}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/30 px-3 py-2">
          <button
            type="button"
            onClick={() => {
              setIndicatorScope("GLOBAL");
              setIndicatorOpen(true);
            }}
            className="h-9 rounded-xl border border-border/60 bg-background/30 px-3 text-sm hover:bg-background/50"
          >
            보조지표
          </button>

          {/* 라벨 */}
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            새로고침
          </span>

          {/* 타입 선택 */}
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
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="RANDOM">전체 랜덤</SelectItem>
              <SelectItem value="TRAINING_SECTOR">훈련 섹터</SelectItem>
            </SelectContent>
          </Select>

          {/* 옵션 선택 */}
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
            <SelectTrigger className="h-8 w-[120px] text-xs bg-background/50 border-border/50">
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

      {error && (
        <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="h-[calc(100%-64px)]">
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
          />
        ) : (
          <TrainingChartSingle
            chart={activeChart}
            progress={activeProgress}
            candles={visibleActiveCandles}
            onRefresh={onRefreshChart}
            refreshing={refreshing}
            indicatorSettings={getIndicatorSettings(activeChartId)}
            setGlobalIndicators={setGlobalIndicators}
            setChartIndicators={setChartIndicators}
            activeChartId={activeChartId}
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
            ? `Chart ${activeChart.chartIndex + 1} · ${activeChart.symbolName}`
            : "현재 차트"
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
