type Props = {
  title: string;
  description: string;
  onReset: () => void;
};

export function IndicatorSectionHeader({ title, description, onReset }: Props) {
  return (
    <div className="mb-3 flex items-start justify-between">
      <div>
        <div className="text-sm font-semibold">{title}</div>

        <div className="text-[11px] text-muted-foreground">{description}</div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="text-[11px] text-muted-foreground hover:text-foreground"
      >
        초기화
      </button>
    </div>
  );
}
