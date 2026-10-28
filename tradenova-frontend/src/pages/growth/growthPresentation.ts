import type { GrowthTrendPointResponse } from "@/types/training";

export function getLevelProgress(currentLevelXp: number, nextLevelXp: number) {
  const requirement = currentLevelXp + nextLevelXp;
  return { current: currentLevelXp, requirement, remaining: nextLevelXp };
}

export function formatProcessScore(score: number | null, suffix = "점") {
  if (score === null) return "—";
  const value = Number.isInteger(score) ? String(score) : score.toFixed(1);
  return `${value}${suffix}`;
}

export function formatTrendTooltip(point: GrowthTrendPointResponse, locale = "ko-KR", noDate = "완료 날짜 없음", scoreSuffix = "점") {
  const date = point.completedAt ? new Date(point.completedAt) : null;
  const dateLabel = date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date)
    : noDate;
  return `${dateLabel}\nProcess Review ${formatProcessScore(point.score, scoreSuffix)}`;
}
