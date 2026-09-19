import { useState } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import type { QuickPhraseResponse } from "@/types/training";

type Props = {
  items: QuickPhraseResponse[];
  selectedIds: Set<number>;
  onToggle: (phrase: QuickPhraseResponse) => void;
};

export function QuickPhrasePicker({ items, selectedIds, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedItems = items.filter((item) => selectedIds.has(item.id));
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredItems = normalizedQuery
    ? items.filter((item) =>
        `${item.title} ${item.content}`
          .toLocaleLowerCase()
          .includes(normalizedQuery),
      )
    : items;

  return (
    <div
      className="relative mt-2"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setQuery("");
        }
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          if (open) setQuery("");
          setOpen((current) => !current);
        }}
        className="flex h-8 items-center gap-1.5 rounded-md border border-border/45 bg-muted/15 px-2.5 text-[11px] font-medium text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        근거 선택
      </button>
      {selectedItems.length > 0 && (
        <div className="mt-2">
          <div className="mb-1 text-[10px] font-medium text-muted-foreground">
            선택됨
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedItems.map((phrase) => (
              <button
                key={phrase.id}
                type="button"
                aria-label={`${phrase.content} 선택 해제`}
                onClick={() => onToggle(phrase)}
                className="flex max-w-full items-center gap-1 rounded-full border border-primary/35 bg-primary/10 py-1 pl-2.5 pr-1.5 text-[11px] text-primary transition hover:bg-primary/15"
              >
                <span className="min-w-0 truncate">{phrase.content}</span>
                <X className="h-3 w-3 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
      {open && (
        <div className="absolute left-0 top-9 z-30 w-[min(320px,calc(100vw-64px))] overflow-hidden rounded-lg border border-border/70 bg-popover shadow-xl shadow-black/35">
          <div className="border-b border-border/40 p-2">
            <div className="mb-1.5 text-[10px] font-bold tracking-wider text-muted-foreground">
              근거 선택
            </div>
            <label className="flex h-8 items-center gap-2 rounded-md border border-border/50 bg-background/60 px-2.5 focus-within:border-primary/50">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                aria-label="근거 검색"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setOpen(false);
                    setQuery("");
                  }
                }}
                placeholder="근거 검색"
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
              />
            </label>
          </div>
          <div className="thin-scrollbar max-h-44 overflow-y-auto p-1.5">
            {filteredItems.length === 0 ? (
              <p className="px-2 py-4 text-center text-[11px] text-muted-foreground">
                {items.length === 0
                  ? "등록된 빠른 근거가 없습니다."
                  : "검색 결과가 없습니다."}
              </p>
            ) : (
              filteredItems.map((phrase) => {
                const selected = selectedIds.has(phrase.id);
                return (
                  <button
                    key={phrase.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onToggle(phrase)}
                    className={`flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left text-xs leading-4 transition hover:bg-primary/10 ${selected ? "bg-primary/[0.06] text-primary" : "text-popover-foreground"}`}
                  >
                    <span className="min-w-0 break-words">{phrase.content}</span>
                    {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
