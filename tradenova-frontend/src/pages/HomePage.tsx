import { useEffect, useRef } from "react";
import {
  ArrowDown,
  ArrowRight,
  BrainCircuit,
  Check,
  CircleDot,
  EyeOff,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import aiReviewScreenshot from "@/assets/landing/product/ai-review.png";
import aiReviewMobileScreenshot from "@/assets/landing/product/ai-review-mobile.png";
import { BetaWaitlistForm } from "@/components/landing/BetaWaitlistForm";
import {
  HeroProductScreenshot,
  ProductScreenshot,
  ProductWalkthrough,
} from "@/components/landing/ProductWalkthrough";
import { Button } from "@/components/ui/button";
import { trackLandingEvent } from "@/lib/landing/analytics";
import { useI18n } from "@/i18n/LanguageProvider";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function HomePage() {
  const { t, value } = useI18n();
  const howRef = useRef<HTMLElement>(null);
  const problemStatements = value<string[]>("landing.problem.items");
  const tradeNovaDifferences = value<string[]>("landing.difference.ours");
  const backtestTraits = value<string[]>("landing.difference.other");
  const audienceCopy = value<Array<{ title: string; detail: string }>>("landing.audience.items");
  const audienceIcons = [EyeOff, ListChecks, CircleDot] as const;
  const faqs = value<Array<{ q: string; a: string }>>("landing.faq.items");
  const reviewPoints = value<string[]>("landing.ai.points");

  useEffect(() => {
    trackLandingEvent("landing_view");
  }, []);

  useEffect(() => {
    const section = howRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return;

    let tracked = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || tracked) return;
        tracked = true;
        trackLandingEvent("how_it_works_view");
        observer.disconnect();
      },
      { threshold: 0.25 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const openBetaForm = (placement: string) => {
    trackLandingEvent("hero_beta_cta_click", { placement });
    scrollToSection("beta-apply");
  };

  return (
    <main className="overflow-hidden bg-background">
      <section className="relative border-b border-border/60">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/[0.07] blur-3xl"
        />
        <div className="relative mx-auto grid min-h-[calc(100dvh-57px)] w-full max-w-[1440px] items-center gap-12 px-5 py-14 sm:px-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(540px,1.18fr)] lg:gap-12 lg:px-14 lg:py-16 xl:gap-16 xl:px-16">
          <div className="min-w-0 max-w-[590px]">
            <p className="mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-primary">
              <span aria-hidden="true" className="h-px w-7 bg-primary/70" />
              {t("landing.hero.eyebrow")}
            </p>
            <h1 className="break-keep text-[2.35rem] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-[3rem] lg:text-[3.25rem] xl:text-[3.65rem]">
              <span className="block">{t("landing.hero.line1")}</span>
              <span className="block text-primary">{t("landing.hero.line2")}</span>
            </h1>
            <p className="mt-7 max-w-[560px] break-keep text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              {t("landing.hero.body")}
            </p>
            <p className="mt-5 text-xs font-semibold tracking-[0.12em] text-foreground/80 sm:text-sm">
              Blind Chart <span className="px-1 text-primary">→</span> Plan
              <span className="px-1 text-primary">→</span> Trade
              <span className="px-1 text-primary">→</span> AI Review
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-11 px-6"
                onClick={() => openBetaForm("hero")}
              >
                {t("landing.hero.primary")} <ArrowRight aria-hidden="true" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 bg-transparent px-6"
                onClick={() => scrollToSection("how-it-works")}
              >
                {t("landing.hero.secondary")} <ArrowDown aria-hidden="true" />
              </Button>
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              {t("landing.hero.disclaimer")}
            </p>
          </div>
          <HeroProductScreenshot />
        </div>
      </section>

      <section
        id="service-intro"
        className="scroll-mt-20 mx-auto max-w-6xl px-5 py-16 sm:px-10 lg:py-20"
      >
        <div className="grid gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <div className="max-w-lg">
            <p className="text-xs font-semibold tracking-[0.17em] text-primary">{t("landing.problem.eyebrow")}</p>
            <h2 className="mt-4 break-keep text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {t("landing.problem.title")}
            </h2>
          </div>
          <ul className="divide-y divide-border/60 border-y border-border/60">
            {problemStatements.map((item) => (
              <li
                key={item}
                className="flex gap-3 py-4 text-sm leading-6 text-muted-foreground sm:text-base"
              >
                <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <span className="break-keep">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="how-it-works"
        ref={howRef}
        className="scroll-mt-20 relative border-y border-border/60 bg-card/35"
      >
        <span id="product-preview" className="absolute top-0 scroll-mt-20" aria-hidden="true" />
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-10 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.17em] text-primary">{t("landing.walkthrough.eyebrow")}</p>
            <h2 className="mt-4 break-keep text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {t("landing.walkthrough.title")}
            </h2>
            <p className="mt-5 max-w-xl break-keep text-sm leading-7 text-muted-foreground sm:text-base">
              {t("landing.walkthrough.description")}
            </p>
          </div>
          <ProductWalkthrough />
          <div className="mt-14 flex justify-center sm:mt-16">
            <Button size="lg" className="h-11 px-6" onClick={() => openBetaForm("walkthrough")}>
              {t("landing.walkthrough.cta")} <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-10 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.17em] text-primary">{t("landing.difference.eyebrow")}</p>
          <h2 className="mt-4 break-keep text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {t("landing.difference.title")}
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <article className="rounded-xl border border-primary/25 bg-primary/[0.045] p-6 sm:p-7">
            <p className="text-xs font-semibold tracking-[0.15em] text-primary">{t("landing.difference.oursLabel")}</p>
            <h3 className="mt-3 text-lg font-semibold">{t("landing.difference.oursTitle")}</h3>
            <ul className="mt-5 space-y-3">
              {tradeNovaDifferences.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-foreground/85">
                  <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span className="break-keep">{item}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-xl border border-border/70 bg-card/45 p-6 sm:p-7">
            <p className="text-xs font-semibold tracking-[0.15em] text-muted-foreground">{t("landing.difference.otherLabel")}</p>
            <h3 className="mt-3 text-lg font-semibold">{t("landing.difference.otherTitle")}</h3>
            <ul className="mt-5 space-y-3">
              {backtestTraits.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
                  <span className="break-keep">{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/35">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:py-20">
          <div>
            <div className="flex items-center gap-3">
              <BrainCircuit aria-hidden="true" className="h-5 w-5 text-primary" />
              <p className="text-xs font-semibold tracking-[0.17em] text-primary">{t("landing.ai.eyebrow")}</p>
            </div>
            <h2 className="mt-4 break-keep text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {t("landing.ai.title")}
            </h2>
            <p className="mt-5 break-keep text-sm leading-7 text-muted-foreground sm:text-base">
              {t("landing.ai.body")}
            </p>
            <ul className="mt-7 space-y-3">
              {reviewPoints.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-foreground/85">
                  <ShieldCheck aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <ProductScreenshot
            src={aiReviewScreenshot}
            mobileSrc={aiReviewMobileScreenshot}
            alt={t("landing.ai.alt")}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-10 lg:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.17em] text-primary">{t("landing.audience.eyebrow")}</p>
          <h2 className="mt-4 break-keep text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {t("landing.audience.title")}
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {audienceCopy.map(({ title, detail }, index) => {
            const Icon = audienceIcons[index] ?? CircleDot;
            return (
            <article key={title} className="rounded-xl border border-border/70 bg-card/55 p-6">
              <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
              <h3 className="mt-6 break-keep text-lg font-semibold leading-7">{title}</h3>
              <p className="mt-3 break-keep text-sm leading-6 text-muted-foreground">{detail}</p>
            </article>
          );})}
        </div>
      </section>

      <section id="beta-apply" className="scroll-mt-20 border-t border-border/60 bg-card/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold tracking-[0.17em] text-primary">{t("landing.beta.eyebrow")}</p>
            <h2 className="mt-4 break-keep text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {t("landing.beta.title")}
            </h2>
            <p className="mt-5 max-w-lg break-keep text-sm leading-7 text-muted-foreground sm:text-base">
              {t("landing.beta.body")}
            </p>
            <div className="mt-7 space-y-3 text-sm text-muted-foreground">
              {value<string[]>("landing.beta.benefits").map((item) => (
                <p key={item} className="flex gap-3">
                  <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
                  {item}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/70 p-5 sm:p-7">
            <BetaWaitlistForm />
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 border-t border-border/60">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-10 lg:py-20">
          <p className="text-center text-xs font-semibold tracking-[0.17em] text-primary">FAQ</p>
          <h2 className="mt-4 break-keep text-center text-3xl font-semibold leading-tight tracking-tight">
            {t("landing.faq.title")}
          </h2>
          <div className="mt-8 divide-y divide-border/60 border-y border-border/60">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium marker:hidden">
                  {q}
                  <span aria-hidden="true" className="text-primary transition group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-3 max-w-3xl break-keep text-sm leading-7 text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 px-5 py-8 text-center text-xs leading-5 text-muted-foreground">
        <p>{t("landing.footer.disclaimer")}</p>
        <p className="mt-1">{t("landing.footer.license")}</p>
      </footer>
    </main>
  );
}
