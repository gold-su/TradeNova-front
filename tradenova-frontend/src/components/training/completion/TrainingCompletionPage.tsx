import {
  BarChart3,
  Bot,
  Camera,
  CheckCircle2,
  FileDown,
  RefreshCcw,
  TrendingUp,
} from "lucide-react";
import type {
  SessionAiPayload,
  SessionSummaryResponse,
} from "@/types/training";

type Props = {
  summary: SessionSummaryResponse | null;
  summaryLoading: boolean;
  summaryError: string | null;

  sessionAiPayload: SessionAiPayload | null;
  sessionAiLoading: boolean;

  onReloadSummary: () => void;
  onAnalyzeSessionAi: () => void;
  onStartNewSession: () => void;
};

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/40 p-5">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>

      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

export function TrainingCompletionPage({
  summary,
  summaryLoading,
  summaryError,
  sessionAiPayload,
  sessionAiLoading,
  onReloadSummary,
  onAnalyzeSessionAi,
  onStartNewSession,
}: Props) {
  if (summaryLoading && !summary) {
    return (
      <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-background">
        <div className="rounded-2xl border border-border/50 bg-background/40 px-8 py-6 text-center">
          <RefreshCcw className="mx-auto mb-3 h-5 w-5 animate-spin text-primary" />
          <div className="text-sm font-semibold">
            훈련 결과를 정리하고 있습니다
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            거래와 스냅샷 기록을 집계하는 중입니다.
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-background/40 p-8 text-center">
          <div className="text-base font-semibold">
            완료 정보를 불러오지 못했습니다
          </div>

          <div className="mt-2 text-sm text-muted-foreground">
            {summaryError ?? "잠시 후 다시 시도해주세요."}
          </div>

          <button
            type="button"
            onClick={onReloadSummary}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <RefreshCcw className="h-4 w-4" />
            다시 불러오기
          </button>
        </div>
      </div>
    );
  }

  const aiScore = sessionAiPayload?.score ?? summary.sessionAiScore ?? null;

  return (
    <main className="h-[calc(100vh-56px)] overflow-y-auto bg-background px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <h1 className="text-3xl font-bold">훈련 완료</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            이번 세션의 매매 기록과 판단 과정을 정리했습니다.
          </p>
        </header>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <SummaryCard
            label="완료 차트"
            value={`${summary.completedChartCount}/${summary.totalChartCount}`}
            icon={<BarChart3 className="h-4 w-4" />}
          />

          <SummaryCard
            label="거래 횟수"
            value={summary.tradeCount}
            icon={<TrendingUp className="h-4 w-4" />}
          />

          <SummaryCard
            label="스냅샷"
            value={summary.snapshotCount}
            icon={<Camera className="h-4 w-4" />}
          />

          <SummaryCard
            label="AI 점수"
            value={aiScore == null ? "-" : `${aiScore}점`}
            icon={<Bot className="h-4 w-4" />}
          />
        </section>

        <section className="mt-6 rounded-3xl border border-border/50 bg-background/40 p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-base font-semibold">
                <Bot className="h-5 w-5 text-primary" />
                세션 AI 분석
              </div>

              <div className="mt-1 text-sm text-muted-foreground">
                전체 차트, 거래, 매매 근거와 스냅샷을 종합해 평가합니다.
              </div>
            </div>

            <button
              type="button"
              onClick={onAnalyzeSessionAi}
              disabled={sessionAiLoading}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {sessionAiLoading
                ? "분석 중..."
                : summary.sessionAiExists
                  ? "AI 분석 다시 보기"
                  : "AI 분석 생성"}
            </button>
          </div>

          {sessionAiPayload && (
            <div className="mt-5 rounded-2xl bg-background/55 p-5">
              <div className="mb-2 text-sm font-semibold">
                점수 {sessionAiPayload.score}점
              </div>

              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {sessionAiPayload.summary}
              </p>
            </div>
          )}
          
        </section>

        <section className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border/50 bg-background/40 px-5 py-3 text-sm font-semibold text-muted-foreground opacity-60"
            title="PDF 내보내기는 다음 단계에서 연결합니다."
          >
            <FileDown className="h-4 w-4" />
            PDF 리포트
          </button>

          <button
            type="button"
            onClick={onStartNewSession}
            className="flex-1 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            새 훈련 시작
          </button>
        </section>
      </div>
    </main>
  );
}
