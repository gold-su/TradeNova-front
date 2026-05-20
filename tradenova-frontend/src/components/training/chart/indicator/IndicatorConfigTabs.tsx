type Tab = "variables" | "style";

type Props = {
  value: Tab;
  onChange: (tab: Tab) => void;
};

export function IndicatorConfigTabs({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-5 text-sm">
      <button
        type="button"
        onClick={() => onChange("variables")}
        className={[
          "pb-2 transition-colors",
          value === "variables"
            ? "border-b border-foreground text-foreground"
            : "text-muted-foreground hover:text-foreground",
        ].join(" ")}
      >
        변수
      </button>

      <button
        type="button"
        onClick={() => onChange("style")}
        className={[
          "pb-2 transition-colors",
          value === "style"
            ? "border-b border-foreground text-foreground"
            : "text-muted-foreground hover:text-foreground",
        ].join(" ")}
      >
        스타일
      </button>
    </div>
  );
}
