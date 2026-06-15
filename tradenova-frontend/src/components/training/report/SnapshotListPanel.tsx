import { useState } from "react";
import type { ReportDocumentResponse } from "@/types/training";
import { Camera } from "lucide-react";

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

export function SnapshotListPanel({ items }: Props) {
  const [expanded, setExpanded] = useState(false);

  const sortedItems = items
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const visibleItems = expanded ? sortedItems : sortedItems.slice(0, 2);

  return (
    <div className="rounded-xl border border-border/45 bg-background/25 p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="text-sm font-semibold">스냅샷</div>
        </div>

        <div className="text-[11px] text-muted-foreground">
          {items.length}개
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <div className="rounded-lg bg-background/35 px-3 py-3 text-sm text-muted-foreground">
          저장된 스냅샷이 없습니다.
        </div>
      ) : (
        <div className="space-y-1.5">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-border/35 bg-background/25 px-3 py-2 transition-all duration-200 hover:border-primary/35 hover:bg-primary/[0.04]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-xs font-semibold text-foreground">
                  Snapshot #{item.id}
                </div>

                <div className="shrink-0 text-[10px] text-muted-foreground">
                  {formatTime(item.createdAt)}
                </div>
              </div>

              {item.contentJson?.thesis && (
                <div className="mt-1 truncate text-[11px] text-muted-foreground">
                  {item.contentJson.thesis}
                </div>
              )}
            </div>
          ))}

          {sortedItems.length > 2 && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-1 h-8 w-full rounded-md text-xs text-muted-foreground transition hover:bg-background/45 hover:text-foreground"
            >
              {expanded ? "접기" : `전체 ${sortedItems.length}개 보기`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}