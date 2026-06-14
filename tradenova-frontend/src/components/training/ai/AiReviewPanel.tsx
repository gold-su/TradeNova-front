import { useState } from "react";
import type { ChartAiPayload, SessionAiPayload } from "@/types/training";
import { Bot, X } from "lucide-react";

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

function scoreLabel(score?: number) {
    if (score === undefined || score === null) return "-";
    return `${score}점`;
}

function AnalysisBadge({ label }: { label: string }) {
    return (
        <span className="rounded-md border border-border/50 bg-background/50 px-2 py-1 text-[11px] text-muted-foreground">
            {label}
        </span>
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

    const chartReady = !!chartAiPayload;
    const sessionReady = !!sessionAiPayload;

    const selectedPayload =
        openTarget === "CHART" ? chartAiPayload : sessionAiPayload;

    return (
        <>
            <div className="rounded-xl border border-border/60 bg-background/30 p-3">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-semibold">AI Review</div>
                        <div className="text-[11px] text-muted-foreground">
                            차트/세션 분석 결과를 확인합니다.
                        </div>
                    </div>

                    <Bot className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                    <div className="rounded-lg border border-border/45 bg-background/35 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <div>
                                <div className="text-xs font-semibold">차트 리뷰</div>
                                <div className="mt-0.5 text-[11px] text-muted-foreground">
                                    {activeChartLabel}
                                </div>
                            </div>

                            <AnalysisBadge
                                label={
                                    chartAiPayload
                                        ? scoreLabel(chartAiPayload.score)
                                        : "미생성"
                                }
                            />
                        </div>

                        {chartAiPayload && (
                            <p className="mb-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                                {chartAiPayload.summary}
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                disabled={!chartReady}
                                onClick={() => setOpenTarget("CHART")}
                                className="rounded-md border border-border/50 px-3 py-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
                            >
                                보기
                            </button>

                            <button
                                type="button"
                                disabled={disabled || chartAiLoading}
                                onClick={onAnalyzeChartAi}
                                className="rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary disabled:opacity-40"
                            >
                                {chartAiLoading ? "분석 중..." : chartReady ? "다시 분석" : "생성"}
                            </button>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border/45 bg-background/35 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <div>
                                <div className="text-xs font-semibold">세션 리포트</div>
                                <div className="mt-0.5 text-[11px] text-muted-foreground">
                                    전체 훈련 결과
                                </div>
                            </div>

                            <AnalysisBadge
                                label={
                                    sessionAiPayload
                                        ? scoreLabel(sessionAiPayload.score)
                                        : "미생성"
                                }
                            />
                        </div>

                        {sessionAiPayload && (
                            <p className="mb-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                                {sessionAiPayload.summary}
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                disabled={!sessionReady}
                                onClick={() => setOpenTarget("SESSION")}
                                className="rounded-md border border-border/50 px-3 py-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
                            >
                                보기
                            </button>

                            <button
                                type="button"
                                disabled={disabled || sessionAiLoading}
                                onClick={onAnalyzeSessionAi}
                                className="rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary disabled:opacity-40"
                            >
                                {sessionAiLoading
                                    ? "분석 중..."
                                    : sessionReady
                                        ? "다시 보기"
                                        : "생성"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {openTarget && selectedPayload && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
                    <button
                        type="button"
                        aria-label="닫기"
                        className="absolute inset-0 cursor-default"
                        onClick={() => setOpenTarget(null)}
                    />

                    <div className="relative z-10 h-full w-[560px] border-l border-border/60 bg-background p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-3">
                            <div>
                                <div className="text-base font-semibold">
                                    {openTarget === "CHART" ? "차트 AI 리뷰" : "세션 AI 리포트"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {openTarget === "CHART" ? activeChartLabel : "전체 훈련 세션"}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpenTarget(null)}
                                className="rounded-lg border border-border/50 p-2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="thin-scrollbar h-[calc(100%-64px)] space-y-4 overflow-y-auto pr-1">
                            <section className="rounded-xl border border-border/50 bg-background/40 p-4">
                                <div className="mb-1 text-xs text-muted-foreground">점수</div>
                                <div className="text-3xl font-bold">
                                    {scoreLabel(selectedPayload.score)}
                                </div>
                            </section>

                            <section className="rounded-xl border border-border/50 bg-background/40 p-4">
                                <div className="mb-2 text-sm font-semibold">요약</div>
                                <p className="text-sm leading-6 text-foreground/90">
                                    {selectedPayload.summary}
                                </p>
                            </section>

                            {"analysisType" in selectedPayload && (
                                <section className="rounded-xl border border-border/50 bg-background/40 p-4">
                                    <div className="mb-2 text-sm font-semibold">분석 방식</div>
                                    <div className="text-sm text-muted-foreground">
                                        {selectedPayload.analysisType === "DEEP"
                                            ? "스냅샷 기반 정밀 분석"
                                            : "거래/포지션 기반 빠른 분석"}
                                    </div>
                                </section>
                            )}

                            <section className="rounded-xl border border-border/50 bg-background/40 p-4">
                                <div className="mb-2 text-sm font-semibold">강점</div>
                                <div className="space-y-2">
                                    {selectedPayload.strengths?.length ? (
                                        selectedPayload.strengths.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="rounded-lg border border-primary/20 bg-primary/[0.06] px-3 py-2 text-sm text-primary"
                                            >
                                                {item}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-muted-foreground">-</div>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-xl border border-border/50 bg-background/40 p-4">
                                <div className="mb-2 text-sm font-semibold">주의점</div>
                                <div className="space-y-2">
                                    {selectedPayload.warnings?.length ? (
                                        selectedPayload.warnings.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"
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
            )}
        </>
    );
}