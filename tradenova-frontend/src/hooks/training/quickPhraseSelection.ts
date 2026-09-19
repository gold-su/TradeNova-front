import type { TradeForm, TradeReasonItem } from "./training.types";
import type { QuickPhraseResponse } from "@/types/training";

const QUICK_PHRASE_PREFIX = "quick-phrase-";

export function quickPhraseReasonId(id: number) {
  return `${QUICK_PHRASE_PREFIX}${id}`;
}

export function isQuickPhraseSelected(form: TradeForm, id: number) {
  return (form.reasons ?? []).some(
    (reason) => reason.id === quickPhraseReasonId(id),
  );
}

export function selectedQuickPhraseIds(form: TradeForm) {
  return new Set(
    (form.reasons ?? [])
      .map((reason) =>
        reason.id.startsWith(QUICK_PHRASE_PREFIX)
          ? Number(reason.id.slice(QUICK_PHRASE_PREFIX.length))
          : null,
      )
      .filter((id): id is number => id != null && Number.isInteger(id)),
  );
}

function toReason(
  phrase: QuickPhraseResponse,
  previous?: TradeReasonItem,
): TradeReasonItem {
  return {
    id: quickPhraseReasonId(phrase.id),
    title: phrase.title || phrase.content,
    entryReason: phrase.content,
    riskNote: previous?.riskNote ?? "",
    createdAt: previous?.createdAt ?? new Date().toISOString(),
  };
}

export function toggleQuickPhraseReason(
  form: TradeForm,
  phrase: QuickPhraseResponse,
): TradeForm {
  const id = quickPhraseReasonId(phrase.id);
  const selected = (form.reasons ?? []).some((reason) => reason.id === id);
  return {
    ...form,
    reasons: selected
      ? (form.reasons ?? []).filter((reason) => reason.id !== id)
      : [...(form.reasons ?? []), toReason(phrase)],
  };
}

export function syncQuickPhraseReason(
  form: TradeForm,
  phrase: QuickPhraseResponse,
): TradeForm {
  const id = quickPhraseReasonId(phrase.id);
  return {
    ...form,
    reasons: (form.reasons ?? []).map((reason) =>
      reason.id === id ? toReason(phrase, reason) : reason,
    ),
  };
}

export function removeQuickPhraseReason(form: TradeForm, phraseId: number) {
  const id = quickPhraseReasonId(phraseId);
  return {
    ...form,
    reasons: (form.reasons ?? []).filter((reason) => reason.id !== id),
  };
}
