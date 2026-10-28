import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrainingHistory } from "@/hooks/useTrainingHistory";
import type { TrainingHistorySummaryResponse } from "@/types/training";
import { filterAndSortHistory, formatHistoryDate, groupHistoryByMonth, trainingHistoryDetailPath, type AiReviewFilter, type HistorySort, type TradeFilter } from "./trainingHistoryBrowser";
import { useI18n } from "@/i18n/LanguageProvider";

export default function TrainingHistoryPage() {
  const { language, t } = useI18n();
  const history = useTrainingHistory();
  const [sort, setSort] = useState<HistorySort>("LATEST");
  const [aiFilter, setAiFilter] = useState<AiReviewFilter>("ALL");
  const [tradeFilter, setTradeFilter] = useState<TradeFilter>("ALL");
  const filtered = useMemo(() => filterAndSortHistory(history.items, sort, aiFilter, tradeFilter), [history.items, sort, aiFilter, tradeFilter]);
  const locale = language === "ko" ? "ko-KR" : "en-US";
  const groups = useMemo(() => groupHistoryByMonth(filtered, locale, t("mypage.historyPage.unknownDate")), [filtered, locale, t]);
  const resetFilters = () => { setAiFilter("ALL"); setTradeFilter("ALL"); };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 lg:py-10">
      <header><Link to="/mypage" className="text-xs text-muted-foreground hover:text-foreground">{t("mypage.eyebrow")}</Link><h1 className="mt-2 text-2xl font-semibold tracking-tight">{t("mypage.history")}</h1><p className="mt-1 text-sm text-muted-foreground">{t("mypage.historyPage.description")}</p></header>
      <div className="mt-6 flex flex-wrap gap-2 border-y border-border/45 py-3">
        <HistorySelect label={t("mypage.historyPage.sort")} value={sort} onChange={(value) => setSort(value as HistorySort)} options={[["LATEST", t("mypage.historyPage.latest")], ["OLDEST", t("mypage.historyPage.oldest")], ["SCORE_HIGH", t("mypage.historyPage.scoreHigh")], ["SCORE_LOW", t("mypage.historyPage.scoreLow")], ["TRADES_HIGH", t("mypage.historyPage.tradesHigh")], ["TRADES_LOW", t("mypage.historyPage.tradesLow")]]} />
        <HistorySelect label={t("mypage.historyPage.aiFilter")} value={aiFilter} onChange={(value) => setAiFilter(value as AiReviewFilter)} options={[["ALL", t("common.all")], ["WITH_REVIEW", t("mypage.historyPage.withReview")], ["WITHOUT_REVIEW", t("mypage.historyPage.withoutReview")]]} />
        <HistorySelect label={t("mypage.historyPage.tradeFilter")} value={tradeFilter} onChange={(value) => setTradeFilter(value as TradeFilter)} options={[["ALL", t("common.all")], ["WITH_TRADES", t("mypage.historyPage.withTrades")], ["WITHOUT_TRADES", t("mypage.historyPage.withoutTrades")]]} />
      </div>
      {history.loading && <HistorySkeleton />}
      {history.error && <Message text={t("mypage.historyFailed")} action={<Button variant="outline" size="sm" onClick={() => void history.load()}>{t("common.retry")}</Button>} />}
      {!history.loading && !history.error && history.items.length === 0 && <Message text={t("mypage.noHistory")} action={<Button asChild size="sm"><Link to="/training">{t("training.completion.newSession")}</Link></Button>} />}
      {!history.loading && !history.error && history.items.length > 0 && filtered.length === 0 && <Message text={t("mypage.historyPage.noMatch")} action={<Button variant="outline" size="sm" onClick={resetFilters}>{t("mypage.historyPage.resetFilters")}</Button>} />}
      {!history.loading && !history.error && groups.length > 0 && <div className="mt-7 space-y-8">{groups.map((group) => <section key={group.label}><h2 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground">{group.label}</h2><div className="divide-y divide-border/35 border-y border-border/45">{group.sessions.map((session) => <HistoryRow key={session.sessionId} session={session} locale={locale} detailLabel={t("mypage.historyPage.detail")} emptyDateLabel={t("mypage.historyPage.unknownDate")} summaryLabel={t("mypage.chartCount", { completed: session.completedChartCount, total: session.totalChartCount, trades: session.totalTradeCount, snapshots: session.snapshotCount })} />)}</div></section>)}</div>}
    </div>
  );
}

function HistorySelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return <label className="flex items-center gap-2 rounded-lg bg-muted/15 px-2.5 py-1.5 text-xs text-muted-foreground"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="bg-transparent font-medium text-foreground outline-none">{options.map(([optionValue, text]) => <option key={optionValue} value={optionValue} className="bg-background">{text}</option>)}</select></label>;
}

function HistoryRow({ session, locale, detailLabel, emptyDateLabel, summaryLabel }: { session: TrainingHistorySummaryResponse; locale: string; detailLabel: string; emptyDateLabel: string; summaryLabel: string }) {
  return <Link to={trainingHistoryDetailPath(session.sessionId)} className="group flex w-full items-center gap-3 px-2 py-3.5 hover:bg-muted/15 sm:px-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium">{formatHistoryDate(session.completedAt, locale, emptyDateLabel)}</p>{session.hasSessionAiReview && <span className="rounded-full bg-primary/[0.08] px-2 py-0.5 text-[10px] text-primary/85">{session.sessionAiScore === null ? "AI Review" : `AI Review ${session.sessionAiScore}`}</span>}</div><p className="mt-1 text-xs tabular-nums text-muted-foreground">{summaryLabel}</p></div><span className="hidden text-xs text-muted-foreground group-hover:text-foreground sm:inline">{detailLabel}</span><ChevronRight className="h-4 w-4 text-muted-foreground/60" /></Link>;
}

function HistorySkeleton() { const { t } = useI18n(); return <div className="mt-7 space-y-3" aria-label={t("mypage.historyLoading")}>{[0, 1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-muted/20" />)}</div>; }
function Message({ text, action }: { text: string; action: React.ReactNode }) { return <div className="py-16 text-center"><p className="text-sm text-muted-foreground">{text}</p><div className="mt-4">{action}</div></div>; }
