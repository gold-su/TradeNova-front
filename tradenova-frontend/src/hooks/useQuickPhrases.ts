import { useCallback, useEffect, useState } from "react";
import { reportApi } from "@/api/reportApi";
import type { QuickPhraseResponse } from "@/types/training";

export function useQuickPhrases() {
  const [quickPhrases, setQuickPhrases] = useState<QuickPhraseResponse[]>([]);
  const [quickPhrasesLoading, setQuickPhrasesLoading] = useState(true);
  const [quickPhrasesError, setQuickPhrasesError] = useState<string | null>(null);

  const loadQuickPhrases = useCallback(async () => {
    setQuickPhrasesLoading(true);
    setQuickPhrasesError(null);
    try {
      setQuickPhrases(await reportApi.getQuickPhrases());
    } catch (error) {
      console.error("quick phrase load failed", error);
      setQuickPhrasesError("매매 근거를 불러오지 못했습니다.");
    } finally {
      setQuickPhrasesLoading(false);
    }
  }, []);

  const createQuickPhrase = async (content: string) => {
    const trimmed = content.trim();
    const created = await reportApi.createQuickPhrase({ title: trimmed, content: trimmed });
    setQuickPhrases((prev) => [...prev, created]);
    return created;
  };

  const updateQuickPhrase = async (id: number, content: string) => {
    const trimmed = content.trim();
    const current = quickPhrases.find((phrase) => phrase.id === id);
    const updated = await reportApi.updateQuickPhrase(id, {
      title: current?.title || trimmed,
      content: trimmed,
    });
    setQuickPhrases((prev) => prev.map((phrase) => (phrase.id === id ? updated : phrase)));
    return updated;
  };

  const deleteQuickPhrase = async (id: number) => {
    await reportApi.deleteQuickPhrase(id);
    setQuickPhrases((prev) => prev.filter((phrase) => phrase.id !== id));
  };

  useEffect(() => {
    void loadQuickPhrases();
  }, [loadQuickPhrases]);

  return {
    quickPhrases,
    quickPhrasesLoading,
    quickPhrasesError,
    loadQuickPhrases,
    createQuickPhrase,
    updateQuickPhrase,
    deleteQuickPhrase,
  };
}
