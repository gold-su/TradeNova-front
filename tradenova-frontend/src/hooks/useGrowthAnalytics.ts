import { useCallback, useEffect, useState } from "react";
import { trainingApi } from "@/api/trainingApi";
import type { GrowthOverviewResponse, GrowthPeriod } from "@/types/training";

export function useGrowthAnalytics(period: GrowthPeriod) {
  const [data, setData] = useState<GrowthOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try { setData(await trainingApi.getGrowthAnalytics(period)); }
    catch { setError(true); }
    finally { setLoading(false); }
  }, [period]);
  useEffect(() => { void load(); }, [load]);
  return { data, loading, error, load };
}
