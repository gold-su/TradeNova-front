import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, BrainCircuit, ShieldCheck, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGrowthAnalytics } from "@/hooks/useGrowthAnalytics";
import type { GrowthMetricResponse, GrowthPeriod, GrowthTrendPointResponse } from "@/types/training";
import { buildScoreChart, scorePolyline } from "./growthChart";

const PERIOD_LABELS: Record<GrowthPeriod, string> = { LAST_10: "최근 10회", LAST_30: "최근 30회", ALL: "전체" };

export default function GrowthAnalyticsPage() {
  const [period, setPeriod] = useState<GrowthPeriod>("LAST_10");
  const growth = useGrowthAnalytics(period);
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:py-10">
      <header className="flex flex-col gap-4 border-b border-border/45 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-semibold tracking-[0.16em] text-primary">GROWTH</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">성장 분석</h1><p className="mt-1 text-sm text-muted-foreground">수익이 아닌 훈련 과정과 판단 습관의 변화를 확인합니다.</p></div>
        <Select value={period} onValueChange={(value) => setPeriod(value as GrowthPeriod)}><SelectTrigger className="w-full sm:w-36" aria-label="분석 기간"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PERIOD_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
      </header>

      {growth.loading && <GrowthSkeleton />}
      {growth.error && <StateMessage title="성장 데이터를 불러오지 못했습니다." action={<Button size="sm" variant="outline" onClick={() => void growth.load()}>다시 시도</Button>} />}
      {!growth.loading && !growth.error && growth.data && growth.data.totalCompletedSessions === 0 && <StateMessage title="성장 분석을 만들기 위해 조금 더 훈련이 필요합니다." description="첫 훈련을 완료하면 과정 지표와 XP가 기록됩니다." action={<Button asChild size="sm"><Link to="/training">새 훈련 시작</Link></Button>} />}
      {!growth.loading && !growth.error && growth.data && growth.data.totalCompletedSessions > 0 && <GrowthDashboard data={growth.data} />}
    </main>
  );
}

function GrowthDashboard({ data }: { data: NonNullable<ReturnType<typeof useGrowthAnalytics>["data"]> }) {
  return <div className="mt-7 space-y-9">
    <section className="grid gap-6 rounded-xl border border-border/55 bg-muted/[0.08] p-5 md:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)] md:p-6">
      <div><p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">TRAINING LEVEL</p><div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1"><span className="text-3xl font-semibold tracking-tight">Level {data.level}</span><span className="text-sm text-primary">{data.levelTitle}</span></div><p className="mt-3 text-sm text-muted-foreground">과정 중심 훈련 XP <span className="font-semibold tabular-nums text-foreground">{data.totalXp.toLocaleString()}</span></p><div className="mt-4 h-2 overflow-hidden rounded-full bg-muted/35"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.max(0, Math.min(100, data.progressPercent))}%` }} /></div><div className="mt-2 flex justify-between text-[11px] text-muted-foreground"><span>{data.currentLevelXp} XP</span><span>다음 레벨까지 {data.nextLevelXp} XP</span></div></div>
      <dl className="grid grid-cols-2 gap-x-5 gap-y-4 border-t border-border/40 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0"><Summary label="완료 훈련" value={`${data.totalCompletedSessions}회`} /><Summary label="총 거래" value={`${data.totalTrades}회`} /><Summary label="평균 Process Review" value={data.averageSessionAiScore === null ? "—" : data.averageSessionAiScore.toFixed(1)} /><Summary label="분석 기간" value={PERIOD_LABELS[data.period]} /></dl>
    </section>

    <section><SectionTitle title="과정 지표" description="선택한 기간의 실제 훈련 행동을 기준으로 계산합니다." /><div className="mt-4 grid gap-px overflow-hidden rounded-xl border border-border/45 bg-border/45 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={<Target />} label="PLAN 작성률" metric={data.planSessionRate} note="계획이 있는 완료 세션 / 완료 세션" /><Metric icon={<BrainCircuit />} label="ACTION 근거 기록률" metric={data.actionReasonRate} note="근거가 있는 사용자 거래 / 사용자 거래" /><Metric icon={<ShieldCheck />} label="Risk Rule 사용률" metric={data.riskRuleSessionRate} note="Risk Rule을 사용한 세션 / 완료 세션" /><Metric icon={<Activity />} label="AI Review 생성률" metric={data.aiReviewSessionRate} note="Session AI가 저장된 세션 / 완료 세션" /></div></section>

    <section><SectionTitle title="판단 과정 점수 추이" description="당시 저장된 Session AI Process Review를 시간순으로 표시합니다." />{data.scoreTrend.length ? <ScoreTrend points={data.scoreTrend} /> : <div className="mt-4 border-y border-border/40 py-10 text-center text-sm text-muted-foreground">저장된 Session AI 리뷰가 없어 점수 추이를 표시하지 않습니다.</div>}</section>

    <section><SectionTitle title="훈련 습관" description="성과와 분리된 행동 지표입니다." /><div className="mt-4 space-y-4 border-y border-border/40 py-5"><Habit label="계획 후 행동" metric={data.planSessionRate} /><Habit label="근거 기록" metric={data.actionReasonRate} /><Habit label="리스크 사전 설정" metric={data.riskRuleSessionRate} /></div></section>
  </div>;
}

function ScoreTrend({ points }: { points: GrowthTrendPointResponse[] }) {
  const chart = useMemo(() => buildScoreChart(points), [points]);
  return <div className="mt-4 overflow-hidden rounded-xl border border-border/45 bg-muted/[0.05] p-3 sm:p-5"><svg viewBox="0 0 760 220" role="img" aria-label="판단 과정 점수 추이" className="h-auto w-full"><g className="stroke-border/50">{[0, 25, 50, 75, 100].map((score) => { const y = 12 + (100 - score) * 1.8; return <g key={score}><line x1="36" x2="748" y1={y} y2={y} /><text x="2" y={y + 4} className="fill-muted-foreground text-[10px] stroke-none">{score}</text></g>; })}</g>{chart.length > 1 && <polyline points={scorePolyline(chart)} fill="none" className="stroke-primary" strokeWidth="2.5" strokeLinejoin="round" />}{chart.map((point, index) => <g key={point.sessionId}><circle cx={point.x} cy={point.y} r="4" className="fill-background stroke-primary" strokeWidth="2"><title>{`${index + 1}번째 세션 · ${point.score}`}</title></circle></g>)}</svg><p className="mt-2 text-center text-[11px] text-muted-foreground">왼쪽에서 오른쪽으로 오래된 훈련 → 최근 훈련</p></div>;
}

function Metric({ icon, label, metric, note }: { icon: React.ReactElement; label: string; metric: GrowthMetricResponse; note: string }) { return <div className="bg-background/80 p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>{label}</div><p className="mt-3 text-2xl font-semibold tabular-nums">{metric.rate.toFixed(0)}%</p><p className="mt-1 text-[11px] text-muted-foreground">{metric.numerator}/{metric.denominator} · {note}</p></div>; }
function Habit({ label, metric }: { label: string; metric: GrowthMetricResponse }) { return <div className="grid grid-cols-[110px_1fr_45px] items-center gap-3"><span className="text-xs text-muted-foreground">{label}</span><div className="h-1.5 overflow-hidden rounded-full bg-muted/35"><div className="h-full rounded-full bg-primary/75" style={{ width: `${Math.max(0, Math.min(100, metric.rate))}%` }} /></div><span className="text-right text-xs tabular-nums">{metric.rate.toFixed(0)}%</span></div>; }
function Summary({ label, value }: { label: string; value: string }) { return <div><dt className="text-[11px] text-muted-foreground">{label}</dt><dd className="mt-1 text-lg font-semibold tabular-nums">{value}</dd></div>; }
function SectionTitle({ title, description }: { title: string; description: string }) { return <div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{description}</p></div>; }
function GrowthSkeleton() { return <div className="mt-7 space-y-7" aria-label="성장 데이터 불러오는 중"><div className="h-48 animate-pulse rounded-xl bg-muted/20" /><div className="grid gap-2 sm:grid-cols-4">{[0,1,2,3].map((item) => <div key={item} className="h-28 animate-pulse rounded-lg bg-muted/20" />)}</div><div className="h-64 animate-pulse rounded-xl bg-muted/20" /></div>; }
function StateMessage({ title, description, action }: { title: string; description?: string; action: React.ReactNode }) { return <div className="py-24 text-center"><p className="text-sm font-medium">{title}</p>{description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}<div className="mt-4">{action}</div></div>; }
