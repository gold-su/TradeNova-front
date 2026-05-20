import { useState } from "react";
import type { IndicatorSettings } from "@/types/training";
import {
  INDICATOR_META,
  type IndicatorKey,
} from "@/components/training/chart/indicator/indicatorMeta";
import { IndicatorConfigPanel } from "@/components/training/chart/indicator/IndicatorConfigPanel";
import { Search, Settings } from "lucide-react";

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
  const [selectedConfig, setSelectedConfig] = useState<IndicatorKey | null>(
    null,
  );

  //검색
  const [keyword, setKeyword] = useState("");

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
      x.group === "chart" && x.label.toLowerCase().includes(normalizedKeyword),
  );

  const subIndicators = INDICATOR_META.filter(
    (x) =>
      x.group === "sub" && x.label.toLowerCase().includes(normalizedKeyword),
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
                <div className="text-sm font-semibold">보조지표</div>
                <div className="text-[11px] text-muted-foreground">
                  {scope === "GLOBAL"
                    ? "전체 차트 공통 설정"
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
                전체 차트
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
                선택 차트만
              </button>
            </div>

            {scope === "GLOBAL" && (
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onResetGlobal}
                  className="flex-1 rounded-xl border border-border/60 px-2 py-2 text-[11px] text-muted-foreground hover:bg-background/50"
                >
                  전체 설정 초기화
                </button>

                <button
                  type="button"
                  onClick={onClearAllChartOverrides}
                  disabled={!hasAnyChartOverride}
                  className="flex-1 rounded-xl border border-border/60 px-2 py-2 text-[11px] text-muted-foreground hover:bg-background/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  모든 개별 지표 해제
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
                    전체 설정으로 되돌리기
                  </button>
                )}

                <button
                  type="button"
                  onClick={onApplyChartToGlobal}
                  className="flex-1 rounded-xl border border-border/60 px-2 py-2 text-[11px] text-muted-foreground hover:bg-background/50"
                >
                  이 설정을 전체 적용
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="relative mb-4">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
              />

              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="지표명 검색"
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

            <SectionTitle compact={!!keyword}>차트지표</SectionTitle>

            {chartIndicators.length > 0 ? (
              chartIndicators.map((item) => (
                <IndicatorRow
                  key={item.key}
                  checked={getChecked(item.key)}
                  label={item.label}
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
              <EmptySearchResult />
            )}

            <SectionTitle compact={!!keyword}>보조지표</SectionTitle>

            {subIndicators.length > 0 ? (
              subIndicators.map((item) => (
                <IndicatorRow
                  key={item.key}
                  checked={getChecked(item.key)}
                  label={item.label}
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
              <EmptySearchResult />
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

function EmptySearchResult() {
  return (
    <div className="flex h-[72px] items-center justify-center text-sm text-muted-foreground/45">
      검색결과가 없습니다
    </div>
  );
}

function IndicatorRow({
  checked,
  label,
  disabled,
  onToggle,
  onConfigClick,
}: {
  checked: boolean;
  label: string;
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
        title="설정"
      >
        <Settings size={15} strokeWidth={1.8} />
      </button>
    </div>
  );
}
