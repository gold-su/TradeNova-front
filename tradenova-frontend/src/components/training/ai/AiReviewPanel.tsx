import { useState, type Dispatch, type SetStateAction } from "react";
import type { ChartAiPayload, TrainingChartDto } from "@/types/training";
import { Bot, X, CheckCircle2, CircleDashed } from "lucide-react";
import {
    ACTIVE_AI_REVIEW_TARGETS,
    GENERATED_REVIEW_ACTION_LABEL,
} from "@/components/training/ai/sessionAiReview";

type Props = {
    charts: TrainingChartDto[];
    reviewTargetChartId: number | null;
    setReviewTargetChartId: Dispatch<SetStateAction<number | null>>;
    chartAiPayload: ChartAiPayload | null;
    chartAiLoading: boolean;
    onAnalyzeChartAi: () => void;
    disabled?: boolean;
};

function sectorLabel(sector?: string) {
    const labels: Record<string, string> = {
        SEMICONDUCTOR: "반도체",
        SECONDARY_BATTERY: "2차전지",
        PLATFORM: "플랫폼",
        BIO: "바이오",
        FINANCE: "금융",
        DEFENSE: "방산",
        SHIPBUILDING: "조선",
    };
    return sector ? labels[sector] ?? "블라인드 차트" : "블라인드 차트";
}

type ReviewPayload = ChartAiPayload;

function scoreLabel(score?: number | null) {
    if (score === undefined || score === null) return "-";
    return `${score}점`;
}

function reviewMeta(payload: ReviewPayload | null) {
    if (!payload) return "미생성";
    return `${scoreLabel(payload.score)} · ${payload.analysisType}`;
}

function ReviewStatus({
    payload,
    loading,
}: {
    payload: ReviewPayload | null;
    loading: boolean;
}) {
    if (loading) {
        return (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <CircleDashed className="h-3 w-3 animate-spin" />
                분석 중
            </span>
        );
    }

    if (payload) {
        return (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-primary">
                <CheckCircle2 className="h-3 w-3" />
                생성완료
            </span>
        );
    }

    return (
        <span className="text-[11px] text-muted-foreground">
            미생성
        </span>
    );
}

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
    const ready = !!payload;

    return (
        <div className="group flex min-h-[52px] items-center gap-3 rounded-lg border border-border/35 bg-background/25 px-3 py-2 transition-all duration-200 hover:border-primary/40 hover:bg-primary/[0.04] hover:shadow-[0_0_18px_rgba(34,197,94,0.08)]">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">
                        {title}
                    </span>
                    <ReviewStatus payload={payload} loading={loading} />
                </div>

                <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {ready ? reviewMeta(payload) : subtitle}
                </div>
            </div>

            <div className="flex h-8 shrink-0 items-center gap-1 self-center">
                {ready ? (
                    <button
                        type="button"
                        onClick={onOpen}
                        className="inline-flex h-7 items-center rounded-md px-2.5 text-[11px] font-medium text-muted-foreground transition hover:bg-background/70 hover:text-foreground"
                    >
                        {GENERATED_REVIEW_ACTION_LABEL}
                    </button>
                ) : (
                    <button
                        type="button"
                        disabled={disabled || loading}
                        onClick={onGenerate}
                        className="inline-flex h-7 items-center rounded-md bg-primary/10 px-2.5 text-[11px] font-semibold text-primary transition hover:bg-primary/15 disabled:opacity-40"
                    >
                        {loading ? "생성 중" : "생성"}
                    </button>
                )}

            </div>
        </div>
    );
}
function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {children}
        </div>
    );
}

export function AiReviewPanel({
    charts,
    reviewTargetChartId,
    setReviewTargetChartId,
    chartAiPayload,
    chartAiLoading,
    onAnalyzeChartAi,
    disabled,
}: Props) {
    const [open, setOpen] = useState(false);
    const targetChart = charts.find((chart) => chart.chartId === reviewTargetChartId) ?? null;
    const targetLabel = targetChart
        ? `Chart ${targetChart.chartIndex + 1} · ${sectorLabel(targetChart.trainingSector)}`
        : "차트 선택";

    return (
        <>
            <section className="border-t border-border/35 py-4">
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                        <div className="text-xs font-semibold tracking-wide text-muted-foreground">AI REVIEW</div>
                    </div>

                    <div className="text-[11px] text-muted-foreground">
                        차트별 분석
                    </div>
                </div>

                <label className="mb-2 block">
                    <span className="sr-only">리뷰 대상 차트</span>
                    <select
                        aria-label="리뷰 대상 차트"
                        value={reviewTargetChartId ?? ""}
                        onChange={(event) => setReviewTargetChartId(Number(event.target.value))}
                        className="h-9 w-full rounded-lg border border-border/40 bg-background/55 px-2 text-xs font-semibold outline-none focus:border-primary/40"
                    >
                        {charts.map((chart) => (
                            <option key={chart.chartId} value={chart.chartId}>
                                Chart {chart.chartIndex + 1} · {sectorLabel(chart.trainingSector)}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="space-y-1.5">
                    {ACTIVE_AI_REVIEW_TARGETS.includes("CHART") && (
                        <ReviewRow
                            title="Chart Review"
                            subtitle={targetLabel}
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
                        aria-label="닫기"
                        className="absolute inset-0 cursor-default"
                        onClick={() => setOpen(false)}
                    />

                    <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-background shadow-2xl">
                        <div className="flex items-center justify-between bg-background/95 px-5 py-4">
                            <div>
                                <div className="text-base font-semibold">
                                    Chart Review
                                </div>
                                <div className="mt-0.5 text-xs text-muted-foreground">
                                    {targetLabel}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-background/70 hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="thin-scrollbar max-h-[72vh] overflow-y-auto px-5 pb-5">
                            <div className="mb-4 rounded-xl bg-background/40 p-4">
                                <div className="text-[11px] text-muted-foreground">Score</div>
                                <div className="mt-1 text-4xl font-bold tracking-tight">
                                    {scoreLabel(chartAiPayload.score)}
                                </div>

                                <div className="mt-2 text-xs text-muted-foreground">
                                    {chartAiPayload.analysisType === "DEEP"
                                        ? "스냅샷 기반 정밀 분석"
                                        : "거래/포지션 기반 빠른 분석"}
                                </div>
                            </div>

                            <div className="space-y-5">
                                <section>
                                    <SectionTitle>Summary</SectionTitle>
                                    <p className="mt-2 text-sm leading-6 text-foreground/90">
                                        {chartAiPayload.summary}
                                    </p>
                                </section>

                                <section>
                                    <SectionTitle>Strengths</SectionTitle>
                                    <div className="mt-2 space-y-1.5">
                                        {chartAiPayload.strengths?.length ? (
                                            chartAiPayload.strengths.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="rounded-lg bg-primary/[0.07] px-3 py-2 text-sm text-primary"
                                                >
                                                    {item}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-muted-foreground">-</div>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <SectionTitle>Warnings</SectionTitle>
                                    <div className="mt-2 space-y-1.5">
                                        {chartAiPayload.warnings?.length ? (
                                            chartAiPayload.warnings.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300"
                                                >
                                                    {item}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-muted-foreground">-</div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
