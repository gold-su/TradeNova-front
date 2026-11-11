export type CandleDateDisplayMode = "ACTUAL" | "HIDDEN";

export function formatCandleTooltipDate(
  timestamp: number,
  locale: string,
  mode: CandleDateDisplayMode,
  index?: number,
) {
  if (mode === "HIDDEN") return typeof index === "number" ? `#${index + 1}` : "";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(new Date(timestamp));
}

export function formatCandleAxisDate(
  timestamp: number,
  locale: string,
  mode: CandleDateDisplayMode,
  index?: number,
) {
  if (mode === "HIDDEN") return typeof index === "number" ? `#${index + 1}` : "";

  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  if (month === 1) return String(year);
  return locale === "ko-KR"
    ? `${month}월`
    : new Intl.DateTimeFormat(locale, { month: "short" }).format(date);
}
