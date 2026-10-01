import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Target } from "lucide-react";

type ReviewTone = "positive" | "warning" | "neutral" | "focus";

const toneStyles: Record<ReviewTone, { heading: string; marker: string }> = {
  positive: { heading: "text-emerald-300", marker: "bg-emerald-400" },
  warning: { heading: "text-rose-300", marker: "bg-rose-300" },
  neutral: { heading: "text-foreground", marker: "bg-muted-foreground/70" },
  focus: { heading: "text-primary", marker: "bg-primary" },
};

function SectionIcon({ tone }: { tone: ReviewTone }) {
  const className = "size-4 shrink-0";
  if (tone === "positive") return <CheckCircle2 aria-hidden="true" className={className} />;
  if (tone === "warning") return <AlertTriangle aria-hidden="true" className={className} />;
  if (tone === "focus") return <Target aria-hidden="true" className={className} />;
  return null;
}

export function ReviewSummary({ children }: { children: ReactNode }) {
  return (
    <section className="border-y border-border/50 py-4 sm:py-5">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">전체 요약</h3>
      <p className="mt-2.5 whitespace-pre-wrap break-words text-sm leading-7 text-foreground/90 [overflow-wrap:anywhere]">
        {children}
      </p>
    </section>
  );
}

export function ReviewSection({
  title,
  tone = "neutral",
  children,
}: {
  title: string;
  tone?: ReviewTone;
  children: ReactNode;
}) {
  const styles = toneStyles[tone];
  return (
    <section className="border-t border-border/40 pt-5 first:border-t-0 first:pt-0">
      <h3 className={`flex items-center gap-2 text-sm font-semibold ${styles.heading}`}>
        <SectionIcon tone={tone} />
        {title}
      </h3>
      {children}
    </section>
  );
}

export function ReviewList({ items, tone = "neutral" }: { items?: string[] | null; tone?: ReviewTone }) {
  if (!items?.length) return null;
  const styles = toneStyles[tone];
  return (
    <ul className="mt-3 space-y-3 text-sm leading-6 text-foreground/80">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-2.5">
          <span aria-hidden="true" className={`mt-[0.65rem] size-1.5 rounded-full ${styles.marker}`} />
          <span className="min-w-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ReviewDetail({ label, children }: { label: string; children?: string | null }) {
  if (!children) return null;
  return (
    <div className="mt-3 min-w-0 text-sm leading-6">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <p className="mt-1 whitespace-pre-wrap break-words text-foreground/80 [overflow-wrap:anywhere]">{children}</p>
    </div>
  );
}
