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
import { SessionAiReviewContent } from "@/components/training/ai/SessionAiReviewContent";
import {
  getSessionAiAction,
} from "@/components/training/ai/sessionAiReview";
import { useI18n } from "@/i18n/LanguageProvider";

type Props = {
  summary: SessionSummaryResponse | null;
  summaryLoading: boolean;
  summaryError: string | null;

  sessionAiPayload: SessionAiPayload | null;
  sessionAiLoading: boolean;
  sessionAiError: string | null;

  newSessionLoading: boolean;

  onReloadSummary: () => void;
  onAnalyzeSessionAi: () => void;
  onLoadSessionAi: () => void;
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
  sessionAiError,
  newSessionLoading,
  onReloadSummary,
  onAnalyzeSessionAi,
  onLoadSessionAi,
  onStartNewSession,
}: Props) {
  const { t } = useI18n();
  if (summaryLoading && !summary) {
    return (
      <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-background">
        <div className="rounded-2xl border border-border/50 bg-background/40 px-8 py-6 text-center">
          <RefreshCcw className="mx-auto mb-3 h-5 w-5 animate-spin text-primary" />
          <div className="text-sm font-semibold">
            {t("training.completion.organizing")}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {t("training.completion.aggregating")}
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
            {t("training.completion.loadFailed")}
          </div>

          <div className="mt-2 text-sm text-muted-foreground">
            {summaryError ?? t("common.tryAgainLater")}
          </div>

          <button
            type="button"
            onClick={onReloadSummary}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <RefreshCcw className="h-4 w-4" />
            {t("common.retry")}
          </button>
        </div>
      </div>
    );
  }

  const aiScore = sessionAiPayload?.score ?? summary.sessionAiScore ?? null;
  const sessionAiAction = getSessionAiAction(
    Boolean(sessionAiPayload),
    summary.sessionAiExists,
  );

  return (
    <main className="relative h-[calc(100vh-56px)] overflow-y-auto bg-background px-6 py-10">
      {newSessionLoading && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="rounded-3xl border border-border/60 bg-background px-8 py-7 text-center shadow-xl">
            <RefreshCcw className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />

            <div className="text-base font-semibold">
              {t("training.completion.preparing")}
            </div>

            <div className="mt-2 text-sm text-muted-foreground">
              {t("training.completion.loadingNew")}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <h1 className="text-3xl font-bold">{t("training.completion.title")}</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {t("training.completion.description")}
          </p>
        </header>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <SummaryCard
            label={t("training.completion.charts")}
            value={`${summary.completedChartCount}/${summary.totalChartCount}`}
            icon={<BarChart3 className="h-4 w-4" />}
          />

          <SummaryCard
            label={t("training.completion.trades")}
            value={summary.tradeCount}
            icon={<TrendingUp className="h-4 w-4" />}
          />

          <SummaryCard
            label={t("training.completion.snapshots")}
            value={summary.snapshotCount}
            icon={<Camera className="h-4 w-4" />}
          />

          <SummaryCard
            label={t("training.completion.aiScore")}
            value={aiScore == null ? "-" : t("training.review.score", { score: aiScore })}
            icon={<Bot className="h-4 w-4" />}
          />
        </section>

        <section className="mt-6 rounded-3xl border border-border/50 bg-background/40 p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-base font-semibold">
                <Bot className="h-5 w-5 text-primary" />
                {t("training.completion.sessionReview")}
              </div>

              <div className="mt-1 text-sm text-muted-foreground">
                {t("training.completion.reviewDescription")}
              </div>
            </div>

            {sessionAiAction && (
              <button
                type="button"
                onClick={sessionAiAction === "LOAD" ? onLoadSessionAi : onAnalyzeSessionAi}
                disabled={sessionAiLoading || newSessionLoading}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sessionAiLoading
                  ? t("training.review.analyzing")
                  : sessionAiAction === "LOAD"
                    ? t("training.review.loadSaved")
                    : t("training.review.generate")}
              </button>
            )}
          </div>

          {sessionAiError && (
            <p role="alert" className="mt-4 text-sm text-red-300">
              {sessionAiError}
            </p>
          )}

          {sessionAiPayload && (
            <div className="mt-5 rounded-2xl bg-background/55 p-5">
              <SessionAiReviewContent payload={sessionAiPayload} />
            </div>
          )}
        </section>

        <section className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border/50 bg-background/40 px-5 py-3 text-sm font-semibold text-muted-foreground opacity-60"
            title={t("training.completion.pdfSoon")}
          >
            <FileDown className="h-4 w-4" />
            {t("training.completion.pdf")}
          </button>

          <button
            type="button"
            onClick={onStartNewSession}
            disabled={newSessionLoading}
            className="flex-1 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            {newSessionLoading ? t("training.completion.preparing") : t("training.completion.newSession")}
          </button>
        </section>
      </div>
    </main>
  );
}
