import { useState } from "react";
import { createRoot } from "react-dom/client";
import { X } from "lucide-react";
import { ChartAiReviewContent } from "@/components/training/ai/ChartAiReviewContent";
import { LanguageProvider, useI18n } from "@/i18n/LanguageProvider";
import type { ChartAiPayload } from "@/types/training";
import "../index.css";

// Fictional scenario for screenshots only; never fetched from or saved to the API.
const copy = {
  en: {
    title: "Chart review",
    chart: "Chart 2 · Finance",
    example: "Illustrative example · Sample data",
    hint: "Capture the review card below. Its height expands so all text stays visible.",
    summary: "Your plan required a resistance breakout with volume above **1.5× its 20-bar average**. You entered after the breakout, but entry-bar volume was only **0.8× the average**. The price condition was met; the volume condition was not.",
    strengths: [
      "Recorded both entry conditions before BUY and linked the trade to that plan.",
      "Defined a manual exit below the recent swing low. This is a documented risk plan, even without an automatic stop."
    ],
    warnings: [
      "Marked the entry as following the plan despite missing volume confirmation.",
      "Next drill: check price and volume separately before BUY. If either required condition is unmet, WAIT."
    ],
  },
  ko: {
    title: "차트 리뷰",
    chart: "Chart 2 · 금융",
    example: "리뷰 예시 · 가상 데이터",
    hint: "아래 리뷰 카드만 캡처하세요. 전체 내용을 볼 수 있도록 높이가 자동으로 늘어납니다.",
    summary: "계획은 저항선 돌파와 함께 거래량이 **20봉 평균의 1.5배 이상**일 때 진입하는 것이었습니다. 돌파 후 매수했지만 진입 봉의 거래량은 **평균의 0.8배**였습니다. 가격 조건은 충족됐지만, 거래량 조건은 충족되지 않았습니다.",
    strengths: [
      "매수 전에 두 가지 진입 조건을 기록하고 해당 계획을 거래에 연결했습니다.",
      "최근 스윙 저점 이탈 시 수동 청산한다는 기준을 기록했습니다. 자동 손절을 설정하지 않았어도 문서화된 위험관리 계획입니다."
    ],
    warnings: [
      "거래량 확인 조건이 충족되지 않았는데도 계획에 따른 진입으로 기록했습니다.",
      "다음 훈련에서는 매수 전 가격과 거래량 조건을 각각 확인하세요. 필수 조건 중 하나라도 미충족이면 관망하세요."
    ],
  },
};

function ReviewCapture() {
  const { language, setLanguage } = useI18n();
  const [visible, setVisible] = useState(true);
  const text = copy[language];
  const payload: ChartAiPayload = {
    analysisScope: "CHART",
    analysisType: "DEEP",
    hasSnapshot: true,
    score: 64, // Illustrative score, not an actual model result.
    generatedAt: "2026-11-02T00:00:00Z",
    analysisVersion: 1,
    summary: text.summary,
    strengths: text.strengths,
    warnings: text.warnings,
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto mb-6 flex max-w-2xl flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <button type="button" onClick={() => setLanguage("en")} className="rounded-md border border-border px-3 py-2" aria-pressed={language === "en"}>English</button>
        <button type="button" onClick={() => setLanguage("ko")} className="rounded-md border border-border px-3 py-2" aria-pressed={language === "ko"}>한국어</button>
        {!visible && <button type="button" onClick={() => setVisible(true)} className="text-primary">Open review / 리뷰 열기</button>}
        <p className="w-full">{text.hint}</p>
      </div>

      {visible && (
        <article data-review-capture className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-background shadow-2xl">
          <div className="flex items-center justify-between bg-background/95 px-5 py-4">
            <div>
              <div className="text-base font-semibold">{text.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{text.chart}</div>
            </div>
            <button type="button" aria-label={language === "en" ? "Close review" : "리뷰 닫기"} onClick={() => setVisible(false)} className="rounded-lg p-2 text-muted-foreground transition hover:bg-background/70 hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="px-5 pb-5">
            <p className="mb-3 text-[11px] text-muted-foreground">{text.example}</p>
            <ChartAiReviewContent payload={payload} />
          </div>
        </article>
      )}
    </main>
  );
}

// This standalone entry is served by Vite dev only and is not a production build entry.
if (import.meta.env.DEV) {
  document.documentElement.classList.add("dark");
  const root = document.getElementById("root");
  if (root) createRoot(root).render(<LanguageProvider><ReviewCapture /></LanguageProvider>);
}
