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
    summary: "Your entry met both planned conditions: a resistance breakout and volume at **1.6× the 20-bar average**, above your 1.5× threshold. Your exit came **two bars after price fell below the planned swing low**. Entry discipline was stronger than exit discipline.",
    strengths: [
      "Recorded the breakout trigger, volume threshold, and swing-low exit condition before entering.",
      "Waited until both price and volume conditions were met before buying."
    ],
    warnings: [
      "Advanced two more bars after the exit condition was met, then sold without recording a change to the plan.",
      "Next drill: after each NEXT, check your exit condition before advancing again. If it is met, exit or record why you are changing the plan."
    ],
  },
  ko: {
    title: "차트 리뷰",
    chart: "Chart 2 · 금융",
    example: "리뷰 예시 · 가상 데이터",
    hint: "아래 리뷰 카드만 캡처하세요. 전체 내용을 볼 수 있도록 높이가 자동으로 늘어납니다.",
    summary: "진입 당시 저항선 돌파와 거래량 조건을 모두 충족했습니다. 거래량은 **20봉 평균의 1.6배**로, 계획한 1.5배 기준을 넘었습니다. 반면 청산은 **계획한 스윙 저점 이탈보다 2봉 늦었습니다**. 진입에서는 계획을 지켰지만, 청산에서는 실행이 지연됐습니다.",
    strengths: [
      "진입 전에 돌파 조건, 거래량 기준, 스윙 저점 이탈 시 청산 조건을 기록했습니다.",
      "가격과 거래량 조건이 모두 충족될 때까지 기다린 뒤 매수했습니다."
    ],
    warnings: [
      "청산 조건이 충족된 뒤 2봉을 더 진행하고 매도했지만, 계획을 바꾼 이유는 기록하지 않았습니다.",
      "다음 훈련에서는 NEXT를 누른 뒤 청산 조건부터 확인하세요. 조건이 충족됐다면 청산하거나, 계획을 바꾸는 이유를 기록한 뒤 다음 봉으로 진행하세요."
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
