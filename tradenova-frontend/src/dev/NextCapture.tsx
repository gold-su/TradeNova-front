import { useState } from "react";
import { createRoot } from "react-dom/client";
import { TrainingTradeJournalPanel } from "@/components/training/common/TrainingTradeJournalPanel";
import { LanguageProvider, useI18n } from "@/i18n/LanguageProvider";
import type { TradeForm } from "@/hooks/training/training.types";
import type { ReportDocumentResponse } from "@/types/training";
import "../index.css";

const snapshots: ReportDocumentResponse[] = [];
const PANEL_WIDTH = 344;

// Actions are inert in this preview; these callbacks must never reach an API.
async function captureOnly(): Promise<never> {
  throw new Error("Screenshot preview only.");
}

function NextCapture() {
  const { language, setLanguage } = useI18n();
  const [scale, setScale] = useState(3);
  const [steps, setSteps] = useState(1);
  const [sync, setSync] = useState(true);
  const [form, setForm] = useState<TradeForm>({
    qty: 1,
    entryReason: "",
    riskNote: "",
    reasons: [],
    reasonMode: "MANUAL",
    scenarioSnapshotId: null,
    planRelation: null,
    changeReason: "",
  });

  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
        <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"} className="rounded-lg border border-border px-3 py-2">English</button>
        <button type="button" onClick={() => setLanguage("ko")} aria-pressed={language === "ko"} className="rounded-lg border border-border px-3 py-2">한국어</button>
        {[2, 3, 4].map((value) => (
          <button type="button" key={value} onClick={() => setScale(value)} aria-pressed={scale === value} className={`rounded-lg border px-3 py-2 ${scale === value ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{value}×</button>
        ))}
        <p className="w-full text-xs text-muted-foreground">
          {language === "en"
            ? "Keep browser zoom at 100%. Capture only the panel below as PNG. Default 3× renders real text and icons at high resolution."
            : "브라우저 배율은 100%로 두고 아래 패널만 PNG로 캡처하세요. 기본 3배 크기에서 실제 글자와 아이콘을 크게 렌더링합니다."}
        </p>
      </div>
      <style>{".next-capture-panel > div > div:first-child { display: none; }"}</style>
      <section data-next-capture style={{ width: PANEL_WIDTH * scale }} aria-label="NEXT panel capture">
        <div className="next-capture-panel rounded-xl border border-border/70 bg-background p-3" style={{ width: PANEL_WIDTH, zoom: scale }} inert>
          <TrainingTradeJournalPanel
            tradeForm={form}
            setTradeForm={setForm}
            quickPhrases={[]}
            createQuickPhrase={captureOnly}
            updateQuickPhrase={captureOnly}
            deleteQuickPhrase={captureOnly}
            disabled={false}
            loading={false}
            syncNext={sync}
            setSyncNext={setSync}
            onBuy={captureOnly}
            onSell={captureOnly}
            onWait={captureOnly}
            onSellAll={captureOnly}
            onNext={() => {}}
            advanceSteps={steps}
            setAdvanceSteps={setSteps}
            riskRule={null}
            riskSaving={false}
            saveRiskRule={captureOnly}
            cashBalance={3605722}
            positionQty={0}
            currentPrice={37233}
            scenarioSnapshots={snapshots}
            chartId={1}
          />
        </div>
      </section>
    </main>
  );
}

// Standalone Vite dev entry; excluded from the normal production HTML entry.
if (import.meta.env.DEV) {
  document.documentElement.classList.add("dark");
  const root = document.getElementById("root");
  if (root) createRoot(root).render(<LanguageProvider><NextCapture /></LanguageProvider>);
}
