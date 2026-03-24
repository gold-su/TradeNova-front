import type { ReportDraftContent } from "@/types/training";

type Props = {
  value: ReportDraftContent;
  onChange: React.Dispatch<React.SetStateAction<ReportDraftContent>>;
  onSave: () => void;
  onCreateSnapshot: () => void;
  onCreateNoteEvent: () => void;
  saving: boolean;
};

export function DraftEditor({
  value,
  onChange,
  onSave,
  onCreateSnapshot,
  onCreateNoteEvent,
  saving,
}: Props) {
  const setField = (key: keyof ReportDraftContent, fieldValue: string) => {
    onChange((prev) => ({
      ...prev,
      [key]: fieldValue,
    }));
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
      <div className="mb-3 text-sm font-semibold">Draft Report</div>

      <div className="space-y-3">
        <input
          value={value.thesis ?? ""}
          onChange={(e) => setField("thesis", e.target.value)}
          placeholder="thesis"
          className="w-full rounded-xl border border-border/60 bg-background px-3 py-2"
        />

        <textarea
          rows={3}
          value={value.entryReason ?? ""}
          onChange={(e) => setField("entryReason", e.target.value)}
          placeholder="entryReason"
          className="w-full rounded-xl border border-border/60 bg-background px-3 py-2"
        />

        <textarea
          rows={3}
          value={value.exitPlan ?? ""}
          onChange={(e) => setField("exitPlan", e.target.value)}
          placeholder="exitPlan"
          className="w-full rounded-xl border border-border/60 bg-background px-3 py-2"
        />

        <textarea
          rows={3}
          value={value.riskNote ?? ""}
          onChange={(e) => setField("riskNote", e.target.value)}
          placeholder="riskNote"
          className="w-full rounded-xl border border-border/60 bg-background px-3 py-2"
        />

        <textarea
          rows={5}
          value={value.freeNote ?? ""}
          onChange={(e) => setField("freeNote", e.target.value)}
          placeholder="freeNote"
          className="w-full rounded-xl border border-border/60 bg-background px-3 py-2"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={onSave}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          {saving ? "저장 중..." : "Draft 저장"}
        </button>

        <button
          onClick={onCreateSnapshot}
          className="rounded-xl border border-border/60 px-4 py-2 text-sm"
        >
          Snapshot 저장
        </button>

        <button
          onClick={onCreateNoteEvent}
          className="rounded-xl border border-border/60 px-4 py-2 text-sm"
        >
          NOTE 이벤트 저장
        </button>
      </div>
    </div>
  );
}
