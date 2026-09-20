import type { GrowthOverviewResponse } from "@/types/training";

export function splitGrowthOverview(data: GrowthOverviewResponse) {
  return { lifetime: data.lifetime, period: data.period };
}
