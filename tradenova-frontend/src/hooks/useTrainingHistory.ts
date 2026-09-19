import { useCallback, useEffect, useState } from "react";
import { trainingApi } from "@/api/trainingApi";
import type { TrainingHistoryDetailResponse, TrainingHistorySummaryResponse } from "@/types/training";

export function useTrainingHistory() {
  const [items, setItems] = useState<TrainingHistorySummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [detail, setDetail] = useState<TrainingHistoryDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setItems(await trainingApi.getTrainingHistory());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const loadDetail = useCallback(async (sessionId: number) => {
    setDetail(null);
    setDetailLoading(true);
    setDetailError(false);
    try {
      setDetail(await trainingApi.getTrainingHistoryDetail(sessionId));
    } catch {
      setDetailError(true);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  return { items, loading, error, load, detail, detailLoading, detailError, loadDetail };
}
