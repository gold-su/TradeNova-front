export type StoredProfile = {
  email: string | null;
  nickname: string | null;
};

export function readStoredProfile(storage: Pick<Storage, "getItem">): StoredProfile {
  return {
    email: storage.getItem("userEmail"),
    nickname: storage.getItem("userNickname"),
  };
}

export const accountFeatureAvailability = {
  profileEdit: false,
  passwordChange: false,
  accountDeletion: false,
} as const;

export type TrainingHistoryViewState = "loading" | "error" | "empty" | "ready";

export function getTrainingHistoryViewState({
  loading,
  error,
  itemCount,
}: {
  loading: boolean;
  error: boolean;
  itemCount: number;
}): TrainingHistoryViewState {
  if (loading) return "loading";
  if (error) return "error";
  if (itemCount === 0) return "empty";
  return "ready";
}

export function getSessionAiLabel({
  hasSessionAiReview,
  sessionAiScore,
}: {
  hasSessionAiReview: boolean;
  sessionAiScore: number | null;
}) {
  if (!hasSessionAiReview) return null;
  return sessionAiScore === null ? "AI Review" : `AI Review ${sessionAiScore}`;
}

export type TrainingHistoryTotals = {
  sessions: number;
  trades: number;
  snapshots: number;
};

export function summarizeTrainingHistory(
  items: Array<{ totalTradeCount: number; snapshotCount: number }>,
): TrainingHistoryTotals {
  return items.reduce(
    (totals, item) => ({
      sessions: totals.sessions + 1,
      trades: totals.trades + item.totalTradeCount,
      snapshots: totals.snapshots + item.snapshotCount,
    }),
    { sessions: 0, trades: 0, snapshots: 0 },
  );
}
