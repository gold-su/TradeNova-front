import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, ChevronUp, LogOut, Settings2, UserRound } from "lucide-react";
import { authApi } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { QuickPhraseManagerDialog } from "@/components/training/trade-reason/QuickPhraseManagerDialog";
import { useQuickPhrases } from "@/hooks/useQuickPhrases";
import { useTrainingHistory } from "@/hooks/useTrainingHistory";
import type { TrainingHistorySummaryResponse } from "@/types/training";
import { getSessionAiLabel, getTrainingHistoryViewState, readStoredProfile, summarizeTrainingHistory } from "./myPageState";
import { TrainingHistoryDetailDialog } from "./TrainingHistoryDetailDialog";

export default function MyPageHub() {
  const navigate = useNavigate();
  const [managerOpen, setManagerOpen] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [detailSessionId, setDetailSessionId] = useState<number | null>(null);
  const profile = readStoredProfile(localStorage);
  const phrases = useQuickPhrases();
  const history = useTrainingHistory();
  const historyState = getTrainingHistoryViewState({ loading: history.loading, error: history.error, itemCount: history.items.length });
  const totals = summarizeTrainingHistory(history.items);
  const visibleHistory = historyExpanded ? history.items : history.items.slice(0, 5);

  const openDetail = (sessionId: number) => {
    setDetailSessionId(sessionId);
    void history.loadDetail(sessionId);
  };
  const logout = () => {
    authApi.logoutLocal();
    navigate("/login", { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 lg:py-10">
      <header className="border-b border-border/45 pb-5">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-primary">MY PAGE</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">계정과 훈련 기록</h1>
        <p className="mt-1 text-sm text-muted-foreground">나의 훈련 흐름과 매매 근거를 한곳에서 관리합니다.</p>
      </header>

      <div className="grid gap-4 border-b border-border/45 py-5 md:grid-cols-[minmax(0,1fr)_1.25fr] md:gap-8">
        <section aria-labelledby="profile-heading" className="flex min-w-0 items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2.5 text-primary"><UserRound className="h-5 w-5" /></div>
          <div className="min-w-0"><h2 id="profile-heading" className="truncate text-base font-semibold">{profile.nickname || "사용자"}</h2><p className="truncate text-xs text-muted-foreground">{profile.email || "등록된 이메일 정보가 없습니다."}</p></div>
        </section>
        <section aria-labelledby="summary-heading" className="md:border-l md:border-border/45 md:pl-8">
          <h2 id="summary-heading" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">훈련 요약</h2>
          {history.loading ? <div className="mt-2 h-9 w-full max-w-sm animate-pulse rounded-md bg-muted/25" aria-label="훈련 요약 불러오는 중" /> : history.error ? <p className="mt-2 text-xs text-muted-foreground">요약을 불러오지 못했습니다.</p> : <dl className="mt-2 grid max-w-md grid-cols-3 gap-4"><SummaryMetric label="완료 세션" value={totals.sessions} /><SummaryMetric label="총 거래" value={totals.trades} /><SummaryMetric label="스냅샷" value={totals.snapshots} /></dl>}
        </section>
      </div>

      <main className="py-7">
        <section aria-labelledby="training-heading">
          <div className="flex items-end justify-between gap-4"><div><h2 id="training-heading" className="text-lg font-semibold">최근 훈련</h2><p className="mt-0.5 text-xs text-muted-foreground">완료한 세션과 저장된 AI 리뷰를 확인합니다.</p></div>{historyState === "ready" && <span className="text-xs tabular-nums text-muted-foreground">{history.items.length} sessions</span>}</div>
          <div className="mt-4 overflow-hidden rounded-xl bg-muted/[0.08] ring-1 ring-border/40">
            {historyState === "loading" && <HistoryLoading />}
            {historyState === "error" && <HistoryMessage message="훈련 기록을 불러오지 못했습니다." action={<Button size="sm" variant="outline" onClick={() => void history.load()}>다시 시도</Button>} />}
            {historyState === "empty" && <HistoryMessage message="아직 완료한 훈련이 없습니다." action={<Button asChild size="sm"><Link to="/training">새 훈련 시작</Link></Button>} />}
            {historyState === "ready" && <div className="divide-y divide-border/35">{visibleHistory.map((session) => <HistoryRow key={session.sessionId} session={session} onOpen={() => openDetail(session.sessionId)} />)}</div>}
          </div>
          {historyState === "ready" && history.items.length > 5 && <Button variant="ghost" size="sm" className="mx-auto mt-2 flex text-xs text-muted-foreground" onClick={() => setHistoryExpanded((value) => !value)}>{historyExpanded ? <><ChevronUp className="h-3.5 w-3.5" />최근 5개만 보기</> : <><ChevronDown className="h-3.5 w-3.5" />전체 훈련 기록 보기</>}</Button>}
        </section>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <section aria-labelledby="reason-heading" className="flex items-center justify-between gap-4 rounded-xl bg-muted/[0.08] px-4 py-4 ring-1 ring-border/35">
            <div className="flex min-w-0 items-center gap-3"><Settings2 className="h-4 w-4 shrink-0 text-muted-foreground" /><div className="min-w-0"><h2 id="reason-heading" className="text-sm font-semibold">매매 근거</h2><p className="mt-0.5 text-xs text-muted-foreground">{phrases.quickPhrasesLoading ? "불러오는 중" : phrases.quickPhrasesError ? "목록을 불러오지 못했습니다." : `${phrases.quickPhrases.length}개 등록됨`}</p></div></div>
            <div className="flex shrink-0 items-center gap-1">{phrases.quickPhrasesError && <Button variant="ghost" size="sm" onClick={() => void phrases.loadQuickPhrases()}>재시도</Button>}<Button variant="outline" size="sm" onClick={() => setManagerOpen(true)} disabled={phrases.quickPhrasesLoading}>관리</Button></div>
          </section>
          <section aria-labelledby="account-heading" className="flex items-center justify-between gap-4 rounded-xl bg-muted/[0.08] px-4 py-4 ring-1 ring-border/35">
            <div className="min-w-0"><h2 id="account-heading" className="text-sm font-semibold">계정</h2><p className="mt-0.5 truncate text-xs text-muted-foreground">프로필 수정 및 보안 설정은 추후 제공됩니다.</p></div>
            <Button variant="ghost" size="sm" onClick={logout}><LogOut className="h-4 w-4" />로그아웃</Button>
          </section>
        </div>
      </main>

      {managerOpen && <QuickPhraseManagerDialog items={phrases.quickPhrases} onClose={() => setManagerOpen(false)} onCreate={phrases.createQuickPhrase} onUpdate={phrases.updateQuickPhrase} onDelete={phrases.deleteQuickPhrase} />}
      {detailSessionId !== null && <TrainingHistoryDetailDialog detail={history.detail} loading={history.detailLoading} error={history.detailError} onRetry={() => void history.loadDetail(detailSessionId)} onClose={() => setDetailSessionId(null)} />}
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: number }) { return <div><dd className="text-lg font-semibold tabular-nums">{value}</dd><dt className="text-[11px] text-muted-foreground">{label}</dt></div>; }

function HistoryRow({ session, onOpen }: { session: TrainingHistorySummaryResponse; onOpen: () => void }) {
  const aiLabel = getSessionAiLabel(session);
  return <button type="button" onClick={onOpen} className="group flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50 sm:px-5"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><p className="text-sm font-medium">{formatCompletedAt(session.completedAt)}</p>{aiLabel && <span className="rounded-full bg-primary/[0.08] px-2 py-0.5 text-[10px] font-medium text-primary/85">{aiLabel}</span>}</div><p className="mt-1 text-xs tabular-nums text-muted-foreground">차트 {session.completedChartCount}/{session.totalChartCount} <span className="mx-1 text-border">·</span> 거래 {session.totalTradeCount} <span className="mx-1 text-border">·</span> 스냅샷 {session.snapshotCount}</p></div><span className="hidden text-xs text-muted-foreground group-hover:text-foreground sm:inline">상세 보기</span><ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" /></button>;
}

function HistoryLoading() { return <div aria-label="훈련 기록 불러오는 중" className="divide-y divide-border/30">{[0, 1, 2].map((item) => <div key={item} className="px-5 py-4"><div className="h-4 w-40 animate-pulse rounded bg-muted/35" /><div className="mt-2 h-3 w-56 max-w-full animate-pulse rounded bg-muted/25" /></div>)}</div>; }
function HistoryMessage({ message, action }: { message: string; action: ReactNode }) { return <div className="px-4 py-10 text-center"><p className="text-sm text-muted-foreground">{message}</p><div className="mt-4">{action}</div></div>; }
function formatCompletedAt(value: string | null) { return value ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "완료 시각 없음"; }
