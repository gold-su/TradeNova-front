import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, LogOut, Settings2, UserRound, WalletCards } from "lucide-react";
import { authApi } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { QuickPhraseManagerDialog } from "@/components/training/trade-reason/QuickPhraseManagerDialog";
import { usePaperAccounts } from "@/hooks/usePaperAccounts";
import { useQuickPhrases } from "@/hooks/useQuickPhrases";
import { useTrainingHistory } from "@/hooks/useTrainingHistory";
import type { TrainingHistorySummaryResponse } from "@/types/training";
import { cashDelta, formatWon, selectPrimaryAccount } from "./accountPerformance";
import { getSessionAiLabel, getTrainingHistoryViewState, readStoredProfile } from "./myPageState";
import { TrainingHistoryDetailDialog } from "./TrainingHistoryDetailDialog";

export default function MyPageHub() {
  const navigate = useNavigate();
  const [managerOpen, setManagerOpen] = useState(false);
  const [detailSessionId, setDetailSessionId] = useState<number | null>(null);
  const profile = readStoredProfile(localStorage);
  const phrases = useQuickPhrases();
  const history = useTrainingHistory();
  const paperAccounts = usePaperAccounts();
  const primaryAccount = selectPrimaryAccount(paperAccounts.accounts);
  const historyState = getTrainingHistoryViewState({ loading: history.loading, error: history.error, itemCount: history.items.length });

  const openDetail = (sessionId: number) => { setDetailSessionId(sessionId); void history.loadDetail(sessionId); };
  const logout = () => { authApi.logoutLocal(); navigate("/login", { replace: true }); };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
      <header className="flex flex-col justify-between gap-4 border-b border-border/40 pb-5 sm:flex-row sm:items-end">
        <div><p className="text-[11px] font-semibold tracking-[0.2em] text-primary">MY PAGE</p><h1 className="mt-1.5 text-2xl font-semibold tracking-tight">훈련 계정과 기록</h1><p className="mt-1 text-sm text-muted-foreground">계좌 상태와 완료한 훈련을 한곳에서 확인합니다.</p></div>
        <div className="flex min-w-0 items-center gap-2 text-right sm:max-w-xs"><UserRound className="h-4 w-4 shrink-0 text-muted-foreground" /><div className="min-w-0"><p className="truncate text-sm font-medium">{profile.nickname || "사용자"}</p><p className="truncate text-xs text-muted-foreground">{profile.email || "등록된 이메일 없음"}</p></div></div>
      </header>

      <section aria-labelledby="training-account-heading" className="mt-6 rounded-2xl bg-muted/[0.1] p-5 ring-1 ring-border/40 sm:p-6">
        <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><WalletCards className="h-4 w-4 text-primary" /><h2 id="training-account-heading" className="text-sm font-semibold">TRAINING ACCOUNT</h2></div><p className="mt-1 text-xs text-muted-foreground">보유 포지션 평가액을 제외한 실제 계좌 현금 정보입니다.</p></div><Button asChild variant="outline" size="sm"><Link to="/mypage/accounts">계좌 관리<ChevronRight className="h-3.5 w-3.5" /></Link></Button></div>
        {paperAccounts.loading && <div className="mt-5 h-16 animate-pulse rounded-lg bg-muted/25" aria-label="계좌 정보 불러오는 중" />}
        {paperAccounts.error && <div className="mt-5 flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">계좌 정보를 불러오지 못했습니다.</p><Button variant="ghost" size="sm" onClick={() => void paperAccounts.load()}>다시 시도</Button></div>}
        {!paperAccounts.loading && !paperAccounts.error && !primaryAccount && <div className="mt-5 flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">등록된 훈련 계좌가 없습니다.</p><Button asChild size="sm"><Link to="/mypage/accounts">계좌 만들기</Link></Button></div>}
        {primaryAccount && <><div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1"><h3 className="text-lg font-semibold">{primaryAccount.name}</h3>{primaryAccount.isDefault && <span className="text-[10px] font-medium text-primary">기본 계좌</span>}</div><dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4"><Metric label="사용 가능 현금" value={formatWon(primaryAccount.cashBalance)} /><Metric label="초기 자본" value={formatWon(primaryAccount.initialBalance)} /><Metric label="현금 증감" value={formatWon(cashDelta(primaryAccount), true)} tone={cashDelta(primaryAccount)} /><Metric label="완료 훈련" value={`${history.items.length}회`} /></dl></>}
      </section>

      <section aria-labelledby="recent-training-heading" className="mt-8">
        <div className="flex items-end justify-between gap-4"><div><h2 id="recent-training-heading" className="text-base font-semibold">최근 훈련</h2><p className="mt-1 text-xs text-muted-foreground">최근 완료한 5개 세션입니다.</p></div>{history.items.length > 5 && <span className="text-xs text-muted-foreground">총 {history.items.length}회</span>}</div>
        <div className="mt-3 divide-y divide-border/35 border-y border-border/45">
          {historyState === "loading" && [0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse bg-muted/15" />)}
          {historyState === "error" && <StateMessage text="훈련 기록을 불러오지 못했습니다." action={<Button size="sm" variant="ghost" onClick={() => void history.load()}>다시 시도</Button>} />}
          {historyState === "empty" && <StateMessage text="아직 완료한 훈련이 없습니다." action={<Button asChild size="sm"><Link to="/training">새 훈련 시작</Link></Button>} />}
          {historyState === "ready" && history.items.slice(0, 5).map((session) => <HistoryRow key={session.sessionId} session={session} onOpen={() => openDetail(session.sessionId)} />)}
        </div>
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section className="flex items-center justify-between gap-4 rounded-xl bg-muted/[0.08] px-4 py-4 ring-1 ring-border/35"><div className="flex min-w-0 items-center gap-3"><Settings2 className="h-4 w-4 text-muted-foreground" /><div><h2 className="text-sm font-semibold">매매 근거</h2><p className="text-xs text-muted-foreground">{phrases.quickPhrasesLoading ? "불러오는 중" : phrases.quickPhrasesError ? "불러오기 실패" : `${phrases.quickPhrases.length}개 등록됨`}</p></div></div><Button variant="outline" size="sm" onClick={() => setManagerOpen(true)} disabled={phrases.quickPhrasesLoading}>관리</Button></section>
        <section className="flex items-center justify-between gap-4 rounded-xl bg-muted/[0.08] px-4 py-4 ring-1 ring-border/35"><div><h2 className="text-sm font-semibold">계정 설정</h2><p className="text-xs text-muted-foreground">프로필 및 보안 설정은 추후 제공</p></div><Button variant="ghost" size="sm" onClick={logout}><LogOut className="h-4 w-4" />로그아웃</Button></section>
      </div>

      {managerOpen && <QuickPhraseManagerDialog items={phrases.quickPhrases} onClose={() => setManagerOpen(false)} onCreate={phrases.createQuickPhrase} onUpdate={phrases.updateQuickPhrase} onDelete={phrases.deleteQuickPhrase} />}
      {detailSessionId !== null && <TrainingHistoryDetailDialog detail={history.detail} loading={history.detailLoading} error={history.detailError} onRetry={() => void history.loadDetail(detailSessionId)} onClose={() => setDetailSessionId(null)} />}
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: number }) { const color = tone === undefined || tone === 0 ? "text-foreground" : tone > 0 ? "text-emerald-400" : "text-red-300"; return <div className="min-w-0"><dt className="text-[11px] text-muted-foreground">{label}</dt><dd className={`mt-1 truncate text-lg font-semibold tabular-nums sm:text-xl ${color}`} title={value}>{value}</dd></div>; }
function HistoryRow({ session, onOpen }: { session: TrainingHistorySummaryResponse; onOpen: () => void }) { const ai = getSessionAiLabel(session); const date = session.completedAt ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(session.completedAt)) : "완료 시각 없음"; return <button type="button" onClick={onOpen} className="group flex w-full items-center gap-3 px-2 py-3.5 text-left hover:bg-muted/15"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium">{date}</p>{ai && <span className="rounded-full bg-primary/[0.08] px-2 py-0.5 text-[10px] text-primary/85">{ai}</span>}</div><p className="mt-1 text-xs text-muted-foreground">거래 {session.totalTradeCount} · 차트 {session.completedChartCount}/{session.totalChartCount}</p></div><span className="hidden text-xs text-muted-foreground group-hover:text-foreground sm:inline">상세 보기</span><ChevronRight className="h-4 w-4 text-muted-foreground/60" /></button>; }
function StateMessage({ text, action }: { text: string; action: React.ReactNode }) { return <div className="py-10 text-center"><p className="text-sm text-muted-foreground">{text}</p><div className="mt-3">{action}</div></div>; }
