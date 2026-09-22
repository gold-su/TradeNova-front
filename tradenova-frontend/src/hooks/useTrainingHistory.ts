import { useCallback, useEffect, useState } from "react";
import { trainingApi } from "@/api/trainingApi";
import type { TrainingHistoryDetailResponse, TrainingHistorySummaryResponse } from "@/types/training";

export function useTrainingHistory() {
  const [items, setItems] = useState<TrainingHistorySummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  return { items, loading, error, load };
}

export function useTrainingHistoryDetail(sessionId: number | null) {
  const [detail, setDetail] = useState<TrainingHistoryDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setDetail(null);
    setLoading(true);
    setError(false);
    if (sessionId === null) {
      setError(true);
      setLoading(false);
      return;
    }
    try {
      setDetail(await trainingApi.getTrainingHistoryDetail(sessionId));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { void load(); }, [load]);

  return { detail, loading, error, load };
}
