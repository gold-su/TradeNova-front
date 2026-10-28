import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  ChevronRight,
  History,
  LogOut,
  Play,
  Settings2,
  TrendingUp,
  UserRound,
  WalletCards,
} from "lucide-react";
import { authApi } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { QuickPhraseManagerDialog } from "@/components/training/trade-reason/QuickPhraseManagerDialog";
import { useQuickPhrases } from "@/hooks/useQuickPhrases";
import { useTrainingHistory } from "@/hooks/useTrainingHistory";
import type { TrainingHistorySummaryResponse } from "@/types/training";
import {
  getSessionAiLabel,
  getTrainingHistoryViewState,
  readStoredProfile,
  summarizeTrainingHistory,
} from "./myPageState";
import { formatHistoryDate, trainingHistoryDetailPath } from "./trainingHistoryBrowser";
import { useI18n } from "@/i18n/LanguageProvider";

export default function MyPageHub() {
  const { language, t } = useI18n();
  const navigate = useNavigate();
  const [managerOpen, setManagerOpen] = useState(false);
  const profile = readStoredProfile(localStorage);
  const phrases = useQuickPhrases();
  const history = useTrainingHistory();
  const historyState = getTrainingHistoryViewState({
    loading: history.loading,
    error: history.error,
    itemCount: history.items.length,
  });
  const summary = summarizeTrainingHistory(history.items);
  const hubLinks = [
    { to: "/training", title: t("mypage.start"), description: t("mypage.startDescription"), icon: <Play className="h-4 w-4" aria-hidden="true" />, primary: true },
    { to: "/mypage/history", title: t("mypage.history"), description: t("mypage.historyDescription"), icon: <History className="h-4 w-4" aria-hidden="true" /> },
    { to: "/growth", title: t("mypage.growth"), description: t("mypage.growthDescription"), icon: <TrendingUp className="h-4 w-4" aria-hidden="true" /> },
    { to: "/mypage/accounts", title: t("mypage.accounts"), description: t("mypage.accountsDescription"), icon: <WalletCards className="h-4 w-4" aria-hidden="true" /> },
  ];

  const logout = () => {
    authApi.logoutLocal();
    navigate("/", { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:py-10">
      <header className="flex flex-col justify-between gap-4 border-b border-border/45 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-primary">{t("mypage.eyebrow")}</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">{t("mypage.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("mypage.description")}</p>
        </div>
        <div className="flex min-w-0 items-center gap-3 sm:max-w-xs sm:text-right">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <UserRound className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{profile.nickname || t("mypage.user")}</p>
            <p className="truncate text-xs text-muted-foreground">{profile.email || t("mypage.noLoginInfo")}</p>
          </div>
        </div>
      </header>

      <nav aria-label={t("mypage.navLabel")} className="grid gap-2 py-5 sm:grid-cols-2 lg:grid-cols-4">
        {hubLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`group flex min-w-0 items-center gap-3 rounded-xl px-4 py-3.5 ring-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
              item.primary
                ? "bg-primary/[0.08] ring-primary/30 hover:bg-primary/[0.12]"
                : "bg-muted/[0.06] ring-border/35 hover:bg-muted/[0.12]"
            }`}
          >
            <span className={item.primary ? "text-primary" : "text-muted-foreground"}>{item.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{item.title}</span>
              <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{item.description}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        ))}
      </nav>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
        <section aria-labelledby="recent-training-heading" className="min-w-0 rounded-xl bg-muted/[0.06] ring-1 ring-border/35">
          <div className="flex flex-col gap-4 border-b border-border/40 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
                <h2 id="recent-training-heading" className="text-sm font-semibold">{t("mypage.recent")}</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t("mypage.recentDescription")}</p>
            </div>
            {!history.loading && !history.error && (
              <dl className="grid grid-cols-3 gap-5">
                <SummaryMetric label={t("mypage.completed")} value={summary.completedSessions} />
                <SummaryMetric label={t("mypage.trades")} value={summary.totalTrades} />
                <SummaryMetric label={t("mypage.aiReviews")} value={summary.reviewedSessions} />
              </dl>
            )}
          </div>

          {historyState === "loading" && (
            <div aria-label={t("mypage.historyLoading")} className="divide-y divide-border/30">
              {[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse bg-muted/15" />)}
            </div>
          )}
          {historyState === "error" && (
            <HistoryMessage
              text={t("mypage.historyFailed")}
              action={<Button size="sm" variant="outline" onClick={() => void history.load()}>{t("common.retry")}</Button>}
            />
          )}
          {historyState === "empty" && (
            <HistoryMessage
              text={t("mypage.noHistory")}
              action={<Button asChild size="sm"><Link to="/training">{t("mypage.firstTraining")}</Link></Button>}
            />
          )}
          {historyState === "ready" && (
            <>
              <div className="divide-y divide-border/35">
                {history.items.slice(0, 5).map((session) => <HistoryRow key={session.sessionId} session={session} locale={language === "ko" ? "ko-KR" : "en-US"} summaryLabel={t("mypage.chartCount", { completed: session.completedChartCount, total: session.totalChartCount, trades: session.totalTradeCount, snapshots: session.snapshotCount })} />)}
              </div>
              <div className="border-t border-border/40 px-4 py-2 sm:px-5">
                <Button asChild variant="ghost" size="sm" className="w-full text-xs">
                  <Link to="/mypage/history">{t("mypage.viewAllHistory")} <ChevronRight className="h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </>
          )}
        </section>

        <aside className="space-y-5">
          <section aria-labelledby="reason-heading" className="rounded-xl bg-muted/[0.06] p-4 ring-1 ring-border/35 sm:p-5">
            <div className="flex items-start gap-3">
              <Settings2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <h2 id="reason-heading" className="text-sm font-semibold">{t("mypage.reasonTitle")}</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{t("mypage.reasonDescription")}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {phrases.quickPhrasesLoading ? t("common.loading") : phrases.quickPhrasesError ? t("mypage.loadFailed") : t("mypage.registered", { count: phrases.quickPhrases.length })}
              </span>
              <Button variant="outline" size="sm" onClick={() => setManagerOpen(true)} disabled={phrases.quickPhrasesLoading}>{t("mypage.manageReasons")}</Button>
            </div>
            {phrases.quickPhrasesError && (
              <button type="button" onClick={() => void phrases.loadQuickPhrases()} className="mt-3 text-xs font-medium text-primary hover:underline">{t("common.retry")}</button>
            )}
          </section>

          <section aria-labelledby="account-heading" className="rounded-xl bg-muted/[0.06] p-4 ring-1 ring-border/35 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 id="account-heading" className="text-sm font-semibold">{t("mypage.loginAccount")}</h2>
              <span className="rounded-full border border-border/50 px-2 py-1 text-[10px] text-muted-foreground">{t("mypage.readOnly")}</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{t("mypage.accountNotice")}</p>
            <Button variant="outline" size="sm" onClick={logout} className="mt-4 w-full">
              <LogOut className="h-4 w-4" aria-hidden="true" />{t("mypage.logout")}
            </Button>
          </section>
        </aside>
      </div>

      {managerOpen && (
        <QuickPhraseManagerDialog
          items={phrases.quickPhrases}
          onClose={() => setManagerOpen(false)}
          onCreate={phrases.createQuickPhrase}
          onUpdate={phrases.updateQuickPhrase}
          onDelete={phrases.deleteQuickPhrase}
        />
      )}
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: number }) {
  return <div><dd className="text-right text-base font-semibold tabular-nums">{value}</dd><dt className="text-[10px] text-muted-foreground">{label}</dt></div>;
}

function HistoryRow({ session, locale, summaryLabel }: { session: TrainingHistorySummaryResponse; locale: string; summaryLabel: string }) {
  const aiLabel = getSessionAiLabel(session);
  return (
    <Link
      to={trainingHistoryDetailPath(session.sessionId)}
      className="group flex w-full items-center gap-3 px-4 py-3.5 transition hover:bg-muted/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50 sm:px-5"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">{formatHistoryDate(session.completedAt, locale)}</p>
          {aiLabel && <span className="rounded-full bg-primary/[0.08] px-2 py-0.5 text-[10px] font-medium text-primary/85">{aiLabel}</span>}
        </div>
        <p className="mt-1 text-xs tabular-nums text-muted-foreground">{summaryLabel}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

function HistoryMessage({ text, action }: { text: string; action: ReactNode }) {
  return <div className="px-4 py-12 text-center"><p className="text-sm text-muted-foreground">{text}</p><div className="mt-4">{action}</div></div>;
}
