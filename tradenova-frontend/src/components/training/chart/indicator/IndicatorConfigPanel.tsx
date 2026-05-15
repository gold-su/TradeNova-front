import type { IndicatorSettings, MaLineSetting } from "@/types/training";
import type { IndicatorKey } from "./indicatorMeta";

type Props = {
  selectedKey: IndicatorKey | null;
  settings: IndicatorSettings;
  onChange: (next: IndicatorSettings) => void;
  onClose: () => void;
};

export function IndicatorConfigPanel({
  selectedKey,
  settings,
  onChange,
  onClose,
}: Props) {
  if (!selectedKey) return null;

  return (
    <aside className="absolute left-[320px] top-4 z-50 max-h-[520px] w-[340px] overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <div className="text-sm font-semibold">지표 설정</div>
          <div className="text-[11px] text-muted-foreground">
            {selectedKey.toUpperCase()}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-background/60"
        >
          ×
        </button>
      </div>

      <div className="max-h-[455px] overflow-y-auto p-4">
        {selectedKey === "ma" ? (
          <MaConfig settings={settings} onChange={onChange} />
        ) : selectedKey === "rsi" ? (
          <RsiConfig settings={settings} onChange={onChange} />
        ) : selectedKey === "macd" ? (
          <MacdConfig settings={settings} onChange={onChange} />
        ) : (
          <div className="rounded-2xl border border-border/60 bg-background/30 p-4 text-sm text-muted-foreground">
            아직 설정 UI가 준비되지 않은 지표입니다.
          </div>
        )}
      </div>
    </aside>
  );
}

function MaConfig({
  settings,
  onChange,
}: {
  settings: IndicatorSettings;
  onChange: (next: IndicatorSettings) => void;
}) {
  const updateLine = (index: number, patch: Partial<MaLineSetting>) => {
    onChange({
      ...settings,
      ma: {
        ...settings.ma,
        lines: settings.ma.lines.map((line, i) =>
          i === index ? { ...line, ...patch } : line,
        ),
      },
    });
  };

  const addLine = () => {
    onChange({
      ...settings,
      ma: {
        ...settings.ma,
        lines: [
          ...settings.ma.lines,
          { period: 10, color: "#f97316", width: 1 },
        ],
      },
    });
  };

  const removeLine = (index: number) => {
    onChange({
      ...settings,
      ma: {
        ...settings.ma,
        lines: settings.ma.lines.filter((_, i) => i !== index),
      },
    });
  };

  function RsiConfig({
    settings,
    onChange,
  }: {
    settings: IndicatorSettings;
    onChange: (next: IndicatorSettings) => void;
  }) {
    const update = (patch: Partial<IndicatorSettings["rsi"]>) => {
      onChange({
        ...settings,
        rsi: {
          ...settings.rsi,
          ...patch,
        },
      });
    };

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border/60 bg-background/30 p-3">
          <div className="mb-3">
            <div className="text-sm font-semibold">RSI</div>
            <div className="text-[11px] text-muted-foreground">
              기간과 과매수/과매도 기준선을 설정합니다.
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <ConfigNumberRow
              label="기간"
              value={settings.rsi.period}
              min={1}
              onChange={(value) => update({ period: value })}
            />

            <ConfigNumberRow
              label="과매수선"
              value={settings.rsi.upper}
              min={1}
              max={100}
              onChange={(value) => update({ upper: value })}
            />

            <ConfigNumberRow
              label="과매도선"
              value={settings.rsi.lower}
              min={1}
              max={100}
              onChange={(value) => update({ lower: value })}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/20 p-3 text-xs text-muted-foreground">
          일반적으로 RSI 70 이상은 과매수, 30 이하는 과매도 구간으로 해석합니다.
        </div>
      </div>
    );
  }

  function MacdConfig({
    settings,
    onChange,
  }: {
    settings: IndicatorSettings;
    onChange: (next: IndicatorSettings) => void;
  }) {
    const update = (patch: Partial<IndicatorSettings["macd"]>) => {
      onChange({
        ...settings,
        macd: {
          ...settings.macd,
          ...patch,
        },
      });
    };

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border/60 bg-background/30 p-3">
          <div className="mb-3">
            <div className="text-sm font-semibold">MACD</div>
            <div className="text-[11px] text-muted-foreground">
              단기 EMA, 장기 EMA, 시그널 기간을 설정합니다.
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <ConfigNumberRow
              label="Fast EMA"
              value={settings.macd.fastPeriod}
              min={1}
              onChange={(value) => update({ fastPeriod: value })}
            />

            <ConfigNumberRow
              label="Slow EMA"
              value={settings.macd.slowPeriod}
              min={1}
              onChange={(value) => update({ slowPeriod: value })}
            />

            <ConfigNumberRow
              label="Signal"
              value={settings.macd.signalPeriod}
              min={1}
              onChange={(value) => update({ signalPeriod: value })}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/20 p-3 text-xs text-muted-foreground">
          기본값은 MACD 12, 26, 9입니다.
        </div>
      </div>
    );
  }

  function ConfigNumberRow({
    label,
    value,
    min,
    max,
    onChange,
  }: {
    label: string;
    value: number;
    min?: number;
    max?: number;
    onChange: (value: number) => void;
  }) {
    return (
      <label className="grid grid-cols-[90px_1fr] items-center gap-3">
        <span className="text-muted-foreground">{label}</span>

        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="no-number-spinner h-8 rounded-md border border-border/60 bg-background px-2 outline-none"
        />
      </label>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-background/30 p-3">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">이동평균선</div>
            <div className="text-[11px] text-muted-foreground">
              기간, 색상, 선 굵기를 설정합니다.
            </div>
          </div>

          <button
            type="button"
            onClick={addLine}
            className="rounded-lg border border-border/60 px-2 py-1 text-xs hover:bg-background/50"
          >
            + 추가
          </button>
        </div>

        <div className="space-y-2">
          {settings.ma.lines.map((line, index) => (
            <div
              key={`${line.period}-${index}`}
              className="grid grid-cols-[36px_1fr_42px_24px] items-center gap-2 rounded-xl border border-border/40 bg-background/20 px-2 py-2 text-xs"
            >
              <span className="text-muted-foreground">MA</span>

              <input
                type="number"
                min={1}
                value={line.period}
                onChange={(e) =>
                  updateLine(index, { period: Number(e.target.value) })
                }
                className="no-number-spinner h-8 min-w-0 rounded-md border border-border/60 bg-background px-2 outline-none"
              />

              <input
                type="color"
                value={line.color}
                onChange={(e) => updateLine(index, { color: e.target.value })}
                className="h-8 w-10 cursor-pointer rounded border border-border/60 bg-background"
              />

              <button
                type="button"
                onClick={() => removeLine(index)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-background/60 hover:text-red-400"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-background/20 p-3 text-xs text-muted-foreground">
        현재 차트 봉 개수보다 큰 기간은 선이 표시되지 않을 수 있습니다.
      </div>
    </div>
  );
}
