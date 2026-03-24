import type { QuickPhraseResponse } from "@/types/training";

type Props = {
  items: QuickPhraseResponse[];
  onAppend: (content: string) => void;
};

export function QuickPhrasePanel({ items, onAppend }: Props) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
      <div className="mb-3 text-sm font-semibold">Quick Phrases</div>

      <div className="flex flex-wrap gap-2">
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground">등록된 문구 없음</div>
        )}

        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onAppend(item.content)}
            className="rounded-full border border-border/60 bg-background px-3 py-2 text-xs"
          >
            {new Date(item.title).toLocaleString()}
          </button>
        ))}
      </div>
    </div>
  );
}
