import type { ReportDocumentResponse } from "@/types/training";

type Props = {
  items: ReportDocumentResponse[];
};

export function SnapshotListPanel({ items }: Props) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
      <div className="mb-3 text-sm font-semibold">Snapshots</div>

      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground">스냅샷 없음</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border/60 bg-background/20 p-3"
            >
              <div className="text-sm font-semibold">Snapshot #{item.id}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {item.createdAt}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
