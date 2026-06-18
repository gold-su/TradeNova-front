import { useMemo, useState } from "react";
import type { ReportDocumentResponse } from "@/types/training";
import {
  FileText,
  X,
  Target,
  Route,
  ShieldAlert,
  StickyNote,
} from "lucide-react";

type Props = {
  items: ReportDocumentResponse[];
};

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

function isScenario(item: ReportDocumentResponse) {
  return item.contentJson?.tags?.includes("SCENARIO");
}

function emptyText(value?: string | null) {
  return value?.trim() ? value : "-";
}

export function SnapshotListPanel({ items }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<ReportDocumentResponse | null>(null);

  const scenarioItems = useMemo(
    () =>
      items
        .filter(isScenario)
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [items],
  );

  const visibleItems = expanded ? scenarioItems : scenarioItems.slice(0, 2);

  return (
    <>
      <div className="rounded-xl border border-border/45 bg-background/25 p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-primary" />
            <div className="text-sm font-semibold">시나리오 기록</div>
          </div>

          <div className="text-[11px] text-muted-foreground">
            {scenarioItems.length}개
          </div>
        </div>

        {visibleItems.length === 0 ? (
          <div className="rounded-lg bg-background/35 px-3 py-3 text-sm text-muted-foreground">
            아직 저장된 시나리오가 없습니다.
          </div>
        ) : (
          <div className="space-y-1.5">
            {visibleItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item)}
                className="group w-full rounded-lg border border-border/35 bg-background/25 px-3 py-2 text-left transition-all duration-200 hover:border-primary/35 hover:bg-primary/[0.04] hover:shadow-[0_0_16px_rgba(52,211,153,0.1)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-xs font-semibold text-foreground">
                    {item.contentJson?.thesis || "무제 시나리오"}
                  </div>

                  <div className="shrink-0 text-[10px] text-muted-foreground">
                    {formatTime(item.createdAt)}
                  </div>
                </div>

                <div className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                  {item.contentJson?.entryReason || "진입 조건 미작성"}
                </div>
              </button>
            ))}

            {scenarioItems.length > 2 && (
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="mt-1 h-8 w-full rounded-md text-xs text-muted-foreground transition hover:bg-background/45 hover:text-foreground"
              >
                {expanded ? "접기" : `전체 ${scenarioItems.length}개 보기`}
              </button>
            )}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="닫기"
            className="absolute inset-0"
            onClick={() => setSelected(null)}
          />

          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-border/45 bg-background shadow-2xl">
            <div className="flex items-start justify-between border-b border-border/35 px-5 py-4">
              <div>
                <div className="text-lg font-bold">시나리오 상세</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatTime(selected.createdAt)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl p-2 text-muted-foreground transition hover:bg-background/60 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="thin-scrollbar max-h-[72vh] space-y-3 overflow-y-auto px-5 py-4">
              <section className="rounded-2xl bg-background/35 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  핵심 관점
                </div>
                <p className="text-sm leading-6 text-foreground/90">
                  {emptyText(selected.contentJson?.thesis)}
                </p>
              </section>

              <section className="rounded-2xl bg-background/35 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  진입 조건
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                  {emptyText(selected.contentJson?.entryReason)}
                </p>
              </section>

              <div className="grid grid-cols-2 gap-3">
                <section className="rounded-2xl bg-background/35 p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                    <Route className="h-3.5 w-3.5 text-primary" />
                    대응 계획
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                    {emptyText(selected.contentJson?.exitPlan)}
                  </p>
                </section>

                <section className="rounded-2xl bg-background/35 p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                    <ShieldAlert className="h-3.5 w-3.5 text-red-300" />
                    무효화 기준
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                    {emptyText(selected.contentJson?.riskNote)}
                  </p>
                </section>
              </div>

              <section className="rounded-2xl bg-background/35 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                  <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                  추가 메모
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                  {emptyText(selected.contentJson?.freeNote)}
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}