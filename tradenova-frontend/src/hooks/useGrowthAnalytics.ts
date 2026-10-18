import { useCallback, useEffect, useState } from "react";
import { trainingApi } from "@/api/trainingApi";
import type { GrowthOverviewResponse, GrowthPeriod } from "@/types/training";
import { isNestedGrowthResponse, normalizeGrowthOverview } from "@/pages/growth/growthView";

export function useGrowthAnalytics(period: GrowthPeriod) {
  const [data, setData] = useState<GrowthOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const selected = await trainingApi.getGrowthAnalytics(period);
      if (isNestedGrowthResponse(selected)) {
        setData(selected);
      } else {
        const lifetime = period === "ALL" ? selected : await trainingApi.getGrowthAnalytics("ALL");
        if (isNestedGrowthResponse(lifetime)) throw new Error("Growth API returned mixed contracts");
        setData(normalizeGrowthOverview(selected, lifetime));
      }
    }
    catch { setError(true); }
    finally { setLoading(false); }
  }, [period]);
  useEffect(() => { void load(); }, [load]);
  return { data, loading, error, load };
}
