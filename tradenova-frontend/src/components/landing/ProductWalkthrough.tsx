import koreanWorkspace from "@/assets/landing/product/ko/training-workspace.png";
import koreanBlindChart from "@/assets/landing/product/ko/blind-chart.png";
import koreanScenarioPlan from "@/assets/landing/product/ko/scenario-plan.png";
import koreanNextProgress from "@/assets/landing/product/ko/next-progress.png";
import koreanTradeExecution from "@/assets/landing/product/ko/trade-execution.png";
import koreanAiReview from "@/assets/landing/product/ko/ai-review.png";
import trainingWorkspace from "@/assets/landing/product/en/training-workspace.png";
import blindChart from "@/assets/landing/product/en/blind-chart.png";
import scenarioPlan from "@/assets/landing/product/en/scenario-plan.png";
import nextProgress from "@/assets/landing/product/en/next-progress.png";
import tradeExecution from "@/assets/landing/product/en/trade-execution.png";
import aiReview from "@/assets/landing/product/en/ai-review.png";
import { useI18n } from "@/i18n/LanguageProvider";

// Native sizes reserve aspect ratios; displayWidth can enlarge compact control captures.
const englishScreenshots = {
  workspace: { src: trainingWorkspace, width: 1920, height: 906 },
  blind: { src: blindChart, width: 1330, height: 716 },
  plan: { src: scenarioPlan, width: 679, height: 743 },
  next: { src: nextProgress, width: 935, height: 637, displayWidth: 420 },
  trade: { src: tradeExecution, width: 491, height: 764 },
  review: { src: aiReview, width: 593, height: 705 },
} as const;

const koreanScreenshots = {
  workspace: { src: koreanWorkspace, width: 1920, height: 910 },
  blind: { src: koreanBlindChart, width: 1327, height: 615 },
  plan: { src: koreanScenarioPlan, width: 680, height: 745 },
  next: { src: koreanNextProgress, width: 939, height: 640, displayWidth: 420 },
  trade: { src: koreanTradeExecution, width: 494, height: 754 },
  review: { src: koreanAiReview, width: 588, height: 641 },
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
  displayWidth?: number;
  eager?: boolean;
  className?: string;
};

export function ProductScreenshot({
  src,
  mobileSrc,
  alt,
  width = 1200,
  height = 750,
  displayWidth = width,
  eager = false,
  className = "",
}: ScreenshotProps) {
  return (
    <figure
      className={`mx-auto w-full overflow-hidden rounded-xl border border-border/70 bg-[#06100d] p-1 shadow-[0_22px_58px_-42px_rgba(0,0,0,0.92)] sm:p-1.5 ${className}`}
      style={{ maxWidth: displayWidth + 14 }}
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
  const screenshots = language === "en" ? englishScreenshots : koreanScreenshots;

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
  const screenshots = language === "en" ? englishScreenshots : koreanScreenshots;
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
