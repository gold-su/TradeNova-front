import type { SessionAiPayload } from "@/types/training";
import { getSessionAiReviewVisibility } from "@/components/training/ai/sessionAiReview";

type Props = { payload: SessionAiPayload };

function List({ items }: { items?: string[] | null }) {
  if (!items?.length) return null;
  return (
    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-2">
          <span aria-hidden="true" className="text-primary">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-foreground">{children}</h3>;
}

function Detail({ label, children }: { label: string; children: string }) {
  if (!children) return null;
  return (
    <p className="mt-3 text-sm leading-6 text-muted-foreground">
      <span className="font-medium text-foreground/90">{label}</span> {children}
    </p>
  );
}

export function SessionAiReviewContent({ payload }: Props) {
  const visible = getSessionAiReviewVisibility(payload);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-semibold">점수 {payload.score}점</div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {payload.summary}
        </p>
      </div>

      {!!payload.strengths?.length && <section><Heading>잘한 판단</Heading><List items={payload.strengths} /></section>}
      {!!payload.warnings?.length && <section><Heading>주의할 점</Heading><List items={payload.warnings} /></section>}

      {visible.decisionReview && payload.decisionReview && (
        <section className="border-t border-border/40 pt-5">
          <Heading>Decision Review</Heading>
          <Detail label="평가" children={payload.decisionReview.assessment} />
          <List items={payload.decisionReview.evidence} />
          <Detail label="더 나은 행동" children={payload.decisionReview.betterAction} />
        </section>
      )}

      {visible.riskReview && payload.riskReview && (
        <section className="border-t border-border/40 pt-5">
          <Heading>Risk Review</Heading>
          <Detail label="평가" children={payload.riskReview.assessment} />
          <List items={payload.riskReview.evidence} />
          <Detail label="개선 방법" children={payload.riskReview.improvement} />
        </section>
      )}

      {visible.behaviorPatterns && !!payload.behaviorPatterns?.length && (
        <section className="border-t border-border/40 pt-5">
          <Heading>Behavior Patterns</Heading>
          <div className="mt-3 space-y-5">
            {payload.behaviorPatterns.map((item, index) => (
              <div key={`${item.pattern}-${index}`}>
                <h4 className="text-sm font-medium">{item.pattern}</h4>
                <List items={item.evidence} />
                <Detail label="영향" children={item.impact} />
                <Detail label="교정" children={item.correction} />
              </div>
            ))}
          </div>
        </section>
      )}

      {visible.nextTrainingFocus && !!payload.nextTrainingFocus?.length && (
        <section className="border-t border-border/40 pt-5">
          <Heading>Next Training Focus</Heading>
          <List items={payload.nextTrainingFocus} />
        </section>
      )}
    </div>
  );
}
