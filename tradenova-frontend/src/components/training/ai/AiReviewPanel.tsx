import { useState } from "react";
import type { ChartAiPayload, SessionAiPayload } from "@/types/training";
import { Bot, X, CheckCircle2, CircleDashed } from "lucide-react";

type Props = {
    activeChartLabel: string;
    sessionAiPayload: SessionAiPayload | null;
    sessionAiLoading: boolean;
    chartAiPayload: ChartAiPayload | null;
    chartAiLoading: boolean;
    onAnalyzeChartAi: () => void;
    onAnalyzeSessionAi: () => void;
    disabled?: boolean;
};

type ReviewTarget = "CHART" | "SESSION";
type ReviewPayload = ChartAiPayload | SessionAiPayload;

function scoreLabel(score?: number | null) {
    if (score === undefined || score === null) return "-";
    return `${score}점`;
}

function isChartPayload(payload: ReviewPayload): payload is ChartAiPayload {
    return payload.analysisScope === "CHART";
}

function reviewMeta(payload: ReviewPayload | null) {
    if (!payload) return "미생성";

    if (isChartPayload(payload)) {
        return `${scoreLabel(payload.score)} · ${payload.analysisType}`;
    }

    return `${scoreLabel(payload.score)} · SESSION`;
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
                        보기
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

                {ready && (
                    <button
                        type="button"
                        disabled={disabled || loading}
                        onClick={onGenerate}
                        className="inline-flex h-7 items-center rounded-md px-2.5 text-[11px] text-muted-foreground transition hover:bg-background/70 hover:text-foreground disabled:opacity-40"
                    >
                        재생성
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
    activeChartLabel,
    sessionAiPayload,
    sessionAiLoading,
    chartAiPayload,
    chartAiLoading,
    onAnalyzeChartAi,
    onAnalyzeSessionAi,
    disabled,
}: Props) {
    const [openTarget, setOpenTarget] = useState<ReviewTarget | null>(null);

    const selectedPayload =
        openTarget === "CHART" ? chartAiPayload : sessionAiPayload;

    return (
        <>
            <div className="rounded-xl border border-border/45 bg-background/25 p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                        <div className="text-sm font-semibold">AI Review</div>
                    </div>

                    <div className="text-[11px] text-muted-foreground">
                        결과 요약
                    </div>
                </div>

                <div className="space-y-1.5">
                    <ReviewRow
                        title="Chart Review"
                        subtitle={activeChartLabel}
                        payload={chartAiPayload}
                        loading={chartAiLoading}
                        disabled={disabled}
                        onGenerate={onAnalyzeChartAi}
                        onOpen={() => setOpenTarget("CHART")}
                    />

                    <ReviewRow
                        title="Session Report"
                        subtitle="전체 훈련 세션"
                        payload={sessionAiPayload}
                        loading={sessionAiLoading}
                        disabled={disabled}
                        onGenerate={onAnalyzeSessionAi}
                        onOpen={() => setOpenTarget("SESSION")}
                    />
                </div>
            </div>

            {openTarget && selectedPayload && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
                    <button
                        type="button"
                        aria-label="닫기"
                        className="absolute inset-0 cursor-default"
                        onClick={() => setOpenTarget(null)}
                    />

                    <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-background shadow-2xl">
                        <div className="flex items-center justify-between bg-background/95 px-5 py-4">
                            <div>
                                <div className="text-base font-semibold">
                                    {openTarget === "CHART" ? "Chart Review" : "Session Report"}
                                </div>
                                <div className="mt-0.5 text-xs text-muted-foreground">
                                    {openTarget === "CHART" ? activeChartLabel : "전체 훈련 세션"}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpenTarget(null)}
                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-background/70 hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="thin-scrollbar max-h-[72vh] overflow-y-auto px-5 pb-5">
                            <div className="mb-4 rounded-xl bg-background/40 p-4">
                                <div className="text-[11px] text-muted-foreground">Score</div>
                                <div className="mt-1 text-4xl font-bold tracking-tight">
                                    {scoreLabel(selectedPayload.score)}
                                </div>

                                {isChartPayload(selectedPayload) && (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        {selectedPayload.analysisType === "DEEP"
                                            ? "스냅샷 기반 정밀 분석"
                                            : "거래/포지션 기반 빠른 분석"}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-5">
                                <section>
                                    <SectionTitle>Summary</SectionTitle>
                                    <p className="mt-2 text-sm leading-6 text-foreground/90">
                                        {selectedPayload.summary}
                                    </p>
                                </section>

                                <section>
                                    <SectionTitle>Strengths</SectionTitle>
                                    <div className="mt-2 space-y-1.5">
                                        {selectedPayload.strengths?.length ? (
                                            selectedPayload.strengths.map((item, idx) => (
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
                                        {selectedPayload.warnings?.length ? (
                                            selectedPayload.warnings.map((item, idx) => (
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