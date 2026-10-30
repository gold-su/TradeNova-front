import { useEffect, useState } from "react";
import type { IndicatorSettings } from "@/types/training";
import {
  INDICATOR_META,
  type IndicatorKey,
} from "@/components/training/chart/indicator/indicatorMeta";
import { IndicatorConfigPanel } from "@/components/training/chart/indicator/IndicatorConfigPanel";
import { Search, Settings } from "lucide-react";
import {
  applyIndicatorPreset,
  INDICATOR_PRESETS,
  type IndicatorPresetKey,
} from "./indicatorPresets";
import { useI18n } from "@/i18n/LanguageProvider";

type IndicatorScope = "GLOBAL" | "CHART";

type Props = {
  open: boolean;
  onClose: () => void;

  scope: IndicatorScope;
  onScopeChange: (scope: IndicatorScope) => void;

  activeChartLabel: string;
  hasChartOverride: boolean;
  hasAnyChartOverride: boolean;

  settings: IndicatorSettings;
  onChange: (next: IndicatorSettings) => void;

  onResetChart: () => void;
  onApplyChartToGlobal: () => void;
  onResetGlobal: () => void;
  onClearAllChartOverrides: () => void;
};

export function IndicatorDrawer({
  open,
  onClose,
  scope,
  onScopeChange,
  activeChartLabel,
  hasChartOverride,
  hasAnyChartOverride,
  settings,
  onChange,
  onResetChart,
  onApplyChartToGlobal,
  onResetGlobal,
  onClearAllChartOverrides,
}: Props) {
  const { t } = useI18n();
  const [selectedConfig, setSelectedConfig] = useState<IndicatorKey | null>(
    null,
  );

  //검색
  const [keyword, setKeyword] = useState("");
  const [presetFeedback, setPresetFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (presetFeedback == null) return;

    const timeoutId = window.setTimeout(() => setPresetFeedback(null), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [presetFeedback]);

  const indicatorLabel = (key: IndicatorKey) => {
    if (key === "rsi") return "RSI";
    if (key === "macd") return "MACD";
    const resourceKey = key === "ma" ? "movingAverage" : key;
    return t(`training.indicator.${resourceKey}`);
  };

  const presetLabel = (key: IndicatorPresetKey) => {
    const resourceKey = { BASIC: "basic", TREND: "trend", MOMENTUM: "momentum", VOLATILITY: "volatility" }[key];
    return t(`training.indicator.${resourceKey}`);
  };

  const handlePreset = (preset: IndicatorPresetKey) => {
    onChange(applyIndicatorPreset(settings, preset));
    setPresetFeedback(t("training.indicator.appliedPreset", { name: presetLabel(preset) }));
  };

  const getChecked = (key: IndicatorKey) => {
    switch (key) {
      case "ma":
        return settings.ma.enabled;
      case "volume":
        return settings.volume.enabled;
      case "bollinger":
        return settings.bollinger.enabled;
      case "ichimoku":
        return settings.ichimoku.enabled;
      case "volumeProfile":
        return settings.volumeProfile.enabled;
      case "rsi":
        return settings.rsi.enabled;
      case "macd":
        return settings.macd.enabled;
      default:
        return false;
    }
  };

  const toggleIndicator = (key: IndicatorKey, checked: boolean) => {
    switch (key) {
      case "ma":
        onChange({
          ...settings,
          ma: {
            ...settings.ma,
            enabled: checked,
          },
        });
        return;

      case "volume":
        onChange({
          ...settings,
          volume: {
            ...settings.volume,
            enabled: checked,
          },
        });
        return;

      case "bollinger":
        onChange({
          ...settings,
          bollinger: {
            ...settings.bollinger,
            enabled: checked,
          },
        });
        return;

      case "ichimoku":
        onChange({
          ...settings,
          ichimoku: {
            ...settings.ichimoku,
            enabled: checked,
          },
        });
        return;

      case "volumeProfile":
        onChange({
          ...settings,
          volumeProfile: {
            ...settings.volumeProfile,
            enabled: checked,
          },
        });
        return;

      case "rsi":
        onChange({
          ...settings,
          rsi: {
            ...settings.rsi,
            enabled: checked,
          },
        });
        return;

      case "macd":
        onChange({
          ...settings,
          macd: {
            ...settings.macd,
            enabled: checked,
          },
        });
        return;
    }
  };

  const closeAll = () => {
    setSelectedConfig(null);
    onClose();
  };

  const normalizedKeyword = keyword.trim().toLowerCase();

  const chartIndicators = INDICATOR_META.filter(
    (x) =>
      x.group === "chart" && indicatorLabel(x.key).toLowerCase().includes(normalizedKeyword),
  );

  const subIndicators = INDICATOR_META.filter(
    (x) =>
      x.group === "sub" && indicatorLabel(x.key).toLowerCase().includes(normalizedKeyword),
  );

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={closeAll} />
      )}

      <aside
        className={[
          "fixed left-0 top-[56px] z-50 h-[calc(100vh-56px)] w-[320px]",
          "border-r border-border/60 bg-background/95 shadow-2xl backdrop-blur",
          "transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="relative flex h-full flex-col">
          <div className="border-b border-border/60 px-4 py-3">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">{t("training.indicator.title")}</div>
                <div className="text-[11px] text-muted-foreground">
                  {scope === "GLOBAL"
                    ? t("training.indicator.globalSettings")
                    : activeChartLabel}
                </div>
              </div>

              <button
                onClick={closeAll}
                className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-background/60"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onScopeChange("GLOBAL")}
                className={[
                  "rounded-xl border px-3 py-2 transition-colors",
                  scope === "GLOBAL"
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border/60 bg-background/30 text-muted-foreground",
                ].join(" ")}
              >
                {t("training.indicator.global")}
              </button>

              <button
                type="button"
                onClick={() => onScopeChange("CHART")}
                className={[
                  "rounded-xl border px-3 py-2 transition-colors",
                  scope === "CHART"
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border/60 bg-background/30 text-muted-foreground",
                ].join(" ")}
              >
                {t("training.indicator.selected")}
              </button>
            </div>

            {scope === "GLOBAL" && (
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onResetGlobal}
                  className="flex-1 rounded-xl border border-border/60 px-2 py-2 text-[11px] text-muted-foreground hover:bg-background/50"
                >
                  {t("training.indicator.resetAll")}
                </button>

                <button
                  type="button"
                  onClick={onClearAllChartOverrides}
                  disabled={!hasAnyChartOverride}
                  className="flex-1 rounded-xl border border-border/60 px-2 py-2 text-[11px] text-muted-foreground hover:bg-background/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("training.indicator.clearOverrides")}
                </button>
              </div>
            )}

            {scope === "CHART" && (
              <div className="mt-2 flex gap-2">
                {hasChartOverride && (
                  <button
                    type="button"
                    onClick={onResetChart}
                    className="flex-1 rounded-xl border border-border/60 px-2 py-2 text-[11px] text-muted-foreground hover:bg-background/50"
                  >
                    {t("training.indicator.returnGlobal")}
                  </button>
                )}

                <button
                  type="button"
                  onClick={onApplyChartToGlobal}
                  className="flex-1 rounded-xl border border-border/60 px-2 py-2 text-[11px] text-muted-foreground hover:bg-background/50"
                >
                  {t("training.indicator.applyGlobal")}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <section className="mb-4 rounded-lg border border-border/60 bg-background/30 p-2.5">
              <div className="mb-2 flex min-h-4 items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-foreground/80">
                  {t("training.indicator.quick")}
                </span>
                <span
                  role="status"
                  aria-live="polite"
                  className="text-[10px] text-primary"
                >
                  {presetFeedback}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {INDICATOR_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handlePreset(preset.key)}
                    className="rounded-md border border-border/60 bg-background/40 px-1 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/70"
                  >
                    {presetLabel(preset.key)}
                  </button>
                ))}
              </div>

              <p className="mt-2 text-[10px] leading-4 text-muted-foreground/75">
                {t("training.indicator.gridNotice")}
              </p>
            </section>

            <div className="relative mb-4">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
              />

              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t("training.indicator.search")}
                className="
                h-10 w-full rounded-xl border border-white/[0.06]
                bg-white/[0.03]
                px-9 text-sm outline-none
                transition-all duration-150
                placeholder:text-muted-foreground/60
                focus:border-primary/50
                focus:bg-background
                focus:ring-1 focus:ring-primary/20
                "
              />

              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              )}
            </div>

            <SectionTitle compact={!!keyword}>{t("training.indicator.price")}</SectionTitle>

            {chartIndicators.length > 0 ? (
              chartIndicators.map((item) => (
                <IndicatorRow
                  key={item.key}
                  checked={getChecked(item.key)}
                  label={indicatorLabel(item.key)}
                  settingsLabel={t("training.indicator.settings")}
                  disabled={item.disabled}
                  onToggle={(checked) => toggleIndicator(item.key, checked)}
                  onConfigClick={
                    item.configurable && !item.disabled
                      ? () =>
                          setSelectedConfig((prev) =>
                            prev === item.key ? null : item.key,
                          )
                      : undefined
                  }
                />
              ))
            ) : (
              <EmptySearchResult label={t("training.indicator.noResults")} />
            )}

            <SectionTitle compact={!!keyword}>{t("training.indicator.oscillator")}</SectionTitle>

            {subIndicators.length > 0 ? (
              subIndicators.map((item) => (
                <IndicatorRow
                  key={item.key}
                  checked={getChecked(item.key)}
                  label={indicatorLabel(item.key)}
                  settingsLabel={t("training.indicator.settings")}
                  disabled={item.disabled}
                  onToggle={(checked) => toggleIndicator(item.key, checked)}
                  onConfigClick={
                    item.configurable && !item.disabled
                      ? () =>
                          setSelectedConfig((prev) =>
                            prev === item.key ? null : item.key,
                          )
                      : undefined
                  }
                />
              ))
            ) : (
              <EmptySearchResult label={t("training.indicator.noResults")} />
            )}
          </div>

          <IndicatorConfigPanel
            selectedKey={selectedConfig}
            settings={settings}
            onChange={onChange}
            onClose={() => setSelectedConfig(null)}
          />
        </div>
      </aside>
    </>
  );
}

function SectionTitle({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={[
        "border-b border-border/60 pb-2 text-xs text-muted-foreground",
        compact ? "mb-2 mt-3" : "mb-3 mt-5",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function EmptySearchResult({ label }: { label: string }) {
  return (
    <div className="flex h-[72px] items-center justify-center text-sm text-muted-foreground/45">
      {label}
    </div>
  );
}

function IndicatorRow({
  checked,
  label,
  settingsLabel,
  disabled,
  onToggle,
  onConfigClick,
}: {
  checked: boolean;
  label: string;
  settingsLabel: string;
  disabled?: boolean;
  onToggle: (checked: boolean) => void;
  onConfigClick?: () => void;
}) {
  return (
    <div
      className={[
        "mb-2 flex items-center justify-between rounded-xl px-2 py-2",
        disabled ? "opacity-40" : "hover:bg-background/40",
      ].join(" ")}
    >
      <label
        className={[
          "flex items-center gap-3 text-sm",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span>{label}</span>
      </label>

      <button
        type="button"
        disabled={disabled || !onConfigClick}
        onClick={onConfigClick}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/60 transition hover:bg-white/[0.05] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        title={settingsLabel}
      >
        <Settings size={15} strokeWidth={1.8} />
      </button>
    </div>
  );
}
