import { useCallback, useEffect, useState } from "react";
import { reportApi } from "@/api/reportApi";
import type { QuickPhraseResponse } from "@/types/training";
import { useI18n } from "@/i18n/LanguageProvider";

export function useQuickPhrases() {
  const { t } = useI18n();
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
      setQuickPhrasesError(t("training.reasonManager.loadFailed"));
    } finally {
      setQuickPhrasesLoading(false);
    }
  }, [t]);

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
