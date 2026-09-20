import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrainingHistory } from "@/hooks/useTrainingHistory";
import type { TrainingHistorySummaryResponse } from "@/types/training";
import { TrainingHistoryDetailDialog } from "./TrainingHistoryDetailDialog";
import { filterAndSortHistory, formatHistoryDate, groupHistoryByMonth, type AiReviewFilter, type HistorySort, type TradeFilter } from "./trainingHistoryBrowser";

export default function TrainingHistoryPage() {
  const history = useTrainingHistory();
  const [sort, setSort] = useState<HistorySort>("LATEST");
  const [aiFilter, setAiFilter] = useState<AiReviewFilter>("ALL");
  const [tradeFilter, setTradeFilter] = useState<TradeFilter>("ALL");
  const [detailSessionId, setDetailSessionId] = useState<number | null>(null);
  const filtered = useMemo(() => filterAndSortHistory(history.items, sort, aiFilter, tradeFilter), [history.items, sort, aiFilter, tradeFilter]);
  const groups = useMemo(() => groupHistoryByMonth(filtered), [filtered]);
  const openDetail = (sessionId: number) => { setDetailSessionId(sessionId); void history.loadDetail(sessionId); };
  const resetFilters = () => { setAiFilter("ALL"); setTradeFilter("ALL"); };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 lg:py-10">
      <header><Link to="/mypage" className="text-xs text-muted-foreground hover:text-foreground">마이페이지</Link><h1 className="mt-2 text-2xl font-semibold tracking-tight">훈련 기록</h1><p className="mt-1 text-sm text-muted-foreground">완료한 훈련과 당시 저장된 AI 피드백을 다시 확인합니다.</p></header>
      <div className="mt-6 flex flex-wrap gap-2 border-y border-border/45 py-3">
        <HistorySelect label="정렬" value={sort} onChange={(value) => setSort(value as HistorySort)} options={[["LATEST", "최신순"], ["OLDEST", "오래된순"], ["SCORE_HIGH", "AI 점수 높은순"], ["SCORE_LOW", "AI 점수 낮은순"], ["TRADES_HIGH", "거래 많은순"], ["TRADES_LOW", "거래 적은순"]]} />
        <HistorySelect label="AI 리뷰" value={aiFilter} onChange={(value) => setAiFilter(value as AiReviewFilter)} options={[["ALL", "전체"], ["WITH_REVIEW", "AI 리뷰 있음"], ["WITHOUT_REVIEW", "AI 리뷰 없음"]]} />
        <HistorySelect label="거래 여부" value={tradeFilter} onChange={(value) => setTradeFilter(value as TradeFilter)} options={[["ALL", "전체"], ["WITH_TRADES", "거래 있음"], ["WITHOUT_TRADES", "무거래"]]} />
      </div>

      {history.loading && <HistorySkeleton />}
      {history.error && <Message text="훈련 기록을 불러오지 못했습니다." action={<Button variant="outline" size="sm" onClick={() => void history.load()}>다시 시도</Button>} />}
      {!history.loading && !history.error && history.items.length === 0 && <Message text="아직 완료한 훈련이 없습니다." action={<Button asChild size="sm"><Link to="/training">새 훈련 시작</Link></Button>} />}
      {!history.loading && !history.error && history.items.length > 0 && filtered.length === 0 && <Message text="조건에 맞는 훈련 기록이 없습니다." action={<Button variant="outline" size="sm" onClick={resetFilters}>필터 초기화</Button>} />}
      {!history.loading && !history.error && groups.length > 0 && <div className="mt-7 space-y-8">{groups.map((group) => <section key={group.label}><h2 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground">{group.label}</h2><div className="divide-y divide-border/35 border-y border-border/45">{group.sessions.map((session) => <HistoryRow key={session.sessionId} session={session} onOpen={() => openDetail(session.sessionId)} />)}</div></section>)}</div>}

      {detailSessionId !== null && <TrainingHistoryDetailDialog detail={history.detail} loading={history.detailLoading} error={history.detailError} onRetry={() => void history.loadDetail(detailSessionId)} onClose={() => setDetailSessionId(null)} />}
    </div>
  );
}

function HistorySelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return <label className="flex items-center gap-2 rounded-lg bg-muted/15 px-2.5 py-1.5 text-xs text-muted-foreground"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="bg-transparent font-medium text-foreground outline-none">{options.map(([optionValue, text]) => <option key={optionValue} value={optionValue} className="bg-background">{text}</option>)}</select></label>;
}

function HistoryRow({ session, onOpen }: { session: TrainingHistorySummaryResponse; onOpen: () => void }) {
  return <button type="button" onClick={onOpen} className="group flex w-full items-center gap-3 px-2 py-3.5 text-left hover:bg-muted/15 sm:px-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium">{formatHistoryDate(session.completedAt)}</p>{session.hasSessionAiReview && <span className="rounded-full bg-primary/[0.08] px-2 py-0.5 text-[10px] text-primary/85">{session.sessionAiScore === null ? "AI Review" : `AI Review ${session.sessionAiScore}`}</span>}</div><p className="mt-1 text-xs tabular-nums text-muted-foreground">차트 {session.completedChartCount}/{session.totalChartCount} · 거래 {session.totalTradeCount} · 스냅샷 {session.snapshotCount}</p></div><span className="hidden text-xs text-muted-foreground group-hover:text-foreground sm:inline">상세 보기</span><ChevronRight className="h-4 w-4 text-muted-foreground/60" /></button>;
}

function HistorySkeleton() { return <div className="mt-7 space-y-3" aria-label="훈련 기록 불러오는 중">{[0, 1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-muted/20" />)}</div>; }
function Message({ text, action }: { text: string; action: React.ReactNode }) { return <div className="py-16 text-center"><p className="text-sm text-muted-foreground">{text}</p><div className="mt-4">{action}</div></div>; }
