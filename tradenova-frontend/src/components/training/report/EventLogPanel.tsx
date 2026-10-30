import { useState } from "react";
import type { TrainingEventResponse } from "@/types/training";
import { getEventLogBodyMode } from "./eventLogDisplay";
import {
  X,
  ArrowUpRight,
  ArrowDownRight,
  StickyNote,
  Camera,
  Bot,
  AlertTriangle,
  Activity,
  Pause,
} from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";

type Props = {
  items: TrainingEventResponse[];
  loading: boolean;
};

type TradeReasonPayload = {
  id?: string;
  title?: string;
  entryReason?: string;
  riskNote?: string;
  createdAt?: string;
};

type TradePayload = {
  side?: "BUY" | "SELL" | "WAIT";
  qty?: number;
  price?: number;
  executedPrice?: number;
  entryReason?: string;
  riskNote?: string;
  sellAll?: boolean;
  reasons?: TradeReasonPayload[];
  reasonCount?: number;
  reasonVersion?: number;
};

function eventLabel(type: string, t: (key: string) => string) {
  switch (type) {
    case "TRADE":
      return t("training.log.trade");
    case "NOTE":
      return t("training.log.note");
    case "SNAPSHOT":
      return t("training.log.snapshot");
    case "AI":
      return "AI";
    case "WARNING":
      return t("training.log.warning");
    case "PROGRESS":
      return t("training.log.progress");
    default:
      return type;
  }
}

function getTradePayload(item: TrainingEventResponse): TradePayload {
  if (item.type !== "TRADE") return {};

  return (item.payloadJson ?? {}) as TradePayload;
}

function getTradeSide(item: TrainingEventResponse): "BUY" | "SELL" | "WAIT" {
  const payload = getTradePayload(item);

  if (payload.side === "WAIT") return "WAIT";

  if (payload.side === "SELL" || item.title.includes("SELL")) {
    return "SELL";
  }

  return "BUY";
}

function formatNumber(v: unknown, locale: string) {
  if (v === null || v === undefined || v === "") return "-";
  const num = Number(v);
  if (Number.isNaN(num)) return "-";
  return new Intl.NumberFormat(locale).format(num);
}

function formatTime(value: string, locale: string) {
  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleString(locale, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type DisplayEvent = TrainingEventResponse & {
  progressCount?: number;
};

function compactProgressEvents(items: TrainingEventResponse[], progressLabel: (count: number) => string): DisplayEvent[] {
  const result: DisplayEvent[] = [];

  for (const item of items) {
    if (item.type !== "PROGRESS") {
      result.push(item);
      continue;
    }

    const last = result[result.length - 1];

    if (last?.type === "PROGRESS") {
      last.progressCount = (last.progressCount ?? 1) + 1;
      last.title = progressLabel(last.progressCount);
    } else {
      result.push({
        ...item,
        title: progressLabel(1),
        progressCount: 1,
      });
    }
  }

  return result;
}

function EventIcon({ item }: { item: TrainingEventResponse }) {
  const payload = getTradePayload(item);

  if (item.type === "TRADE") {
    if (payload.side === "WAIT") return <Pause className="h-3.5 w-3.5" />;
    if (payload.side === "SELL") {
      return <ArrowDownRight className="h-3.5 w-3.5" />;
    }

    return <ArrowUpRight className="h-3.5 w-3.5" />;
  }

  if (item.type === "NOTE") return <StickyNote className="h-3.5 w-3.5" />;
  if (item.type === "SNAPSHOT") return <Camera className="h-3.5 w-3.5" />;
  if (item.type === "AI") return <Bot className="h-3.5 w-3.5" />;
  if (item.type === "WARNING") return <AlertTriangle className="h-3.5 w-3.5" />;

  return <Activity className="h-3.5 w-3.5" />;
}

function eventTone(item: TrainingEventResponse) {

  if (item.type === "TRADE") {
    const side = getTradeSide(item);

    if (side === "SELL") {
      return "border-red-500/25 bg-red-500/10 text-red-300";
    }
    if (side === "WAIT") {
      return "border-sky-500/25 bg-sky-500/10 text-sky-300";
    }

    return "border-primary/25 bg-primary/10 text-primary";
  }

  if (item.type === "AI") {
    return "border-blue-500/25 bg-blue-500/10 text-blue-300";
  }

  if (item.type === "SNAPSHOT") {
    return "border-violet-500/25 bg-violet-500/10 text-violet-300";
  }

  if (item.type === "WARNING") {
    return "border-yellow-500/25 bg-yellow-500/10 text-yellow-300";
  }

  return "border-border/50 bg-background/50 text-muted-foreground";
}

function EventSummary({ item, compact = false }: { item: TrainingEventResponse; compact?: boolean }) {
  const { language, t } = useI18n();
  const locale = language === "ko" ? "ko-KR" : "en-US";
  const tradePayload = getTradePayload(item);

  if (item.type === "TRADE") {
    const side = getTradeSide(item);

    const reasons = tradePayload.reasons ?? [];
    const reasonPreview =
      reasons[0]?.title || reasons[0]?.entryReason || tradePayload.entryReason;

    return (
      <div className="min-w-0 flex-1">
        <div className="flex h-6 items-center gap-2">
          <span
            className={[
              "inline-flex h-5 items-center rounded-md border px-1.5 text-[10px] font-bold",
              side === "SELL"
                ? "border-red-500/30 bg-red-500/10 text-red-300"
                : side === "WAIT"
                  ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
                : "border-primary/30 bg-primary/10 text-primary",
            ].join(" ")}
          >
            {tradePayload.sellAll ? "SELL ALL" : side}
          </span>

          <span className="truncate text-xs font-semibold leading-none text-foreground">
            {side === "WAIT"
              ? t("training.log.waitingNow")
              : t("training.log.tradeAmount", { qty: formatNumber(tradePayload.qty, locale), price: formatNumber(
                  tradePayload.price ?? tradePayload.executedPrice,
                  locale,
                ) })}
          </span>
        </div>

        {!compact && reasonPreview && (
          <div className="mt-1 truncate text-[11px] text-muted-foreground">
            {t("training.log.reason")} {reasons.length > 0 ? `${t("training.log.count", { count: reasons.length })} · ` : ""}
            {reasonPreview}
          </div>
        )}
      </div>
    );
  }

  const normalPayload = item.payloadJson;

  const subText =
    item.type === "SNAPSHOT"
      ? String(normalPayload?.thesis || t("training.log.scenario"))
      : item.type === "NOTE"
        ? String(normalPayload?.thesis || t("training.log.note"))
        : eventLabel(item.type, t);

  return (
    <div className="min-w-0 flex-1">
      <div className="truncate text-xs font-semibold text-foreground">
        {item.title}
      </div>
      {!compact && <div className="mt-1 truncate text-[11px] text-muted-foreground">
        {subText}
      </div>}
    </div>
  );
}

function EventRow({
  item,
  compact = false,
}: {
  item: TrainingEventResponse;
  compact?: boolean;
}) {
  const { language, t } = useI18n();
  const locale = language === "ko" ? "ko-KR" : "en-US";
  const [reasonOpen, setReasonOpen] = useState(false);
  const tradePayload = getTradePayload(item);
  const reasons = tradePayload.reasons ?? [];

  return (
    <div
      className={[
        "rounded-lg",
        compact ? "py-1.5" : "border border-border/30 p-3",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <div
          className={[
            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
            eventTone(item),
          ].join(" ")}
        >
          <EventIcon item={item} />
        </div>

        <EventSummary item={item} compact={compact} />

        <div className="shrink-0 text-[10px] text-muted-foreground">
          {formatTime(item.createdAt, locale)}
        </div>
      </div>

      {!compact && item.type === "TRADE" && reasons.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setReasonOpen((prev) => !prev)}
            className="flex h-9 w-full items-center justify-between rounded-xl bg-background/45 px-3 text-xs transition hover:bg-primary/[0.04]"
          >
            <span className="font-semibold text-foreground">
              {t("training.log.tradeReasons", { count: reasons.length })}
            </span>
            <span className="text-muted-foreground">
              {reasonOpen ? t("training.log.collapse") : t("training.log.view")}
            </span>
          </button>

          {reasonOpen && (
            <div className="mt-2 space-y-2">
              {reasons.map((reason, idx) => (
                <div
                  key={reason.id ?? idx}
                  className="rounded-xl border border-border/30 bg-background/35 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs font-semibold text-primary">
                      {t("training.log.reasonIndex", { index: idx + 1 })}
                    </div>
                    {reason.title && (
                      <div className="max-w-[260px] truncate text-[11px] text-muted-foreground">
                        {reason.title}
                      </div>
                    )}
                  </div>

                  {reason.entryReason && (
                    <div className="rounded-lg bg-background/45 px-3 py-2">
                      <div className="mb-1 text-[10px] font-semibold text-muted-foreground">
                        {t("training.log.tradeDecision")}
                      </div>
                      <div className="whitespace-pre-wrap text-xs leading-5 text-foreground/90">
                        {reason.entryReason}
                      </div>
                    </div>
                  )}

                  {reason.riskNote && (
                    <div className="mt-2 rounded-lg bg-red-500/10 px-3 py-2">
                      <div className="mb-1 text-[10px] font-semibold text-red-300">
                        {t("training.log.riskCriteria")}
                      </div>
                      <div className="whitespace-pre-wrap text-xs leading-5 text-red-100/90">
                        {reason.riskNote}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export function EventLogPanel({ items, loading }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const sortedItems = items
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const visibleItems = sortedItems.filter((item) => {
    if (item.type !== "TRADE") return true;

    const payload = item.payloadJson;

    return !!payload?.savedForAiReview;
  });

  const displayItems = compactProgressEvents(visibleItems, (count) => t("training.log.candlesProgressed", { count }));

  const recent = displayItems.slice(0, 3);
  const bodyMode = getEventLogBodyMode(loading, recent.length);

  return (
    <>
      <div className="py-1">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground">03 · REVIEW</div>
            <div className="text-[11px] text-muted-foreground">
              {t("training.log.recentDecisions", { count: recent.length })}{loading ? ` · ${t("training.log.syncing")}` : ""}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-md border border-border/50 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            {t("training.log.viewAll")}
          </button>
        </div>

        {bodyMode !== "content" ? (
          <div className="text-sm text-muted-foreground">{bodyMode === "loading" ? t("training.log.loading") : t("training.log.empty")}</div>
        ) : (
          <div className="space-y-2">
            {recent.map((item) => (
              <EventRow key={item.id} item={item} compact />
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
          <button
            type="button"
            aria-label={t("common.close")}
            className="absolute inset-0 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 h-full w-[560px] border-l border-border/60 bg-background p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <div className="text-base font-semibold">{t("training.log.allLogs")}</div>
                <div className="text-xs text-muted-foreground">
                  {t("training.log.currentChartEvents")}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-border/50 p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="thin-scrollbar h-[calc(100%-64px)] space-y-2 overflow-y-auto pr-1">
              {items.length === 0 ? (
                <div className="rounded-xl border border-border/50 bg-background/40 p-5 text-sm text-muted-foreground">
                  {t("training.log.empty")}
                </div>
              ) : (
                displayItems.map((item) => <EventRow key={item.id} item={item} />)
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
