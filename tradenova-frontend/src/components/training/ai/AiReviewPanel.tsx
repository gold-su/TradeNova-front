import { useState } from "react";
import type { ChartAiPayload, TrainingChartDto } from "@/types/training";
import { Bot, X } from "lucide-react";
import {
    ACTIVE_AI_REVIEW_TARGETS,
} from "@/components/training/ai/sessionAiReview";
import { ChartAiReviewContent } from "@/components/training/ai/ChartAiReviewContent";
import { useI18n } from "@/i18n/LanguageProvider";

type Props = {
    charts: TrainingChartDto[];
    activeChartId: number | null;
    chartAiPayload: ChartAiPayload | null;
    chartAiLoading: boolean;
    onAnalyzeChartAi: () => void;
    disabled?: boolean;
};

type ReviewPayload = ChartAiPayload;

function ReviewRow({
    title,
    subtitle,
    payload,
    loading,
    onGenerate,
    onOpen,
    disabled,
}: {
    title: string;
    subtitle: string;
    payload: ReviewPayload | null;
    loading: boolean;
    onGenerate: () => void;
    onOpen: () => void;
    disabled?: boolean;
}) {
    const { t } = useI18n();
    const ready = !!payload;

    return (
        <div className="flex min-h-[56px] items-center gap-2 rounded-lg bg-muted/20 px-2.5 py-2">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">
                        {title}
                    </span>

                </div>

                <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {loading ? t("training.review.analyzing") : ready ? `${t("training.review.score", { score: payload.score })} · ${payload.analysisType}` : subtitle}
                </div>
            </div>

            <div className="flex h-8 shrink-0 items-center gap-1 self-center">
                {ready ? (
                    <button
                        type="button"
                        onClick={onOpen}
                        className="inline-flex h-7 items-center rounded-md px-2.5 text-[11px] font-medium text-muted-foreground transition hover:bg-background/70 hover:text-foreground"
                    >
                        {t("training.review.loadSaved")}
                    </button>
                ) : (
                    <button
                        type="button"
                        disabled={disabled || loading}
                        onClick={onGenerate}
                        className="inline-flex h-7 items-center rounded-md bg-primary/10 px-2.5 text-[11px] font-semibold text-primary transition hover:bg-primary/15 disabled:opacity-40"
                    >
                        {loading ? t("training.review.analyzing") : t("training.review.generate")}
                    </button>
                )}

            </div>
        </div>
    );
}
export function AiReviewPanel({
    charts,
    activeChartId,
    chartAiPayload,
    chartAiLoading,
    onAnalyzeChartAi,
    disabled,
}: Props) {
    const { t } = useI18n();
    const [open, setOpen] = useState(false);
    const targetChart = charts.find((chart) => chart.chartId === activeChartId) ?? null;
    const targetLabel = targetChart
        ? `Chart ${targetChart.chartIndex + 1} · ${t(`training.sector.${targetChart.trainingSector ?? "unknown"}`)}`
        : t("training.chartUi.selectPrompt");

    return (
        <>
            <section className="border-t border-border/35 py-4">
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                        <div className="text-xs font-semibold tracking-wide text-muted-foreground">AI REVIEW</div>
                    </div>

                    <div className="text-[11px] text-muted-foreground">
                        {t("training.review.chartReview")}
                    </div>
                </div>


                <div className="space-y-1.5">
                    {ACTIVE_AI_REVIEW_TARGETS.includes("CHART") && (
                        <ReviewRow
                            title={targetLabel}
                            subtitle={t("training.review.notGenerated")}
                            payload={chartAiPayload}
                            loading={chartAiLoading}
                            disabled={disabled}
                            onGenerate={onAnalyzeChartAi}
                            onOpen={() => setOpen(true)}
                        />
                    )}
                </div>
            </section>

            {open && chartAiPayload && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
                    <button
                        type="button"
                        aria-label={t("common.close")}
                        className="absolute inset-0 cursor-default"
                        onClick={() => setOpen(false)}
                    />

                    <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-background shadow-2xl">
                        <div className="flex items-center justify-between bg-background/95 px-5 py-4">
                            <div>
                                <div className="text-base font-semibold">
                                    {t("training.review.chartReview")}
                                </div>
                                <div className="mt-0.5 text-xs text-muted-foreground">
                                    {targetLabel}
                                </div>
                            </div>

                            <button
                                type="button"
                                aria-label={t("training.review.close")}
                                onClick={() => setOpen(false)}
                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-background/70 hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="thin-scrollbar max-h-[72vh] overflow-y-auto px-5 pb-5">
                            <ChartAiReviewContent payload={chartAiPayload} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
