import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { QuickPhraseResponse } from "@/types/training";

type Props = {
  items: QuickPhraseResponse[];
  selectedIds: Set<number>;
  onToggle: (phrase: QuickPhraseResponse) => void;
};

export function QuickPhrasePicker({ items, selectedIds, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const featured = items.slice(0, 6);

  if (items.length === 0) {
    return (
      <p className="mt-2 text-[11px] text-muted-foreground">
        등록된 빠른 근거가 없습니다.
      </p>
    );
  }

  return (
    <div
      className="relative mt-2"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <div className="flex flex-wrap gap-1.5">
        {featured.map((phrase) => {
          const selected = selectedIds.has(phrase.id);
          return (
            <button
              key={phrase.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(phrase)}
              className={`max-w-full truncate rounded-full border px-2.5 py-1 text-[11px] transition ${
                selected
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-border/45 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {phrase.content}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="mt-1.5 flex h-7 items-center gap-1 rounded-md px-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
      >
        전체 근거 보기
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border/70 bg-popover p-1.5 shadow-xl shadow-black/35">
          {items.map((phrase) => {
            const selected = selectedIds.has(phrase.id);
            return (
              <button
                key={phrase.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onToggle(phrase)}
                className={`flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left text-xs transition hover:bg-primary/10 ${selected ? "text-primary" : "text-popover-foreground"}`}
              >
                <span className="min-w-0 truncate">{phrase.content}</span>
                {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
