import { useState } from "react";
import type { TrainingEventResponse } from "@/types/training";
import { X } from "lucide-react";

type Props = {
  items: TrainingEventResponse[];
  loading: boolean;
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
    default:
      return type;
  }
}

export function EventLogPanel({ items, loading }: Props) {
  const [open, setOpen] = useState(false);
  const recent = items.slice(0, 3);

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
              <div
                key={item.id}
                className="rounded-lg border border-border/40 bg-background/30 px-3 py-2"
                title={JSON.stringify(item.payloadJson ?? {}, null, 2)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-xs font-semibold">
                    {item.title}
                  </div>
                  <div className="shrink-0 text-[10px] text-muted-foreground">
                    {eventLabel(item.type)}
                  </div>
                </div>

                <div className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
          <div className="h-full w-[520px] border-l border-border/60 bg-background p-4 shadow-2xl">
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
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border/50 bg-background/40 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {eventLabel(item.type)}
                    </div>
                  </div>

                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>

                  {item.payloadJson && (
                    <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-black/30 p-3 text-[11px] leading-5 text-muted-foreground">
                      {JSON.stringify(item.payloadJson, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}