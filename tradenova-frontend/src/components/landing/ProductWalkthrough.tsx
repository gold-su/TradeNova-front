import blindChart from "@/assets/landing/product/blind-chart.png";
import blindChartMobile from "@/assets/landing/product/blind-chart-mobile.png";
import scenarioPlan from "@/assets/landing/product/scenario-plan.png";
import nextProgress from "@/assets/landing/product/next-progress.png";
import tradeExecution from "@/assets/landing/product/trade-execution.png";
import aiReview from "@/assets/landing/product/ai-review.png";
import { PRODUCT_WALKTHROUGH_STEPS } from "@/lib/landing/productWalkthrough";

const screenshots = {
  blind: blindChart,
  plan: scenarioPlan,
  next: nextProgress,
  trade: tradeExecution,
  review: aiReview,
} as const;

type ScreenshotProps = {
  src: string;
  mobileSrc?: string;
  alt: string;
  eager?: boolean;
  className?: string;
};

export function ProductScreenshot({
  src,
  mobileSrc,
  alt,
  eager = false,
  className = "",
}: ScreenshotProps) {
  return (
    <figure
      className={`overflow-hidden rounded-xl border border-border/70 bg-[#03100c] shadow-[0_24px_70px_-45px_rgba(0,0,0,0.95)] ${className}`}
    >
      <picture>
        {mobileSrc && <source media="(max-width: 639px)" srcSet={mobileSrc} />}
        <img
          src={src}
          alt={alt}
          width={1260}
          height={680}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="block h-auto w-full"
        />
      </picture>
    </figure>
  );
}

export function HeroProductScreenshot() {
  const step = PRODUCT_WALKTHROUGH_STEPS[0];

  return (
    <div className="relative min-w-0">
      <div
        aria-hidden="true"
        className="absolute -inset-4 rounded-[1.5rem] bg-primary/[0.055] blur-2xl"
      />
      <ProductScreenshot
        src={screenshots[step.image]}
        mobileSrc={blindChartMobile}
        alt={step.imageAlt}
        eager
        className="relative"
      />
      <div className="relative mt-3 flex items-center justify-between gap-4 text-[11px] text-muted-foreground">
        <span>실제 Training Workspace</span>
        <span className="font-medium text-primary">BLIND · PLAN · TRADE</span>
      </div>
    </div>
  );
}

export function ProductWalkthrough() {
  return (
    <div className="mt-12 space-y-14 sm:mt-14 sm:space-y-20">
      {PRODUCT_WALKTHROUGH_STEPS.map((step, index) => (
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
              {step.title}
            </h3>
            <p className="mt-4 max-w-xl break-keep text-sm leading-7 text-muted-foreground sm:text-base">
              {step.description}
            </p>
          </div>
          <ProductScreenshot
            src={screenshots[step.image]}
            mobileSrc={step.image === "blind" ? blindChartMobile : undefined}
            alt={step.imageAlt}
            className={index % 2 ? "lg:order-1" : ""}
          />
        </article>
      ))}
    </div>
  );
}
