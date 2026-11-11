import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertTriangle,
  Copy,
  Download,
  Eye,
  Maximize2,
  RefreshCw,
  RotateCcw,
  SkipForward,
} from "lucide-react";
import { toPng } from "html-to-image";
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
  CONTENT_CAPTURE_HEIGHT,
  CONTENT_CAPTURE_WIDTH,
  CONTENT_PREVIEW_MAX_WIDTH,
  createContentCaptureFilename,
  inspectContentCandleQuality,
  previewScaleForWidth,
} from "@/lib/admin/contentCapture";
import {
  nextVisibleIndex,
  toBlindChartCandles,
  toRevealedChartCandles,
} from "@/lib/admin/contentStudio";

type CaptureFrameProps = {
  contentCase: BlindContentCase | null;
  reveal: RevealedContentCase | null;
  contentNumber: number;
};

const CaptureFrame = forwardRef<HTMLDivElement, CaptureFrameProps>(function CaptureFrame(
  { contentCase, reveal, contentNumber },
  ref,
) {
  const { t } = useI18n();
  const candles = useMemo(() => {
    if (reveal) return toRevealedChartCandles(reveal);
    return contentCase ? toBlindChartCandles(contentCase) : [];
  }, [contentCase, reveal]);
  const total = contentCase ? contentCase.analysisBars + contentCase.futureBars : 0;
  const contentLabel = String(Math.max(1, contentNumber)).padStart(3, "0");

  return (
    <div
      ref={ref}
      data-capture-frame
      className="relative overflow-hidden bg-[#090d0c] text-white"
      style={{ width: CONTENT_CAPTURE_WIDTH, height: CONTENT_CAPTURE_HEIGHT }}
    >
      <div className="flex h-full flex-col px-12 py-11">
        <header className="flex items-start justify-between gap-10">
          <div className="min-w-0">
            <BrandWordmark className="gap-3 text-[32px] [&>img]:h-12 [&>img]:w-12" />
            <p className="mt-6 text-[15px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
              {t(reveal ? "admin.studio.revealed" : "admin.studio.blind")}
            </p>
            <h1 className="mt-3 text-[40px] font-semibold leading-tight tracking-tight text-white">
              {t("admin.studio.chartTitle")}
            </h1>
            <p className="mt-3 max-w-[720px] text-[21px] leading-[1.55] text-zinc-400">
              {t("admin.studio.chartSubtitle")}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              {t("admin.studio.contentNumber")}
            </p>
            <p className="mt-1 text-[28px] font-semibold tabular-nums text-zinc-100">#{contentLabel}</p>
            {contentCase && (
              <p className="mt-4 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[14px] tabular-nums text-zinc-300">
                {t("admin.studio.progress", { visible: contentCase.candles.length, total })}
              </p>
            )}
          </div>
        </header>

        <div className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1311]">
          {candles.length > 0 ? (
            <CandleChart
              chartId={contentNumber * 10_000 + (reveal ? 9_999 : contentCase?.visibleThroughIndex ?? 0)}
              candles={candles}
              height={650}
              dateDisplayMode={reveal ? "ACTUAL" : "HIDDEN"}
            />
          ) : (
            <div className="grid h-[650px] place-items-center px-12 text-center text-xl text-zinc-500">
              {t("admin.studio.empty")}
            </div>
          )}
        </div>

        <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.025] px-7 py-6">
          <div className="flex items-end justify-between gap-8">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                {reveal ? `${reveal.market} · ${reveal.ticker}` : t("admin.studio.identityHidden")}
              </p>
              <h2 className="mt-2 text-[30px] font-semibold leading-tight text-zinc-100">
                {reveal ? reveal.name : t("admin.studio.captureQuestion")}
              </h2>
              <p className="mt-2 text-[17px] leading-relaxed text-zinc-400">
                {reveal
                  ? t("admin.studio.actualRange", { start: reveal.startDate, end: reveal.endDate })
                  : contentCase?.atEnd
                    ? t("admin.studio.end")
                    : t("admin.studio.remaining", { count: contentCase?.remainingBars ?? 0 })}
              </p>
            </div>
            {!reveal && (
              <div className="flex shrink-0 gap-3" aria-label={t("admin.studio.captureQuestion")}>
                {["BUY", "SELL", "HOLD"].map((action) => (
                  <span
                    key={action}
                    className="min-w-24 rounded-xl border border-white/15 bg-white/[0.025] px-5 py-3 text-center text-[18px] font-semibold tracking-[0.08em] text-zinc-200"
                  >
                    {action}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="mt-auto flex items-end justify-between gap-8 pt-6">
          <p className="max-w-[760px] text-[13px] leading-relaxed text-zinc-600">
            {t("admin.studio.licensing")}
          </p>
          <p className="shrink-0 text-[13px] font-medium tracking-[0.08em] text-emerald-400/70">
            DECIREPS.COM
          </p>
        </footer>
      </div>
    </div>
  );
});

function CapturePreview({
  captureRef,
  contentCase,
  reveal,
  contentNumber,
  maxWidth = CONTENT_PREVIEW_MAX_WIDTH,
}: CaptureFrameProps & {
  captureRef: React.RefObject<HTMLDivElement | null>;
  maxWidth?: number;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [previewWidth, setPreviewWidth] = useState(0);

  useEffect(() => {
    const element = hostRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setPreviewWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const scale = previewScaleForWidth(previewWidth);

  return (
    <div
      ref={hostRef}
      className="relative mx-auto w-full overflow-hidden rounded-xl border border-white/10 bg-[#090d0c] shadow-2xl shadow-black/30"
      style={{ maxWidth, aspectRatio: `${CONTENT_CAPTURE_WIDTH} / ${CONTENT_CAPTURE_HEIGHT}` }}
    >
      {scale > 0 && (
        <div
          style={{
            width: CONTENT_CAPTURE_WIDTH,
            height: CONTENT_CAPTURE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <CaptureFrame
            ref={captureRef}
            contentCase={contentCase}
            reveal={reveal}
            contentNumber={contentNumber}
          />
        </div>
      )}
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
  const [contentNumber, setContentNumber] = useState(1);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const initiallyLoaded = useRef(false);
  const captureFrameRef = useRef<HTMLDivElement | null>(null);
  const caseNumbersRef = useRef(new Map<string, number>());
  const nextContentNumberRef = useRef(1);

  const applyCase = useCallback((nextCase: BlindContentCase) => {
    let assignedNumber = caseNumbersRef.current.get(nextCase.caseKey);
    if (assignedNumber == null) {
      assignedNumber = nextContentNumberRef.current;
      caseNumbersRef.current.set(nextCase.caseKey, assignedNumber);
      nextContentNumberRef.current += 1;
    }
    setContentNumber(assignedNumber);
    setContentCase(nextCase);
    setCaseKeyInput(nextCase.caseKey);
    setReveal(null);
    setError("");
    setDownloaded(false);
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
    try {
      setReveal(await contentStudioApi.reveal(contentCase.caseKey));
      setDownloaded(false);
      setError("");
    } catch {
      setError(t("admin.studio.failed"));
    } finally {
      setBusy(false);
    }
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

  const savePng = async () => {
    const frame = captureFrameRef.current;
    if (!frame || !contentCase) return;
    setExporting(true);
    setDownloaded(false);
    setError("");
    try {
      await document.fonts.ready;
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      const dataUrl = await toPng(frame, {
        width: CONTENT_CAPTURE_WIDTH,
        height: CONTENT_CAPTURE_HEIGHT,
        pixelRatio: 1,
        cacheBust: true,
        backgroundColor: "#090d0c",
      });
      const anchor = document.createElement("a");
      anchor.download = createContentCaptureFilename(contentNumber, Boolean(reveal));
      anchor.href = dataUrl;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setDownloaded(true);
    } catch {
      setError(t("admin.studio.pngFailed"));
    } finally {
      setExporting(false);
    }
  };

  const quality = useMemo(
    () => inspectContentCandleQuality(reveal?.candles ?? contentCase?.candles ?? []),
    [contentCase, reveal],
  );

  if (captureMode) {
    return (
      <main className="min-h-dvh bg-black p-0 sm:p-6">
        <p className="sr-only">{t("admin.studio.exitCapture")}</p>
        <CapturePreview
          captureRef={captureFrameRef}
          contentCase={contentCase}
          reveal={reveal}
          contentNumber={contentNumber}
          maxWidth={CONTENT_CAPTURE_WIDTH}
        />
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <BrandWordmark className="text-xl" />
            <h1 className="mt-5 text-2xl font-semibold">{t("admin.studio.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("admin.studio.subtitle")}</p>
          </div>
          <LanguageSwitcher />
        </header>

        <section className="mt-6 rounded-xl border border-border/60 bg-card/40 p-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void loadRandom()} disabled={busy || exporting}><RefreshCw />{t("admin.studio.random")}</Button>
            <Button variant="outline" onClick={() => contentCase && void loadCase(contentCase.caseKey, nextVisibleIndex(contentCase, 1))} disabled={busy || exporting || !contentCase || contentCase.atEnd}><SkipForward />{t("admin.studio.nextOne")}</Button>
            <Button variant="outline" onClick={() => contentCase && void loadCase(contentCase.caseKey, nextVisibleIndex(contentCase, 5))} disabled={busy || exporting || !contentCase || contentCase.atEnd}><SkipForward />{t("admin.studio.nextFive")}</Button>
            <Button variant="outline" onClick={() => contentCase && void loadCase(contentCase.caseKey)} disabled={busy || exporting || !contentCase}><RotateCcw />{t("admin.studio.reset")}</Button>
            <Button variant="outline" onClick={() => void revealCase()} disabled={busy || exporting || !contentCase}><Eye />{t("admin.studio.reveal")}</Button>
            <Button variant="secondary" onClick={() => setSearchParams({ capture: "1" })} disabled={!contentCase || exporting}><Maximize2 />{t("admin.studio.capture")}</Button>
            <Button onClick={() => void savePng()} disabled={busy || exporting || !contentCase}>
              <Download />
              {t(exporting ? "admin.studio.savingPng" : reveal ? "admin.studio.saveRevealedPng" : "admin.studio.savePng")}
            </Button>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Input aria-label={t("admin.studio.caseKey")} value={caseKeyInput} onChange={(event) => setCaseKeyInput(event.target.value)} placeholder={t("admin.studio.caseKeyPlaceholder")} className="font-mono text-xs" />
            <Button variant="outline" onClick={() => void loadCase(caseKeyInput)} disabled={busy || exporting || !caseKeyInput.trim()}>{t("admin.studio.load")}</Button>
            <Button variant="ghost" onClick={() => void copyCaseKey()} disabled={!contentCase || exporting}><Copy />{t(copied ? "admin.studio.copied" : "admin.studio.copy")}</Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{t("admin.studio.pngHint")}</p>
          {downloaded && <p className="mt-2 text-sm text-emerald-400" role="status">{t("admin.studio.pngSaved")}</p>}
          {(quality.invalidOhlc || quality.possibleCorporateAction) && (
            <p className="mt-3 flex items-start gap-2 text-sm text-amber-300" role="status">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {t(quality.invalidOhlc ? "admin.studio.invalidOhlc" : "admin.studio.possibleAdjustment", {
                ratio: quality.maxCloseJumpRatio.toFixed(2),
              })}
            </p>
          )}
          {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
          {busy && <p className="mt-3 text-xs text-muted-foreground" role="status">{t("admin.studio.loading")}</p>}
        </section>

        <section className="mt-6">
          <div className="mb-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t("admin.studio.previewLabel")}</p>
          </div>
          <CapturePreview
            captureRef={captureFrameRef}
            contentCase={contentCase}
            reveal={reveal}
            contentNumber={contentNumber}
          />
        </section>
      </div>
    </main>
  );
}
