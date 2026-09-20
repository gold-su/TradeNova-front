import type { GrowthApiResponse, GrowthOverviewResponse, LegacyGrowthOverviewResponse } from "@/types/training";

export function isNestedGrowthResponse(data: GrowthApiResponse): data is GrowthOverviewResponse {
  return typeof data.period === "object" && data.period !== null && "completedSessions" in data.period
    && "lifetime" in data && typeof data.lifetime === "object" && data.lifetime !== null;
}

export function normalizeGrowthOverview(
  selected: GrowthApiResponse,
  lifetimeSource?: LegacyGrowthOverviewResponse,
): GrowthOverviewResponse {
  if (isNestedGrowthResponse(selected)) return selected;
  const lifetime = lifetimeSource ?? selected;
  return {
    lifetime: {
      totalXp: lifetime.totalXp,
      level: lifetime.level,
      levelTitle: lifetime.levelTitle,
      currentLevelXp: lifetime.currentLevelXp,
      nextLevelXp: lifetime.nextLevelXp,
      progressPercent: lifetime.progressPercent,
    },
    period: {
      key: selected.period,
      limit: selected.period === "LAST_10" ? 10 : selected.period === "LAST_30" ? 30 : null,
      completedSessions: selected.totalCompletedSessions,
      totalTrades: selected.totalTrades,
      planSessionRate: selected.planSessionRate,
      actionReasonRate: selected.actionReasonRate,
      riskRuleSessionRate: selected.riskRuleSessionRate,
      aiReviewSessionRate: selected.aiReviewSessionRate,
      averageSessionAiScore: selected.averageSessionAiScore,
      scoreTrend: selected.scoreTrend,
    },
  };
}

export function splitGrowthOverview(data: GrowthOverviewResponse) {
  return { lifetime: data.lifetime, period: data.period };
}
