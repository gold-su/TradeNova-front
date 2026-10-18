import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import type { QuickPhraseResponse } from "@/types/training";
import { WorkspaceDialog } from "../common/WorkspaceDialog";

type Props = {
  items: QuickPhraseResponse[];
  onClose: () => void;
  onCreate: (content: string) => Promise<QuickPhraseResponse>;
  onUpdate: (id: number, content: string) => Promise<QuickPhraseResponse>;
  onDelete: (id: number) => Promise<void>;
  onUpdatedSelection?: (phrase: QuickPhraseResponse) => void;
  onDeletedSelection?: (id: number) => void;
};

export function QuickPhraseManagerDialog({
  items,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  onUpdatedSelection,
  onDeletedSelection,
}: Props) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetEditor = () => {
    setCreating(false);
    setEditingId(null);
    setValue("");
    setError(null);
  };

  const save = async () => {
    const content = value.trim();
    if (!content) {
      setError("근거 문구를 입력해주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (editingId == null) {
        await onCreate(content);
      } else {
        const updated = await onUpdate(editingId, content);
        onUpdatedSelection?.(updated);
      }
      resetEditor();
    } catch {
      setError("근거를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    setBusy(true);
    setError(null);
    try {
      await onDelete(id);
      onDeletedSelection?.(id);
      setDeletingId(null);
      if (editingId === id) resetEditor();
    } catch {
      setError("근거를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <WorkspaceDialog
      title="매매 근거 관리"
      description="거래 중 빠르게 선택할 근거 문구를 관리합니다."
      onClose={onClose}
      busy={busy}
      medium
    >
      <div className="thin-scrollbar min-h-0 max-h-[58dvh] overflow-y-auto px-5 pb-4">
        <div className="mb-2 text-[10px] font-bold tracking-widest text-muted-foreground">
          등록된 근거
        </div>
        <div className="space-y-1">
          {items.length === 0 && !creating && (
            <p className="rounded-lg bg-muted/20 px-3 py-5 text-center text-xs text-muted-foreground">
              등록된 근거가 없습니다.
            </p>
          )}
          {items.map((phrase) =>
            editingId === phrase.id ? (
              <PhraseEditor
                key={phrase.id}
                value={value}
                onChange={setValue}
                onCancel={resetEditor}
                onSave={save}
                busy={busy}
              />
            ) : (
              <div key={phrase.id} className="rounded-lg border border-border/35 bg-muted/10 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-xs">{phrase.content}</span>
                  <button
                    type="button"
                    aria-label={`${phrase.content} 수정`}
                    disabled={busy}
                    onClick={() => {
                      setCreating(false);
                      setDeletingId(null);
                      setEditingId(phrase.id);
                      setValue(phrase.content);
                    }}
                    className="rounded p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`${phrase.content} 삭제`}
                    disabled={busy}
                    onClick={() => setDeletingId(phrase.id)}
                    className="rounded p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {deletingId === phrase.id && (
                  <div className="mt-2 flex items-center justify-between gap-3 border-t border-border/30 pt-2 text-[11px]">
                    <span className="text-muted-foreground">이 근거를 삭제할까요?</span>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setDeletingId(null)} className="rounded px-2 py-1 hover:bg-muted/50">취소</button>
                      <button type="button" onClick={() => remove(phrase.id)} className="rounded bg-red-500/15 px-2 py-1 font-semibold text-red-300">삭제</button>
                    </div>
                  </div>
                )}
              </div>
            ),
          )}
        </div>
        {creating && (
          <div className="mt-2">
            <PhraseEditor value={value} onChange={setValue} onCancel={resetEditor} onSave={save} busy={busy} />
          </div>
        )}
        {error && <p role="alert" className="mt-2 text-xs text-red-300">{error}</p>}
        {!creating && editingId == null && (
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setDeletingId(null);
              setValue("");
            }}
            className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/60 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" /> 새 근거 추가
          </button>
        )}
      </div>
      <footer className="flex justify-end border-t border-border/35 px-5 py-3">
        <button type="button" disabled={busy} onClick={onClose} className="h-9 rounded-lg px-4 text-xs font-medium hover:bg-muted/40 disabled:opacity-40">닫기</button>
      </footer>
    </WorkspaceDialog>
  );
}

function PhraseEditor({ value, onChange, onCancel, onSave, busy }: { value: string; onChange: (value: string) => void; onCancel: () => void; onSave: () => void; busy: boolean }) {
  return (
    <div className="rounded-lg border border-primary/35 bg-primary/[0.04] p-2.5">
      <input
        autoFocus
        aria-label="근거 문구"
        value={value}
        maxLength={200}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSave();
          if (event.key === "Escape") onCancel();
        }}
        placeholder="예: 거래량 증가 확인"
        className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-xs outline-none focus:border-primary/60"
      />
      <div className="mt-2 flex justify-end gap-1">
        <button type="button" disabled={busy} onClick={onCancel} aria-label="편집 취소" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/50"><X className="h-3.5 w-3.5" /></button>
        <button type="button" disabled={busy || !value.trim()} onClick={onSave} aria-label="근거 저장" className="rounded-md bg-primary/15 p-1.5 text-primary disabled:opacity-40"><Check className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}
