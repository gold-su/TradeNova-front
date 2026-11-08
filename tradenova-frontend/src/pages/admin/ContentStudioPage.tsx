import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, Eye, Maximize2, RefreshCw, RotateCcw, SkipForward } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  contentStudioApi,
  type BlindContentCase,
  type RevealedContentCase,
} from "@/api/contentStudioApi";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import CandleChart from "@/components/training/chart/CandleChart";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/LanguageProvider";
import {
  nextVisibleIndex,
  toBlindChartCandles,
  toRevealedChartCandles,
} from "@/lib/admin/contentStudio";

function CaptureFrame({ contentCase, reveal }: { contentCase: BlindContentCase | null; reveal: RevealedContentCase | null }) {
  const { t } = useI18n();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [frameWidth, setFrameWidth] = useState(1080);

  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setFrameWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const candles = useMemo(() => {
    if (reveal) return toRevealedChartCandles(reveal);
    return contentCase ? toBlindChartCandles(contentCase) : [];
  }, [contentCase, reveal]);
  const chartHeight = frameWidth < 600
    ? Math.max(180, Math.round(frameWidth * 0.52))
    : Math.round(frameWidth * 0.63);
  const total = contentCase ? contentCase.analysisBars + contentCase.futureBars : 0;

  return (
    <div ref={frameRef} data-capture-frame className="relative mx-auto aspect-[4/5] w-full max-w-[1080px] overflow-hidden rounded-2xl border border-white/10 bg-[#090d0c] shadow-2xl shadow-black/30">
      <div className="flex h-full flex-col p-[clamp(16px,3.7vw,40px)]">
        <div className="flex items-start justify-between gap-5">
          <div>
            <BrandWordmark className="text-xl sm:text-2xl" />
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300 sm:text-xs">
              {t(reveal ? "admin.studio.revealed" : "admin.studio.blind")}
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-3xl">{t("admin.studio.chartTitle")}</h1>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-400 sm:text-base">{t("admin.studio.chartSubtitle")}</p>
          </div>
          {contentCase && <div className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] text-zinc-300 sm:text-xs">{t("admin.studio.progress", { visible: contentCase.candles.length, total })}</div>}
        </div>

        <div className="mt-[clamp(14px,3vw,28px)] overflow-hidden rounded-xl border border-white/10 bg-[#0d1311]">
          {candles.length > 0 ? (
            <CandleChart
              chartId={0}
              candles={candles}
              height={chartHeight}
              dateDisplayMode={reveal ? "ACTUAL" : "HIDDEN"}
            />
          ) : (
            <div className="grid h-[min(58vw,680px)] place-items-center px-6 text-center text-sm text-zinc-500">{t("admin.studio.empty")}</div>
          )}
        </div>

        <div className="mt-3 grid min-h-0 flex-1 grid-cols-2 gap-2 sm:mt-4 sm:gap-4">
          <section className="rounded-xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
            <p className="text-xs font-medium text-zinc-500">{reveal ? `${reveal.market} · ${reveal.ticker}` : "CASE"}</p>
            <p className="mt-1 text-xs font-semibold text-zinc-100 sm:mt-2 sm:text-xl">{reveal ? reveal.name : "Blind chart"}</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400 sm:text-sm">
              {reveal
                ? t("admin.studio.actualRange", { start: reveal.startDate, end: reveal.endDate })
                : contentCase?.atEnd ? t("admin.studio.end") : t("admin.studio.remaining", { count: contentCase?.remainingBars ?? 0 })}
            </p>
          </section>
          <section className="rounded-xl border border-dashed border-white/10 bg-white/[0.015] p-4 sm:p-5">
            <p className="text-xs leading-relaxed text-zinc-500 sm:text-sm">{t("admin.studio.captureNotes")}</p>
          </section>
        </div>
        <p className="mt-3 text-[9px] leading-relaxed text-zinc-600 sm:text-[11px]">{t("admin.studio.licensing")}</p>
      </div>
    </div>
  );
}

export default function ContentStudioPage() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const captureMode = searchParams.get("capture") === "1";
  const [contentCase, setContentCase] = useState<BlindContentCase | null>(null);
  const [reveal, setReveal] = useState<RevealedContentCase | null>(null);
  const [caseKeyInput, setCaseKeyInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const initiallyLoaded = useRef(false);

  const applyCase = useCallback((nextCase: BlindContentCase) => {
    setContentCase(nextCase);
    setCaseKeyInput(nextCase.caseKey);
    setReveal(null);
    setError("");
  }, []);

  const loadRandom = useCallback(async () => {
    setBusy(true);
    try { applyCase(await contentStudioApi.randomCase()); }
    catch { setError(t("admin.studio.failed")); }
    finally { setBusy(false); }
  }, [applyCase, t]);

  useEffect(() => {
    if (initiallyLoaded.current) return;
    initiallyLoaded.current = true;
    void loadRandom();
  }, [loadRandom]);

  useEffect(() => {
    if (!captureMode) return;
    const exit = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchParams({}, { replace: true });
    };
    window.addEventListener("keydown", exit);
    return () => window.removeEventListener("keydown", exit);
  }, [captureMode, setSearchParams]);

  const loadCase = async (caseKey: string, throughIndex?: number) => {
    const key = caseKey.trim();
    if (!key) return;
    setBusy(true);
    try { applyCase(await contentStudioApi.loadCase(key, throughIndex)); }
    catch { setError(t("admin.studio.failed")); }
    finally { setBusy(false); }
  };

  const revealCase = async () => {
    if (!contentCase) return;
    setBusy(true);
    try { setReveal(await contentStudioApi.reveal(contentCase.caseKey)); setError(""); }
    catch { setError(t("admin.studio.failed")); }
    finally { setBusy(false); }
  };

  const copyCaseKey = async () => {
    if (!contentCase) return;
    try {
      await navigator.clipboard.writeText(contentCase.caseKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError(t("admin.studio.failed"));
    }
  };

  if (captureMode) {
    return <main className="min-h-dvh bg-black p-0 sm:p-6"><p className="sr-only">{t("admin.studio.exitCapture")}</p><CaptureFrame contentCase={contentCase} reveal={reveal} /></main>;
  }

  return (
    <main className="min-h-dvh bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div><BrandWordmark className="text-xl" /><h1 className="mt-5 text-2xl font-semibold">{t("admin.studio.title")}</h1><p className="mt-2 text-sm text-muted-foreground">{t("admin.studio.subtitle")}</p></div>
          <LanguageSwitcher />
        </header>

        <section className="mt-6 rounded-xl border border-border/60 bg-card/40 p-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void loadRandom()} disabled={busy}><RefreshCw />{t("admin.studio.random")}</Button>
            <Button variant="outline" onClick={() => contentCase && void loadCase(contentCase.caseKey, nextVisibleIndex(contentCase, 1))} disabled={busy || !contentCase || contentCase.atEnd}><SkipForward />{t("admin.studio.nextOne")}</Button>
            <Button variant="outline" onClick={() => contentCase && void loadCase(contentCase.caseKey, nextVisibleIndex(contentCase, 5))} disabled={busy || !contentCase || contentCase.atEnd}><SkipForward />{t("admin.studio.nextFive")}</Button>
            <Button variant="outline" onClick={() => contentCase && void loadCase(contentCase.caseKey)} disabled={busy || !contentCase}><RotateCcw />{t("admin.studio.reset")}</Button>
            <Button variant="outline" onClick={() => void revealCase()} disabled={busy || !contentCase}><Eye />{t("admin.studio.reveal")}</Button>
            <Button variant="secondary" onClick={() => setSearchParams({ capture: "1" })} disabled={!contentCase}><Maximize2 />{t("admin.studio.capture")}</Button>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Input aria-label={t("admin.studio.caseKey")} value={caseKeyInput} onChange={(event) => setCaseKeyInput(event.target.value)} placeholder={t("admin.studio.caseKeyPlaceholder")} className="font-mono text-xs" />
            <Button variant="outline" onClick={() => void loadCase(caseKeyInput)} disabled={busy || !caseKeyInput.trim()}>{t("admin.studio.load")}</Button>
            <Button variant="ghost" onClick={() => void copyCaseKey()} disabled={!contentCase}><Copy />{t(copied ? "admin.studio.copied" : "admin.studio.copy")}</Button>
          </div>
          {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
          {busy && <p className="mt-3 text-xs text-muted-foreground" role="status">{t("admin.studio.loading")}</p>}
        </section>

        <section className="mt-6"><CaptureFrame contentCase={contentCase} reveal={reveal} /></section>
      </div>
    </main>
  );
}
