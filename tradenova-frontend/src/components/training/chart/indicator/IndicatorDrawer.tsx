import type { IndicatorSettings, MaLineSetting } from "@/types/training";

type IndicatorScope = "GLOBAL" | "CHART";

type Props = {
  open: boolean;
  onClose: () => void;

  scope: IndicatorScope;
  onScopeChange: (scope: IndicatorScope) => void;

  activeChartLabel: string;
  hasChartOverride: boolean;

  settings: IndicatorSettings;
  onChange: (next: IndicatorSettings) => void;

  onResetChart: () => void;
  onApplyChartToGlobal: () => void;

  onResetGlobal: () => void;
  onClearAllChartOverrides: () => void;

  hasAnyChartOverride: boolean;
  onResetGlobal: () => void;
  onClearAllChartOverrides: () => void;
};

const disabledChartItems = ["볼린저밴드", "일목균형표", "매물대"];
const disabledSubItems = ["RSI", "MACD"];

export function IndicatorDrawer({
  open,
  onClose,
  scope,
  onScopeChange,
  activeChartLabel,
  hasChartOverride,
  settings,
  onChange,
  onResetChart,
  onApplyChartToGlobal,
  hasAnyChartOverride,
  onResetGlobal,
  onClearAllChartOverrides,
}: Props) {
  const updateMaLine = (index: number, patch: Partial<MaLineSetting>) => {
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

  const addMaLine = () => {
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

  const removeMaLine = (index: number) => {
    onChange({
      ...settings,
      ma: {
        ...settings.ma,
        lines: settings.ma.lines.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      )}

      <aside
        className={[
          "fixed left-0 top-[56px] z-50 h-[calc(100vh-56px)] w-[320px]",
          "border-r border-border/60 bg-background/95 shadow-2xl backdrop-blur",
          "transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
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
                onClick={onClose}
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
                현재 차트만
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
            <input
              placeholder="지표명 검색"
              className="mb-4 h-9 w-full rounded-xl border border-border/60 bg-background px-3 text-sm outline-none"
            />

            <SectionTitle>차트지표</SectionTitle>

            <IndicatorRow
              checked={settings.ma.enabled}
              label="이동평균선"
              onToggle={(checked) =>
                onChange({
                  ...settings,
                  ma: { ...settings.ma, enabled: checked },
                })
              }
            />

            {settings.ma.enabled && (
              <div className="mb-3 rounded-xl border border-border/60 bg-background/30 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    이동평균선 설정
                  </span>
                  <button
                    type="button"
                    onClick={addMaLine}
                    className="rounded-md border border-border/60 px-2 py-1 text-[11px] hover:bg-background/60"
                  >
                    + 기간 추가
                  </button>
                </div>

                <div className="space-y-2">
                  {settings.ma.lines.map((line, index) => (
                    <div
                      key={`${line.period}-${index}`}
                      className="grid grid-cols-[1fr_54px_42px_24px] items-center gap-2 text-xs"
                    >
                      <div className="text-muted-foreground">
                        {line.period}일 선
                      </div>

                      <input
                        type="number"
                        min={1}
                        value={line.period}
                        onChange={(e) =>
                          updateMaLine(index, {
                            period: Number(e.target.value),
                          })
                        }
                        className="h-7 rounded-md border border-border/60 bg-background px-2 text-xs outline-none"
                      />

                      <input
                        type="color"
                        value={line.color}
                        onChange={(e) =>
                          updateMaLine(index, { color: e.target.value })
                        }
                        className="h-7 w-10 cursor-pointer rounded border border-border/60 bg-background"
                      />

                      <button
                        type="button"
                        onClick={() => removeMaLine(index)}
                        className="text-muted-foreground hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {disabledChartItems.map((name) => (
              <DisabledIndicatorRow key={name} label={name} />
            ))}

            <SectionTitle>보조지표</SectionTitle>

            <IndicatorRow
              checked={settings.volume.enabled}
              label="거래량"
              onToggle={(checked) =>
                onChange({
                  ...settings,
                  volume: { enabled: checked },
                })
              }
            />

            {disabledSubItems.map((name) => (
              <DisabledIndicatorRow key={name} label={name} />
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-4 border-b border-border/60 pb-2 text-xs text-muted-foreground">
      {children}
    </div>
  );
}

function IndicatorRow({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <div className="mb-2 flex items-center justify-between rounded-xl px-2 py-2 hover:bg-background/40">
      <label className="flex cursor-pointer items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span>{label}</span>
      </label>

      <button
        type="button"
        className="text-muted-foreground hover:text-foreground"
        title="설정"
      >
        ⚙
      </button>
    </div>
  );
}

function DisabledIndicatorRow({ label }: { label: string }) {
  return (
    <div className="mb-2 flex items-center justify-between rounded-xl px-2 py-2 opacity-40">
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" disabled />
        <span>{label}</span>
      </label>

      <button type="button" disabled className="text-muted-foreground">
        ⚙
      </button>
    </div>
  );
}
