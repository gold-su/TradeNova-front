import type { IndicatorSettings, MaLineSetting } from "@/types/training";
import type { IndicatorKey } from "./indicatorMeta";
import { ConfigNumberInput } from "./ConfigNumberInput";
import { DEFAULT_INDICATORS } from "./indicatorDefaults";
import { useState } from "react";
import { IndicatorConfigTabs } from "./IndicatorConfigTabs";
import { useI18n } from "@/i18n/LanguageProvider";

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
  const { t } = useI18n();
  if (!selectedKey) return null;

  return (
    <aside className="absolute left-[320px] top-4 z-50 max-h-[520px] w-[340px] overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <div className="text-sm font-semibold">{t("training.indicator.settings")}</div>
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
        ) : selectedKey === "bollinger" ? (
          <BollingerConfig settings={settings} onChange={onChange} />
        ) : (
          <div className="rounded-2xl border border-border/60 bg-background/30 p-4 text-sm text-muted-foreground">
            {t("training.indicator.notReady")}
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
  const { t } = useI18n();
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
              <div className="text-sm font-semibold">{t("training.indicator.movingAverage")}</div>
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
              { value: "SMA", label: t("training.indicator.sma") },
              { value: "WMA", label: t("training.indicator.wma") },
              { value: "EMA", label: t("training.indicator.ema") },
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
        {t("training.indicator.periodNotice")}
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
  const { t } = useI18n();
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
            {t("training.indicator.rsiDescription")}
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
            {t("training.indicator.reset")} ↻
          </button>
        </div>

        {tab === "variables" ? (
          <div className="space-y-3 text-xs">
            <ConfigNumberRow
              label={t("training.indicator.period")}
              value={settings.rsi.period}
              min={1}
              onChange={(value) => update({ period: value })}
            />

            <ConfigNumberRow
              label={t("training.indicator.overbought")}
              value={settings.rsi.upper}
              min={1}
              max={100}
              onChange={(value) => update({ upper: value })}
            />

            <ConfigNumberRow
              label={t("training.indicator.oversold")}
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
              colorLabel={t("training.indicator.color")}
              value={settings.rsi.color}
              onChange={(value) => update({ color: value })}
            />

            <StyleColorRow
              label={t("training.indicator.upper")}
              colorLabel={t("training.indicator.color")}
              value={settings.rsi.upperColor}
              onChange={(value) => update({ upperColor: value })}
            />

            <StyleColorRow
              label={t("training.indicator.lower")}
              colorLabel={t("training.indicator.color")}
              value={settings.rsi.lowerColor}
              onChange={(value) => update({ lowerColor: value })}
            />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border/60 bg-background/20 p-3 text-xs text-muted-foreground">
        {t("training.indicator.rsiNotice")}
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
  const { t } = useI18n();
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
            {t("training.indicator.macdDescription")}
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
            {t("training.indicator.reset")} ↻
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
              colorLabel={t("training.indicator.color")}
              value={settings.macd.macdColor}
              onChange={(value) => update({ macdColor: value })}
            />

            <StyleColorRow
              label="Signal"
              colorLabel={t("training.indicator.color")}
              value={settings.macd.signalColor}
              onChange={(value) => update({ signalColor: value })}
            />

            <StyleColorRow
              label={t("training.indicator.positiveBars")}
              colorLabel={t("training.indicator.color")}
              value={settings.macd.histogramUpColor}
              onChange={(value) => update({ histogramUpColor: value })}
            />

            <StyleColorRow
              label={t("training.indicator.negativeBars")}
              colorLabel={t("training.indicator.color")}
              value={settings.macd.histogramDownColor}
              onChange={(value) => update({ histogramDownColor: value })}
            />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border/60 bg-background/20 p-3 text-xs text-muted-foreground">
        {t("training.indicator.macdNotice")}
      </div>
    </div>
  );
}

function BollingerConfig({
  settings,
  onChange,
}: {
  settings: IndicatorSettings;
  onChange: (next: IndicatorSettings) => void;
}) {
  const { t } = useI18n();
  const [tab, setTab] = useState<"variables" | "style">("variables");

  const update = (patch: Partial<IndicatorSettings["bollinger"]>) => {
    onChange({
      ...settings,
      bollinger: {
        ...settings.bollinger,
        ...patch,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-background/20 p-3">
        <div className="mb-3">
          <div className="text-sm font-semibold">{t("training.indicator.bollinger")}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {t("training.indicator.bollingerDescription")}
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between border-b border-border/30">
          <IndicatorConfigTabs value={tab} onChange={setTab} />

          <button
            type="button"
            onClick={() =>
              onChange({
                ...settings,
                bollinger: {
                  ...DEFAULT_INDICATORS.bollinger,
                  enabled: settings.bollinger.enabled,
                },
              })
            }
            className="mb-2 rounded-lg px-2 py-1 text-[11px] text-muted-foreground hover:bg-background/50 hover:text-foreground"
          >
            {t("training.indicator.reset")} ↻
          </button>
        </div>

        {tab === "variables" ? (
          <div className="space-y-3 text-xs">
            <ConfigNumberRow
              label={t("training.indicator.period")}
              value={settings.bollinger.period}
              min={1}
              onChange={(value) => update({ period: value })}
            />

            <ConfigNumberRow
              label={t("training.indicator.deviation")}
              value={settings.bollinger.multiplier}
              min={1}
              onChange={(value) => update({ multiplier: value })}
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            <StyleLineRow
              label={t("training.indicator.upper")}
              color={settings.bollinger.upperColor}
              width={settings.bollinger.upperWidth}
              onColorChange={(value) => update({ upperColor: value })}
              onWidthChange={(value) => update({ upperWidth: value })}
            />

            <StyleLineRow
              label={t("training.indicator.middle")}
              color={settings.bollinger.middleColor}
              width={settings.bollinger.middleWidth}
              onColorChange={(value) => update({ middleColor: value })}
              onWidthChange={(value) => update({ middleWidth: value })}
            />

            <StyleLineRow
              label={t("training.indicator.lower")}
              color={settings.bollinger.lowerColor}
              width={settings.bollinger.lowerWidth}
              onColorChange={(value) => update({ lowerColor: value })}
              onWidthChange={(value) => update({ lowerWidth: value })}
            />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border/60 bg-background/20 p-3 text-xs text-muted-foreground">
        {t("training.indicator.bollingerNotice")}
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
  colorLabel,
  value,
  onChange,
}: {
  label: string;
  colorLabel?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-[84px_1fr_42px] items-center gap-2 rounded-lg border border-border/20 bg-background/10 px-2 py-1.5 text-xs">
      <span className="text-sm font-medium text-foreground/85">{label}</span>

      <span className="text-right text-[11px] text-muted-foreground/55">
        {colorLabel ?? t("training.indicator.color")}
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

function StyleLineRow({
  label,
  color,
  width,
  onColorChange,
  onWidthChange,
}: {
  label: string;
  color: string;
  width: number;
  onColorChange: (value: string) => void;
  onWidthChange: (value: number) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-[58px_132px_62px] items-center gap-2 rounded-lg border border-border/20 bg-background/10 px-2 py-1.5 text-xs">
      <span className="text-sm font-medium text-foreground/85">{label}</span>

      <div className="flex items-center justify-end gap-1.5">
        <span className="text-[11px] text-muted-foreground/55">{t("training.indicator.width")}</span>

        <ConfigNumberInput
          value={width}
          min={1}
          max={4}
          size="compact"
          onCommit={onWidthChange}
        />

        <span className="text-[11px] text-muted-foreground/55">pt</span>
      </div>

      <div className="flex items-center justify-end gap-1.5">
        <span className="text-[11px] text-muted-foreground/55">{t("training.indicator.color")}</span>

        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded-md border border-border/50 bg-background p-0.5"
        />
      </div>
    </div>
  );
}
