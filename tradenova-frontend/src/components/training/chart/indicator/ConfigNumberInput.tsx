import { useEffect, useState } from "react";

type Props = {
  value: number;
  min?: number;
  max?: number;
  onCommit: (value: number) => void;
  className?: string;
  size?: "default" | "compact";
};

export function ConfigNumberInput({
  value,
  min,
  max,
  onCommit,
  className = "",
  size = "default",
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

  const isCompact = size === "compact";

  return (
    <div className={["relative", isCompact ? "w-[46px]" : "w-full"].join(" ")}>
      <input
        type="number"
        min={min}
        max={max}
        value={draft}
        onFocus={(e) => e.currentTarget.select()}
        onClick={(e) => e.currentTarget.select()}
        onChange={(e) => setDraft(e.target.value)}
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
          "no-number-spinner rounded-md border border-border/50 bg-background/40 outline-none",
          isCompact
            ? "h-6 w-[46px] px-2 pr-4 text-xs"
            : "h-8 w-full px-2 pr-7 text-xs",
          className,
        ].join(" ")}
      />

      <div
        className={[
          "absolute right-0.5 top-0.5 flex flex-col overflow-hidden rounded-sm border border-border/40",
          isCompact ? "h-5 w-3.5" : "",
        ].join(" ")}
      >
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const next = value + 1;
            if (max !== undefined && next > max) return;
            onCommit(next);
          }}
          className={[
            "flex items-center justify-center text-muted-foreground hover:bg-background/80",
            isCompact ? "h-2.5 w-3.5 text-[7px]" : "h-3.5 w-4 text-[9px]",
          ].join(" ")}
        >
          ▲
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const next = value - 1;
            if (min !== undefined && next < min) return;
            onCommit(next);
          }}
          className={[
            "flex items-center justify-center border-t border-border/40 text-muted-foreground hover:bg-background/80",
            isCompact ? "h-2.5 w-3.5 text-[7px]" : "h-3.5 w-4 text-[9px]",
          ].join(" ")}
        >
          ▼
        </button>
      </div>
    </div>
  );
}
