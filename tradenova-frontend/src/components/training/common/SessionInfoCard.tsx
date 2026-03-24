import type { TrainingStatus } from "@/types/training";

type Props = {
  sessionId: number | null;
  status: TrainingStatus;
};

export function SessionInfoCard({ sessionId, status }: Props) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
      <div className="text-xs text-muted-foreground">Session</div>
      <div className="mt-1 text-lg font-semibold">
        {sessionId ? `#${sessionId}` : "아직 없음"}
      </div>

      <div className="mt-3 inline-flex rounded-full border border-border/60 px-3 py-1 text-xs">
        {status}
      </div>
    </div>
  );
}
