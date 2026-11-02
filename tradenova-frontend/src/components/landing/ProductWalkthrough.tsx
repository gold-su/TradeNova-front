import trainingWorkspace from "@/assets/landing/product/en/training-workspace.png";
import blindChart from "@/assets/landing/product/en/blind-chart.png";
import scenarioPlan from "@/assets/landing/product/en/scenario-plan.png";
import nextProgress from "@/assets/landing/product/en/next-progress.png";
import tradeExecution from "@/assets/landing/product/en/trade-execution.png";
import aiReview from "@/assets/landing/product/en/ai-review.png";
import legacyBlindChart from "@/assets/landing/product/blind-chart.png";
import legacyBlindChartMobile from "@/assets/landing/product/blind-chart-mobile.png";
import legacyScenarioPlan from "@/assets/landing/product/scenario-plan.png";
import legacyScenarioPlanMobile from "@/assets/landing/product/scenario-plan-mobile.png";
import legacyNextProgress from "@/assets/landing/product/next-progress.png";
import legacyNextProgressMobile from "@/assets/landing/product/next-progress-mobile.png";
import legacyTradeExecution from "@/assets/landing/product/trade-execution.png";
import legacyTradeExecutionMobile from "@/assets/landing/product/trade-execution-mobile.png";
import legacyAiReview from "@/assets/landing/product/ai-review.png";
import legacyAiReviewMobile from "@/assets/landing/product/ai-review-mobile.png";
import { useI18n } from "@/i18n/LanguageProvider";

// Native capture sizes reserve the right aspect ratio and prevent upscaling small UI crops.
const englishScreenshots = {
  workspace: { src: trainingWorkspace, width: 1920, height: 910 },
  blind: { src: blindChart, width: 1330, height: 716 },
  plan: { src: scenarioPlan, width: 679, height: 743 },
  next: { src: nextProgress, width: 305, height: 183 },
  trade: { src: tradeExecution, width: 491, height: 764 },
  review: { src: aiReview, width: 593, height: 705 },
} as const;

const legacyScreenshots = {
  workspace: { src: legacyBlindChart, mobileSrc: legacyBlindChartMobile, width: 1200, height: 750 },
  blind: { src: legacyBlindChart, mobileSrc: legacyBlindChartMobile, width: 1200, height: 750 },
  plan: { src: legacyScenarioPlan, mobileSrc: legacyScenarioPlanMobile, width: 1200, height: 750 },
  next: { src: legacyNextProgress, mobileSrc: legacyNextProgressMobile, width: 1200, height: 750 },
  trade: { src: legacyTradeExecution, mobileSrc: legacyTradeExecutionMobile, width: 1200, height: 750 },
  review: { src: legacyAiReview, mobileSrc: legacyAiReviewMobile, width: 1200, height: 750 },
} as const;

const stepMeta = [
  { number: "01", stage: "BLIND", image: "blind" },
  { number: "02", stage: "PLAN", image: "plan" },
  { number: "03", stage: "NEXT", image: "next" },
  { number: "04", stage: "TRADE", image: "trade" },
  { number: "05", stage: "AI REVIEW", image: "review" },
] as const;

type ScreenshotProps = {
  src: string;
  mobileSrc?: string;
  alt: string;
  width?: number;
  height?: number;
  eager?: boolean;
  className?: string;
};

export function ProductScreenshot({
  src,
  mobileSrc,
  alt,
  width = 1200,
  height = 750,
  eager = false,
  className = "",
}: ScreenshotProps) {
  return (
    <figure
      className={`mx-auto w-full overflow-hidden rounded-xl border border-border/70 bg-[#06100d] p-1 shadow-[0_22px_58px_-42px_rgba(0,0,0,0.92)] sm:p-1.5 ${className}`}
      style={{ maxWidth: width + 14 }}
    >
      <picture className="block overflow-hidden rounded-lg bg-[#020806]">
        {mobileSrc && <source media="(max-width: 639px)" srcSet={mobileSrc} />}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="block h-auto w-full"
        />
      </picture>
    </figure>
  );
}

export function HeroProductScreenshot() {
  const { t, language } = useI18n();
  const screenshots = language === "en" ? englishScreenshots : legacyScreenshots;

  return (
    <div className="relative min-w-0">
      <div
        aria-hidden="true"
        className="absolute -inset-4 rounded-[1.5rem] bg-primary/[0.055] blur-2xl"
      />
      <ProductScreenshot
        {...screenshots.workspace}
        alt={t("landing.walkthrough.workspace")}
        eager
        className="relative"
      />
      <div className="relative mt-3 flex items-center justify-between gap-4 text-[11px] text-muted-foreground">
        <span>{t("landing.walkthrough.workspace")}</span>
        <span className="font-medium text-primary">BLIND · PLAN · TRADE</span>
      </div>
    </div>
  );
}

export function ProductWalkthrough() {
  const { value, language } = useI18n();
  const screenshots = language === "en" ? englishScreenshots : legacyScreenshots;
  const copy = value<Array<{ title: string; description: string; alt: string }>>("landing.walkthrough.steps");
  return (
    <div className="mt-12 space-y-14 sm:mt-14 sm:space-y-20">
      {stepMeta.map((step, index) => (
        <article
          key={step.number}
          className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-center lg:gap-12"
        >
          <div className={index % 2 ? "lg:order-2" : ""}>
            <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.16em] text-primary">
              <span className="tabular-nums">{step.number}</span>
              <span aria-hidden="true" className="h-px w-7 bg-primary/55" />
              <span>{step.stage}</span>
            </div>
            <h3 className="mt-4 break-keep text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              {copy[index]?.title}
            </h3>
            <p className="mt-4 max-w-xl break-keep text-sm leading-7 text-muted-foreground sm:text-base">
              {copy[index]?.description}
            </p>
          </div>
          <ProductScreenshot
            {...screenshots[step.image]}
            alt={copy[index]?.alt ?? ""}
            className={index % 2 ? "lg:order-1" : ""}
          />
        </article>
      ))}
    </div>
  );
}
