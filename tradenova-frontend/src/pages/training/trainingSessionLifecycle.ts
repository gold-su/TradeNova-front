type FinishTrainingParams<TFinished, TSummary> = {
  finishSession: () => Promise<TFinished | null>;
  loadSummary: () => Promise<TSummary | null>;
  openCompletion: () => void;
};

export async function analyzeSessionAi(
  analyze: () => Promise<void>,
): Promise<void> {
  await analyze();
}

export async function finishTrainingAndOpenCompletion<TFinished, TSummary>({
  finishSession,
  loadSummary,
  openCompletion,
}: FinishTrainingParams<TFinished, TSummary>): Promise<boolean> {
  const finished = await finishSession();
  if (!finished) return false;

  const summary = await loadSummary();
  if (!summary) return false;

  openCompletion();
  return true;
}
