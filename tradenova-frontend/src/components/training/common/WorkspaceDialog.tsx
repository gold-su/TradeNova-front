import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/** Native modal semantics provide focus trapping, Escape and focus restoration. */
export function WorkspaceDialog({
  title,
  description,
  onClose,
  busy = false,
  wide = false,
  children,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  busy?: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const trigger = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      trigger?.focus();
    };
  }, []);
  return createPortal(
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
      className={`m-auto max-h-[90dvh] w-[calc(100%-32px)] overflow-visible rounded-2xl border border-white/10 bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/35 ${wide ? "h-[min(750px,88dvh)] max-h-[88dvh] max-w-[700px]" : "max-w-[460px]"}`}
    >
      <div
        className={`flex max-h-[90dvh] flex-col overflow-hidden rounded-2xl ${wide ? "h-full" : ""}`}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 px-5 pb-3 pt-5">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="닫기"
            disabled={busy}
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/50 disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        {children}
      </div>
    </dialog>,
    document.body,
  );
}
