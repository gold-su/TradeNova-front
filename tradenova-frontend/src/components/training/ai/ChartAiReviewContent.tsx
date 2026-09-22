import type { ChartAiPayload } from "@/types/training";

export function ChartAiReviewContent({ payload }: { payload: ChartAiPayload }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm font-semibold">AI Review · {payload.score}</div>
        <p className="mt-1 text-xs text-muted-foreground">{payload.analysisType === "DEEP" ? "스냅샷 기반 정밀 분석" : "거래/포지션 기반 빠른 분석"}</p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{payload.summary}</p>
      </div>
      <ReviewList title="잘한 판단" items={payload.strengths} />
      <ReviewList title="보완할 점" items={payload.warnings} />
    </div>
  );
}

function ReviewList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return <section><h3 className="text-sm font-semibold">{title}</h3><ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-2"><span aria-hidden="true" className="text-primary">•</span><span>{item}</span></li>)}</ul></section>;
}
