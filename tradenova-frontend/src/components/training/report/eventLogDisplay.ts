export type EventLogBodyMode = "loading" | "empty" | "content";

export function getEventLogBodyMode(
  loading: boolean,
  visibleItemCount: number,
): EventLogBodyMode {
  if (visibleItemCount > 0) return "content";
  return loading ? "loading" : "empty";
}
