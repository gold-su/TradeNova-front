import type { TrainingEventResponse } from "@/types/training";

type Props = {
  items: TrainingEventResponse[];
  loading: boolean;
};

export function EventLogPanel({ items, loading }: Props) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
      <div className="mb-3 text-sm font-semibold">Event Log</div>

      {loading ? (
        <div className="text-sm text-muted-foreground">불러오는 중...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground">이벤트 없음</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border/60 bg-background/20 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.type}</div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
