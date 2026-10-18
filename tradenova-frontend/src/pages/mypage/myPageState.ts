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
  return sessionAiScore === null ? "AI 리뷰" : `AI 리뷰 · ${sessionAiScore}점`;
}

export function summarizeTrainingHistory(
  items: Array<{
    totalTradeCount: number;
    hasSessionAiReview: boolean;
  }>,
) {
  return items.reduce(
    (summary, item) => ({
      completedSessions: summary.completedSessions + 1,
      totalTrades: summary.totalTrades + item.totalTradeCount,
      reviewedSessions: summary.reviewedSessions + (item.hasSessionAiReview ? 1 : 0),
    }),
    { completedSessions: 0, totalTrades: 0, reviewedSessions: 0 },
  );
}
