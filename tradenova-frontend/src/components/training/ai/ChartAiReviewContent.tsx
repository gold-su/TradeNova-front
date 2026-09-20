import type { ChartAiPayload } from "@/types/training";

export function ChartAiReviewContent({ payload }: { payload: ChartAiPayload }) {
  return (
    <div className="space-y-5">
      <div><div className="text-sm font-semibold">점수 {payload.score}점</div><p className="mt-1 text-xs text-muted-foreground">{payload.analysisType === "DEEP" ? "스냅샷 기반 정밀 분석" : "거래/포지션 기반 빠른 분석"}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{payload.summary}</p></div>
      <ReviewList title="잘한 판단" items={payload.strengths} tone="positive" />
      <ReviewList title="주의할 점" items={payload.warnings} tone="warning" />
    </div>
  );
}

function ReviewList({ title, items, tone }: { title: string; items: string[]; tone: "positive" | "warning" }) {
  return <section><h3 className="text-sm font-semibold">{title}</h3>{items.length ? <ul className="mt-2 space-y-1.5">{items.map((item, index) => <li key={`${item}-${index}`} className={`rounded-lg px-3 py-2 text-sm ${tone === "positive" ? "bg-primary/[0.07] text-primary" : "bg-red-500/10 text-red-300"}`}>{item}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">-</p>}</section>;
}
