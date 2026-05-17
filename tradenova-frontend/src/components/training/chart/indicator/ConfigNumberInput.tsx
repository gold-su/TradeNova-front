import { useEffect, useState } from "react";

type Props = {
  value: number;
  min?: number;
  max?: number;
  onCommit: (value: number) => void;
  className?: string;
};

export function ConfigNumberInput({
  value,
  min,
  max,
  onCommit,
  className = "",
}: Props) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const raw = draft.trim();

    if (raw === "") {
      setDraft(String(value));
      return;
    }

    const next = Number(raw);

    if (!Number.isFinite(next)) {
      setDraft(String(value));
      return;
    }

    if (min !== undefined && next < min) {
      setDraft(String(value));
      return;
    }

    if (max !== undefined && next > max) {
      setDraft(String(value));
      return;
    }

    onCommit(next);
  };

  return (
  <div className="relative">
    <input
      type="number"
      min={min}
      max={max}
      value={draft}
      onFocus={(e) => {
        e.currentTarget.select();
      }}
      onClick={(e) => {
        e.currentTarget.select();
      }}
      onChange={(e) => {
        setDraft(e.target.value);
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit();
          e.currentTarget.blur();
        }

        if (e.key === "Escape") {
          setDraft(String(value));
          e.currentTarget.blur();
        }
      }}
      className={[
        "no-number-spinner h-8 w-full rounded-md border border-border/60 bg-background pl-2 pr-7 outline-none",
        className,
      ].join(" ")}
    />

    <div className="absolute right-1 top-1 flex flex-col overflow-hidden rounded border border-border/50">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          const next = value + 1;

          if (max !== undefined && next > max) {
            return;
          }

          onCommit(next);
        }}
        className="flex h-3.5 w-4 items-center justify-center text-[9px] text-muted-foreground hover:bg-background/80"
      >
        ▲
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          const next = value - 1;

          if (min !== undefined && next < min) {
            return;
          }

          onCommit(next);
        }}
        className="flex h-3.5 w-4 items-center justify-center border-t border-border/50 text-[9px] text-muted-foreground hover:bg-background/80"
      >
        ▼
      </button>
    </div>
  </div>
);
}
