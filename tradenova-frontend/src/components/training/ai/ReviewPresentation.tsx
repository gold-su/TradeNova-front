import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Target } from "lucide-react";
import { parseInlineEmphasis } from "@/components/training/ai/inlineEmphasis";
import { useI18n } from "@/i18n/LanguageProvider";

type ReviewTone = "positive" | "warning" | "neutral" | "focus";

const toneStyles: Record<ReviewTone, { heading: string; marker: string; section: string }> = {
  positive: { heading: "text-emerald-300", marker: "bg-emerald-400", section: "border-t border-border/45 pt-5" },
  warning: { heading: "text-rose-300", marker: "bg-rose-300", section: "border-t border-border/45 pt-5" },
  neutral: { heading: "text-foreground", marker: "bg-muted-foreground/70", section: "rounded-xl border border-border/55 bg-card/35 p-4 sm:p-5" },
  focus: { heading: "text-primary", marker: "bg-primary", section: "rounded-xl border border-primary/25 bg-primary/[0.055] p-4 sm:p-5" },
};

function SectionIcon({ tone }: { tone: ReviewTone }) {
  const className = "size-4 shrink-0";
  if (tone === "positive") return <CheckCircle2 aria-hidden="true" className={className} />;
  if (tone === "warning") return <AlertTriangle aria-hidden="true" className={className} />;
  if (tone === "focus") return <Target aria-hidden="true" className={className} />;
  return null;
}

export function ReviewInlineText({ children }: { children: string }) {
  return parseInlineEmphasis(children).map((token, index) => (
    token.emphasized
      ? <strong key={index} className="font-semibold text-foreground">{token.text}</strong>
      : <span key={index}>{token.text}</span>
  ));
}

export function ReviewSummary({ children }: { children: string }) {
  const { t } = useI18n();
  return (
    <section className="rounded-xl border border-border/60 border-l-2 border-l-primary bg-card/55 px-4 py-4 sm:px-5 sm:py-5">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{t("training.review.summary")}</h3>
      <p className="mt-3 whitespace-pre-wrap break-words text-[0.95rem] font-semibold leading-7 text-foreground/95 [overflow-wrap:anywhere]">
        <ReviewInlineText>{children}</ReviewInlineText>
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
    <section className={styles.section}>
      <h3 className={`flex items-center gap-2 text-sm font-semibold tracking-[-0.01em] ${styles.heading}`}>
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
    <ul className="mt-3 space-y-2.5 text-sm leading-7 text-foreground/80">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-2.5 rounded-md bg-foreground/[0.025] px-3 py-2.5">
          <span aria-hidden="true" className={`mt-[0.72rem] size-1.5 rounded-full ${styles.marker}`} />
          <span className="min-w-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]"><ReviewInlineText>{item}</ReviewInlineText></span>
        </li>
      ))}
    </ul>
  );
}

export function ReviewDetail({ label, children }: { label: string; children?: string | null }) {
  if (!children) return null;
  return (
    <div className="mt-4 min-w-0 text-sm leading-7">
      <div className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{label}</div>
      <p className="mt-1.5 whitespace-pre-wrap break-words text-foreground/80 [overflow-wrap:anywhere]"><ReviewInlineText>{children}</ReviewInlineText></p>
    </div>
  );
}
