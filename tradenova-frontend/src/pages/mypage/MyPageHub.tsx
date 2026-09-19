import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, ChevronDown, ChevronUp, LogOut, Settings2, UserRound } from "lucide-react";
import { authApi } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { QuickPhraseManagerDialog } from "@/components/training/trade-reason/QuickPhraseManagerDialog";
import { useQuickPhrases } from "@/hooks/useQuickPhrases";
import { useTrainingHistory } from "@/hooks/useTrainingHistory";
import type { TrainingHistorySummaryResponse } from "@/types/training";
import { getSessionAiLabel, getTrainingHistoryViewState, readStoredProfile } from "./myPageState";
import { TrainingHistoryDetailDialog } from "./TrainingHistoryDetailDialog";

export default function MyPageHub() {
  const navigate = useNavigate();
  const [managerOpen, setManagerOpen] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [detailSessionId, setDetailSessionId] = useState<number | null>(null);
  const profile = readStoredProfile(localStorage);
  const {
    quickPhrases,
    quickPhrasesLoading,
    quickPhrasesError,
    loadQuickPhrases,
    createQuickPhrase,
    updateQuickPhrase,
    deleteQuickPhrase,
  } = useQuickPhrases();
  const history = useTrainingHistory();
  const historyState = getTrainingHistoryViewState({ loading: history.loading, error: history.error, itemCount: history.items.length });
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
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-6 sm:px-6 lg:py-8">
      <header>
        <p className="text-xs font-semibold tracking-[0.18em] text-primary">MY PAGE</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">계정과 훈련 허브</h1>
        <p className="mt-1 text-sm text-muted-foreground">계정 정보와 훈련 설정을 관리하고, 기록을 확인합니다.</p>
      </header>

      <section aria-labelledby="profile-heading" className="rounded-xl border border-border/55 bg-muted/[0.08] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary"><UserRound className="h-4 w-4" /></div>
          <div className="min-w-0 flex-1">
            <h2 id="profile-heading" className="text-sm font-semibold">프로필</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">현재 로그인 계정</p>
          </div>
          <span className="rounded-full border border-border/50 px-2 py-1 text-[10px] text-muted-foreground">READ ONLY</span>
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-muted-foreground">닉네임</dt><dd className="mt-1 font-medium">{profile.nickname || "등록 정보 없음"}</dd></div>
          <div><dt className="text-xs text-muted-foreground">이메일</dt><dd className="mt-1 break-all font-medium">{profile.email || "등록 정보 없음"}</dd></div>
        </dl>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <section aria-labelledby="training-heading" className="rounded-xl border border-border/55 bg-muted/[0.08] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary"><BookOpen className="h-4 w-4" /></div>
            <div><h2 id="training-heading" className="text-sm font-semibold">훈련 기록</h2><p className="mt-0.5 text-xs text-muted-foreground">최근 세션과 AI 리뷰</p></div>
          </div>
          <div className="mt-4">
            {historyState === "loading" && <div aria-label="훈련 기록 불러오는 중" className="space-y-2"><div className="h-16 animate-pulse rounded-lg bg-muted/30" /><div className="h-16 animate-pulse rounded-lg bg-muted/30" /></div>}
            {historyState === "error" && <div className="rounded-lg border border-dashed border-border/50 px-4 py-6 text-center"><p className="text-sm font-medium">훈련 기록을 불러오지 못했습니다.</p><Button size="sm" variant="outline" className="mt-3" onClick={() => void history.load()}>다시 시도</Button></div>}
            {historyState === "empty" && <div className="rounded-lg border border-dashed border-border/50 px-4 py-6 text-center"><p className="text-sm font-medium">아직 완료한 훈련이 없습니다.</p><Button asChild size="sm" className="mt-4"><Link to="/training">새 훈련 시작</Link></Button></div>}
            {historyState === "ready" && <>
              <div className="divide-y divide-border/40 border-y border-border/40">
                {visibleHistory.map((session) => <HistoryRow key={session.sessionId} session={session} onOpen={() => openDetail(session.sessionId)} />)}
              </div>
              {history.items.length > 5 && <Button variant="ghost" size="sm" className="mt-2 w-full text-xs" onClick={() => setHistoryExpanded((value) => !value)}>{historyExpanded ? <><ChevronUp className="h-3.5 w-3.5" />접기</> : <><ChevronDown className="h-3.5 w-3.5" />전체 훈련 기록 보기</>}</Button>}
            </>}
          </div>
        </section>

        <section aria-labelledby="reason-heading" className="rounded-xl border border-border/55 bg-muted/[0.08] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary"><Settings2 className="h-4 w-4" /></div>
            <div><h2 id="reason-heading" className="text-sm font-semibold">매매 근거 관리</h2><p className="mt-0.5 text-xs leading-5 text-muted-foreground">BUY/SELL 시 빠르게 선택할 수 있는 매매 근거를 관리합니다.</p></div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">{quickPhrasesLoading ? "불러오는 중" : quickPhrasesError ? "불러오기 실패" : `${quickPhrases.length}개 등록됨`}</span>
            <Button variant="outline" size="sm" onClick={() => setManagerOpen(true)} disabled={quickPhrasesLoading}>근거 관리</Button>
          </div>
          {quickPhrasesError && <button type="button" onClick={() => void loadQuickPhrases()} className="mt-3 text-xs font-medium text-primary hover:underline">다시 시도</button>}
        </section>
      </div>

      <section aria-labelledby="account-heading" className="rounded-xl border border-border/55 bg-muted/[0.08] p-4 sm:p-5">
        <h2 id="account-heading" className="text-sm font-semibold">계정 설정</h2>
        <div className="mt-4 divide-y divide-border/40 border-y border-border/40">
          <SettingRow title="프로필 수정" description="서버 API가 준비되면 사용할 수 있습니다." />
          <SettingRow title="비밀번호 변경" description="서버 API가 준비되면 사용할 수 있습니다." />
          <SettingRow title="회원탈퇴" description="서버 API가 준비되면 확인 절차와 함께 제공됩니다." danger />
        </div>
        <Button variant="outline" size="sm" onClick={logout} className="mt-4"><LogOut className="h-4 w-4" />로그아웃</Button>
      </section>

      {managerOpen && <QuickPhraseManagerDialog items={quickPhrases} onClose={() => setManagerOpen(false)} onCreate={createQuickPhrase} onUpdate={updateQuickPhrase} onDelete={deleteQuickPhrase} />}
      {detailSessionId !== null && <TrainingHistoryDetailDialog detail={history.detail} loading={history.detailLoading} error={history.detailError} onRetry={() => void history.loadDetail(detailSessionId)} onClose={() => setDetailSessionId(null)} />}
    </div>
  );
}

function HistoryRow({ session, onOpen }: { session: TrainingHistorySummaryResponse; onOpen: () => void }) {
  const aiLabel = getSessionAiLabel(session);
  const completedAt = session.completedAt ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(session.completedAt)) : "완료 시각 없음";
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium">{completedAt}</p>{aiLabel && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{aiLabel}</span>}</div>
        <p className="mt-1 text-xs text-muted-foreground">차트 {session.completedChartCount}/{session.totalChartCount} · 거래 {session.totalTradeCount} · 스냅샷 {session.snapshotCount}</p>
      </div>
      <Button size="sm" variant="ghost" className="shrink-0 text-xs" onClick={onOpen}>상세 보기</Button>
    </div>
  );
}

function SettingRow({ title, description, danger = false }: { title: string; description: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div><p className={danger ? "text-sm font-medium text-red-300" : "text-sm font-medium"}>{title}</p><p className="mt-0.5 text-xs text-muted-foreground">{description}</p></div>
      <span className="shrink-0 rounded-full bg-muted/30 px-2 py-1 text-[10px] text-muted-foreground">준비 중</span>
    </div>
  );
}
