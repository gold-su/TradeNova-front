import type { GrowthTrendPointResponse } from "@/types/training";

export function getLevelProgress(currentLevelXp: number, nextLevelXp: number) {
  const requirement = currentLevelXp + nextLevelXp;
  return { current: currentLevelXp, requirement, remaining: nextLevelXp };
}

export function formatProcessScore(score: number | null) {
  if (score === null) return "—";
  const value = Number.isInteger(score) ? String(score) : score.toFixed(1);
  return `${value}점`;
}

export function formatTrendTooltip(point: GrowthTrendPointResponse) {
  const date = point.completedAt ? new Date(point.completedAt) : null;
  const dateLabel = date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(date)
    : "완료 날짜 없음";
  return `${dateLabel}\nProcess Review ${formatProcessScore(point.score)}`;
}
