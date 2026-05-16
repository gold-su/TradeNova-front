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
    <ConfigNumberInput
      value={line.period}
      min={1}
      onCommit={(value) => updateLine(index, { period: value })}
      className="min-w-0"
    />
  );
}
