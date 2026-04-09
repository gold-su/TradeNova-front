import type { Dispatch, SetStateAction } from "react";
import type { TrainingChartDto, TrainingStatus } from "@/types/training";
import type {
  PaperAccountDto,
  ViewMode,
} from "@/hooks/training/training.types";
import { SessionInfoCard } from "@/components/training/common/SessionInfoCard";

type Props = {
  sessionId: number | null;
  status: TrainingStatus;
  accounts: PaperAccountDto[];
  accountId: number | null;
  setAccountId: Dispatch<SetStateAction<number | null>>;
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  syncNext: boolean;
  setSyncNext: Dispatch<SetStateAction<boolean>>;
  charts: TrainingChartDto[];
  activeChartId: number | null;
  setActiveChartId: Dispatch<SetStateAction<number | null>>;
  loading: boolean;
  onCreateSession: () => void;
  onFinishSession: () => void;
};

export function TrainingLeftPanel({
  sessionId,
  status,
  accounts,
  accountId,
  setAccountId,
  viewMode,
  setViewMode,
  syncNext,
  setSyncNext,
  charts,
  activeChartId,
  setActiveChartId,
  loading,
  onCreateSession,
  onFinishSession,
}: Props) {
  return (
    <aside className="w-[280px] shrink-0 border-r border-border/60 bg-background/40 p-4">
      <div className="space-y-4">
        <SessionInfoCard sessionId={sessionId} status={status} />

        <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
          <div className="mb-2 text-sm font-semibold">계좌</div>
          <select
            value={accountId ?? ""}
            onChange={(e) =>
              setAccountId(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
          <div className="mb-2 text-sm font-semibold">보기</div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-xl px-3 py-2 text-sm ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/60 bg-background"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("single")}
              className={`rounded-xl px-3 py-2 text-sm ${
                viewMode === "single"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/60 bg-background"
              }`}
            >
              Single
            </button>
          </div>

          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={syncNext}
              onChange={(e) => setSyncNext(e.target.checked)}
            />
            Grid에서 NEXT 동기 진행
          </label>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
          <div className="mb-2 text-sm font-semibold">차트 목록</div>
          <div className="space-y-2">
            {charts.map((c) => (
              <button
                key={c.chartId}
                onClick={() => setActiveChartId(c.chartId)}
                className={`w-full rounded-xl border px-3 py-3 text-left ${
                  activeChartId === c.chartId
                    ? "border-primary/40 bg-primary/10"
                    : "border-border/60 bg-background/20"
                }`}
              >
                <div className="text-xs text-muted-foreground">
                  Chart {c.chartIndex + 1}
                </div>
                <div className="text-sm font-semibold">
                  {c.symbolTicker}{" "}
                  <span className="text-muted-foreground">
                    · {c.symbolName}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onCreateSession}
          disabled={loading}
          className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {loading ? "생성 중..." : "새 훈련 시작"}
        </button>
        <button
          onClick={onFinishSession}
          disabled={loading || !sessionId || status === "COMPLETED"}
          className="w-full rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm font-semibold disabled:opacity-50"
        >
          세션 종료
        </button>
      </div>
    </aside>
  );
}
