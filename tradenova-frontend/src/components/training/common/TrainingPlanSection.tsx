import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import type { ReportDocumentResponse, TrainingChartDto } from "@/types/training";

type ScenarioContent = {
  thesis: string;
  entryReason: string;
  exitPlan: string;
  riskNote: string;
  freeNote: string;
};

type Props = {
  activeChart: TrainingChartDto | null;
  latestScenario: ReportDocumentResponse | null;
  onCreateScenario: (chartId: number, content: ScenarioContent) => Promise<unknown>;
};

const emptyScenario = (): ScenarioContent => ({
  thesis: "",
  entryReason: "",
  exitPlan: "",
  riskNote: "",
  freeNote: "",
});

export function TrainingPlanSection({
  activeChart,
  latestScenario,
  onCreateScenario,
}: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ScenarioContent>(emptyScenario);

  const openEditor = () => {
    setForm({
      thesis: latestScenario?.contentJson.thesis ?? "",
      entryReason: latestScenario?.contentJson.entryReason ?? "",
      exitPlan: latestScenario?.contentJson.exitPlan ?? "",
      riskNote: latestScenario?.contentJson.riskNote ?? "",
      freeNote: latestScenario?.contentJson.freeNote ?? "",
    });
    setEditorOpen(true);
  };

  const save = async () => {
    if (!activeChart || !form.thesis.trim()) return;
    setSaving(true);
    try {
      const saved = await onCreateScenario(activeChart.chartId, form);
      if (saved) setEditorOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section className="border-b border-border/35 pb-3">
        <div className="mb-2">
          <div className="text-[10px] font-bold tracking-[0.14em] text-primary">PLAN</div>
          <div className="text-sm font-semibold">현재 계획</div>
        </div>

        {latestScenario ? (
          <>
            <dl className="grid grid-cols-[56px_1fr] gap-x-2 gap-y-1 text-[11px] leading-[18px]">
              {([
                ["관점", latestScenario.contentJson.thesis],
                ["진입 조건", latestScenario.contentJson.entryReason],
                ["무효화", latestScenario.contentJson.riskNote],
              ] satisfies Array<[string, string | undefined]>)
                .filter(([, value]) => value?.trim())
                .map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="line-clamp-1 text-foreground/85">{value}</dd>
                  </div>
                ))}
            </dl>

            {latestScenario.contentJson.exitPlan?.trim() && (
              <div className="mt-1.5">
                <button
                  type="button"
                  aria-expanded={detailsOpen}
                  onClick={() => setDetailsOpen((open) => !open)}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown className={`h-3 w-3 transition ${detailsOpen ? "rotate-180" : ""}`} />
                  {detailsOpen ? "청산 계획 접기" : "청산 계획 보기"}
                </button>
                {detailsOpen && (
                  <p className="mt-1 text-[11px] leading-[18px] text-foreground/75">
                    {latestScenario.contentJson.exitPlan}
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={openEditor}
              className="mt-2 text-[11px] font-semibold text-primary hover:text-primary/80"
            >
              계획 수정
            </button>
          </>
        ) : (
          <div>
            <p className="text-xs text-muted-foreground">저장된 계획이 없습니다.</p>
            <button
              type="button"
              onClick={openEditor}
              disabled={!activeChart}
              className="mt-2 h-8 rounded-lg border border-border/45 px-3 text-xs font-semibold hover:border-primary/35 disabled:opacity-40"
            >
              매매 시나리오 작성
            </button>
          </div>
        )}
      </section>

      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <button type="button" aria-label="닫기" className="absolute inset-0" onClick={() => setEditorOpen(false)} />
          <div className="relative z-10 w-full max-w-xl rounded-3xl border border-border/45 bg-background shadow-2xl">
            <div className="flex items-start justify-between border-b border-border/35 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold">{latestScenario ? "시나리오 수정" : "시나리오 작성"}</h2>
                <p className="mt-1 text-xs text-muted-foreground">현재 차트의 판단 계획을 기록합니다.</p>
              </div>
              <button type="button" aria-label="닫기" onClick={() => setEditorOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="thin-scrollbar max-h-[68vh] space-y-3 overflow-y-auto px-5 py-4">
              <ScenarioField label="핵심 관점" value={form.thesis} onChange={(thesis) => setForm((prev) => ({ ...prev, thesis }))} />
              <ScenarioField label="진입 조건" value={form.entryReason} multiline onChange={(entryReason) => setForm((prev) => ({ ...prev, entryReason }))} />
              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <ScenarioField label="대응 계획" value={form.exitPlan} multiline onChange={(exitPlan) => setForm((prev) => ({ ...prev, exitPlan }))} />
                <ScenarioField label="무효화 기준" value={form.riskNote} multiline onChange={(riskNote) => setForm((prev) => ({ ...prev, riskNote }))} />
              </div>
              <ScenarioField label="추가 메모" value={form.freeNote} multiline onChange={(freeNote) => setForm((prev) => ({ ...prev, freeNote }))} />
            </div>

            <div className="flex items-center justify-between border-t border-border/35 px-5 py-4">
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Check className="h-3 w-3" /> 핵심 관점은 필수입니다
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditorOpen(false)} className="px-4 py-2 text-sm text-muted-foreground">취소</button>
                <button type="button" onClick={save} disabled={saving || !form.thesis.trim()} className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground disabled:opacity-40">
                  {saving ? "저장 중..." : "시나리오 저장"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ScenarioField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold">{label}</span>
      {multiline ? (
        <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} className="w-full resize-none rounded-xl border border-border/35 bg-background/55 px-3 py-2 text-sm outline-none focus:border-primary/45" />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-xl border border-border/35 bg-background/55 px-3 text-sm outline-none focus:border-primary/45" />
      )}
    </label>
  );
}
