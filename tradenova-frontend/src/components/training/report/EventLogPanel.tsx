import { useState } from "react";
import type { TrainingEventResponse } from "@/types/training";
import {
  X,
  ArrowUpRight,
  ArrowDownRight,
  StickyNote,
  Camera,
  Bot,
  AlertTriangle,
  Activity,
} from "lucide-react";

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
  side?: "BUY" | "SELL";
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

function eventLabel(type: string) {
  switch (type) {
    case "TRADE":
      return "매매";
    case "NOTE":
      return "메모";
    case "SNAPSHOT":
      return "스냅샷";
    case "AI":
      return "AI";
    case "WARNING":
      return "경고";
    case "PROGRESS":
      return "진행";
    default:
      return type;
  }
}

function getTradePayload(item: TrainingEventResponse): TradePayload {
  if (item.type !== "TRADE") return {};

  return (item.payloadJson ?? {}) as TradePayload;
}

function getTradeSide(item: TrainingEventResponse): "BUY" | "SELL" {
  const payload = getTradePayload(item);

  if (payload.side === "SELL" || item.title.includes("SELL")) {
    return "SELL";
  }

  return "BUY";
}

function formatNumber(v: unknown) {
  if (v === null || v === undefined || v === "") return "-";
  const num = Number(v);
  if (Number.isNaN(num)) return "-";
  return new Intl.NumberFormat("ko-KR").format(num);
}

function formatTime(value: string) {
  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type DisplayEvent = TrainingEventResponse & {
  progressCount?: number;
};

function compactProgressEvents(items: TrainingEventResponse[]): DisplayEvent[] {
  const result: DisplayEvent[] = [];

  for (const item of items) {
    if (item.type !== "PROGRESS") {
      result.push(item);
      continue;
    }

    const last = result[result.length - 1];

    if (last?.type === "PROGRESS") {
      last.progressCount = (last.progressCount ?? 1) + 1;
      last.title = `${last.progressCount}봉 진행`;
    } else {
      result.push({
        ...item,
        title: "1봉 진행",
        progressCount: 1,
      });
    }
  }

  return result;
}

function EventIcon({ item }: { item: TrainingEventResponse }) {
  const payload = getTradePayload(item);

  if (item.type === "TRADE") {
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

function EventSummary({ item }: { item: TrainingEventResponse }) {
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
                : "border-primary/30 bg-primary/10 text-primary",
            ].join(" ")}
          >
            {tradePayload.sellAll ? "SELL ALL" : side}
          </span>

          <span className="truncate text-xs font-semibold leading-none text-foreground">
            {formatNumber(tradePayload.qty)}주 @{" "}
            {formatNumber(tradePayload.price ?? tradePayload.executedPrice)}원
          </span>
        </div>

        {reasonPreview && (
          <div className="mt-1 truncate text-[11px] text-muted-foreground">
            근거 {reasons.length > 0 ? `${reasons.length}개 · ` : ""}
            {reasonPreview}
          </div>
        )}
      </div>
    );
  }

  const normalPayload = item.payloadJson as any;

  const subText =
    item.type === "SNAPSHOT"
      ? normalPayload?.thesis || "시나리오"
      : item.type === "NOTE"
        ? normalPayload?.thesis || "메모"
        : eventLabel(item.type);

  return (
    <div className="min-w-0 flex-1">
      <div className="truncate text-xs font-semibold text-foreground">
        {item.title}
      </div>
      <div className="mt-1 truncate text-[11px] text-muted-foreground">
        {subText}
      </div>
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
  const [reasonOpen, setReasonOpen] = useState(false);
  const tradePayload = getTradePayload(item);
  const reasons = tradePayload.reasons ?? [];

  return (
    <div
      className={[
        "rounded-lg border bg-background/30",
        compact ? "px-3 py-2" : "p-3",
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

        <EventSummary item={item} />

        <div className="shrink-0 text-[10px] text-muted-foreground">
          {formatTime(item.createdAt)}
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
              매매 근거 {reasons.length}개
            </span>
            <span className="text-muted-foreground">
              {reasonOpen ? "접기" : "보기"}
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
                      근거 {idx + 1}
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
                        매매 판단
                      </div>
                      <div className="whitespace-pre-wrap text-xs leading-5 text-foreground/90">
                        {reason.entryReason}
                      </div>
                    </div>
                  )}

                  {reason.riskNote && (
                    <div className="mt-2 rounded-lg bg-red-500/10 px-3 py-2">
                      <div className="mb-1 text-[10px] font-semibold text-red-300">
                        리스크 기준
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
  const [open, setOpen] = useState(false);
  const sortedItems = items
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const visibleItems = sortedItems.filter((item) => {
    if (item.type !== "TRADE") return true;

    const payload = item.payloadJson as any;

    return !!payload?.savedForAiReview;
  });

  const displayItems = compactProgressEvents(visibleItems);

  const recent = displayItems.slice(0, 3);

  return (
    <>
      <div className="rounded-xl border border-border/60 bg-background/30 p-3">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Recent Logs</div>
            <div className="text-[11px] text-muted-foreground">
              최신 기록 {recent.length}개
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-md border border-border/50 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            전체 보기
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">불러오는 중...</div>
        ) : recent.length === 0 ? (
          <div className="text-sm text-muted-foreground">기록 없음</div>
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
            aria-label="닫기"
            className="absolute inset-0 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 h-full w-[560px] border-l border-border/60 bg-background p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <div className="text-base font-semibold">전체 로그</div>
                <div className="text-xs text-muted-foreground">
                  현재 차트의 이벤트 기록
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
                  기록 없음
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