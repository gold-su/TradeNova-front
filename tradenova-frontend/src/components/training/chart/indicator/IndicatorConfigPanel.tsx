import type { IndicatorSettings, MaLineSetting } from "@/types/training";
import type { IndicatorKey } from "./indicatorMeta";
import { ConfigNumberInput } from "./ConfigNumberInput";
import { DEFAULT_INDICATORS } from "./indicatorDefaults";
import { IndicatorSectionHeader } from "./IndicatorSectionHeader";
import { useState } from "react";
import { IndicatorConfigTabs } from "./IndicatorConfigTabs";

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

      <div className="thin-scrollbar max-h-[455px] overflow-y-auto p-4">
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
  const [tab, setTab] = useState<"variables" | "style">("variables");

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

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/30 bg-background/20 p-3">
        <div className="mb-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-semibold">이동평균선</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                기간, 색상, 선 굵기를 설정합니다.
              </div>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <div className="mb-2 text-xs font-medium text-foreground/80">
            가중치 선택
          </div>

          <div className="grid grid-cols-3 gap-1.5 pb-1">
            {[
              { value: "SMA", label: "단순" },
              { value: "WMA", label: "가중" },
              { value: "EMA", label: "지수" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  onChange({
                    ...settings,
                    ma: {
                      ...settings.ma,
                      type: item.value as IndicatorSettings["ma"]["type"],
                    },
                  })
                }
                className={[
                  "rounded-lg border px-2 py-1.5 text-[11px] transition",
                  settings.ma.type === item.value
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border/50 bg-background/20 text-muted-foreground hover:bg-background/50",
                ].join(" ")}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-3 flex items-center justify-between border-b border-border/30">
          <IndicatorConfigTabs value={tab} onChange={setTab} />

          <button
            type="button"
            onClick={() =>
              onChange({
                ...settings,
                ma: {
                  ...DEFAULT_INDICATORS.ma,
                  enabled: settings.ma.enabled,
                },
              })
            }
            className="mb-2 rounded-lg px-2 py-1 text-[11px] text-muted-foreground hover:bg-background/50 hover:text-foreground"
          >
            초기화 ↻
          </button>
        </div>

        {tab === "variables" ? (
          <>
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={addLine}
                className="rounded-lg border border-border/30 px-2 py-1 text-xs hover:bg-background/50"
              >
                + 추가
              </button>
            </div>

            <div className="space-y-1.5">
              {settings.ma.lines.map((line, index) => (
                <div
                  key={`${line.period}-${index}`}
                  className="grid grid-cols-[64px_1fr_28px] items-center gap-2 rounded-lg border border-border/20 bg-background/5 px-2 py-1.5 text-xs"
                >
                  <span className="text-sm text-foreground/85">
                    {line.period}일 선
                  </span>

                  <ConfigNumberInput
                    value={line.period}
                    min={1}
                    onCommit={(value) => updateLine(index, { period: value })}
                    className="min-w-0"
                  />

                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-background/60 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-1.5">
            {settings.ma.lines.map((line, index) => (
              <div
                key={`${line.period}-${index}`}
                className="grid grid-cols-[58px_132px_62px] items-center gap-2 rounded-lg border border-border/20 bg-background/10 px-2 py-1.5 text-xs"
              >
                <span className="text-sm font-medium text-foreground/85">
                  MA{line.period}
                </span>

                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-[11px] text-muted-foreground/55">
                    굵기
                  </span>

                  <ConfigNumberInput
                    value={line.width}
                    min={1}
                    max={4}
                    size="compact"
                    onCommit={(value) => updateLine(index, { width: value })}
                  />

                  <span className="text-[11px] text-muted-foreground/55">
                    pt
                  </span>
                </div>

                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-[11px] text-muted-foreground/55">
                    색상
                  </span>

                  <input
                    type="color"
                    value={line.color}
                    onChange={(e) =>
                      updateLine(index, { color: e.target.value })
                    }
                    className="h-8 w-8 cursor-pointer rounded-md border border-border/50 bg-background p-0.5"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-border/60 bg-background/20 p-3 text-xs text-muted-foreground">
        현재 차트 봉 개수보다 큰 기간은 선이 표시되지 않을 수 있습니다.
      </div>
    </div>
  );
}

function RsiConfig({
  settings,
  onChange,
}: {
  settings: IndicatorSettings;
  onChange: (next: IndicatorSettings) => void;
}) {
  const [tab, setTab] = useState<"variables" | "style">("variables");

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
      <div className="rounded-2xl border border-border/60 bg-background/20 p-3">
        <div className="mb-3">
          <div className="text-sm font-semibold">RSI</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            기간과 과매수/과매도 기준선을 설정합니다.
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between border-b border-border/30">
          <IndicatorConfigTabs value={tab} onChange={setTab} />

          <button
            type="button"
            onClick={() =>
              onChange({
                ...settings,
                rsi: {
                  ...DEFAULT_INDICATORS.rsi,
                  enabled: settings.rsi.enabled,
                },
              })
            }
            className="mb-2 rounded-lg px-2 py-1 text-[11px] text-muted-foreground hover:bg-background/50 hover:text-foreground"
          >
            초기화 ↻
          </button>
        </div>

        {tab === "variables" ? (
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
        ) : (
          <div className="space-y-1">
            <StyleColorRow
              label="RSI"
              colorLabel="색상"
              value={settings.rsi.color}
              onChange={(value) => update({ color: value })}
            />

            <StyleColorRow
              label="상단선"
              colorLabel="색상"
              value={settings.rsi.upperColor}
              onChange={(value) => update({ upperColor: value })}
            />

            <StyleColorRow
              label="하단선"
              colorLabel="색상"
              value={settings.rsi.lowerColor}
              onChange={(value) => update({ lowerColor: value })}
            />
          </div>
        )}
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
  const [tab, setTab] = useState<"variables" | "style">("variables");

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
      <div className="rounded-2xl border border-border/60 bg-background/20 p-3">
        <div className="mb-3">
          <div className="text-sm font-semibold">MACD</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            단기 EMA, 장기 EMA, 시그널 기간을 설정합니다.
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between border-b border-border/30">
          <IndicatorConfigTabs value={tab} onChange={setTab} />

          <button
            type="button"
            onClick={() =>
              onChange({
                ...settings,
                macd: {
                  ...DEFAULT_INDICATORS.macd,
                  enabled: settings.macd.enabled,
                },
              })
            }
            className="mb-2 rounded-lg px-2 py-1 text-[11px] text-muted-foreground hover:bg-background/50 hover:text-foreground"
          >
            초기화 ↻
          </button>
        </div>

        {tab === "variables" ? (
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
        ) : (
          <div className="space-y-1">
            <StyleColorRow
              label="MACD"
              colorLabel="색상"
              value={settings.macd.macdColor}
              onChange={(value) => update({ macdColor: value })}
            />

            <StyleColorRow
              label="Signal"
              colorLabel="색상"
              value={settings.macd.signalColor}
              onChange={(value) => update({ signalColor: value })}
            />

            <StyleColorRow
              label="양수 막대"
              colorLabel="색상"
              value={settings.macd.histogramUpColor}
              onChange={(value) => update({ histogramUpColor: value })}
            />

            <StyleColorRow
              label="음수 막대"
              colorLabel="색상"
              value={settings.macd.histogramDownColor}
              onChange={(value) => update({ histogramDownColor: value })}
            />
          </div>
        )}
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

      <ConfigNumberInput
        value={value}
        min={min}
        max={max}
        onCommit={onChange}
      />
    </label>
  );
}

function StyleColorRow({
  label,
  colorLabel = "색상",
  value,
  onChange,
}: {
  label: string;
  colorLabel?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-[84px_1fr_42px] items-center gap-2 rounded-lg border border-border/20 bg-background/10 px-2 py-1.5 text-xs">
      <span className="text-sm font-medium text-foreground/85">{label}</span>

      <span className="text-right text-[11px] text-muted-foreground/55">
        {colorLabel}
      </span>

      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ml-auto h-8 w-8 cursor-pointer rounded-md border border-border/50 bg-background p-0.5"
      />
    </div>
  );
}