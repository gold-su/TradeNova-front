import type { TradeForm } from "./training.types";

export type TrainingOrderMode = "BUY" | "SELL" | null;

export function transitionOrderMode(
  current: TrainingOrderMode,
  event: "OPEN_BUY" | "OPEN_SELL" | "CANCEL" | "TRADE_SUCCEEDED",
): TrainingOrderMode {
  if (event === "OPEN_BUY") return "BUY";
  if (event === "OPEN_SELL") return "SELL";
  if (event === "CANCEL" || event === "TRADE_SUCCEEDED") return null;
  return current;
}

/** Keep the visible editor in the existing reasons array, including unsaved typing. */
export function updateActionReason(
  form: TradeForm,
  content: string,
): TradeForm {
  const previous = form.reasons?.find((reason) => reason.id === "action-input");
  const others = (form.reasons ?? []).filter(
    (reason) => reason.id !== "action-input",
  );
  return {
    ...form,
    reasons: content.trim()
      ? [
          ...others,
          {
            id: "action-input",
            title: content.trim().split("\n")[0].slice(0, 40),
            entryReason: content,
            riskNote: previous?.riskNote ?? "",
            createdAt: previous?.createdAt ?? new Date().toISOString(),
          },
        ]
      : others,
  };
}
