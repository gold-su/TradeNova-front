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
import { AI_REVIEW_POINTS } from "@/lib/landing/productWalkthrough";

const problemStatements = [
  "결과를 알고 보는 차트와 미래를 모른 채 내리는 판단은 다릅니다.",
  "수익과 손실만으로는 당시의 근거와 리스크 기준을 알 수 없습니다.",
  "계획을 먼저 기록해야 실제 행동과 비교하며 복기할 수 있습니다.",
] as const;

const tradeNovaDifferences = [
  "종목을 숨긴 상태에서 차트 자체를 먼저 읽습니다.",
  "행동하기 전에 판단 근거와 계획을 기록합니다.",
  "NEXT로 미래 정보를 제한하고 매 단계 직접 판단합니다.",
  "AI Review가 결과보다 계획과 실행의 연결을 복기합니다.",
] as const;

const backtestTraits = [
  "최종 수익률과 결과를 중심으로 보기 쉽습니다.",
  "이미 아는 결과가 판단에 영향을 줄 수 있습니다.",
  "당시의 근거와 계획을 별도로 남기지 않는 경우가 많습니다.",
] as const;

const audiences = [
  {
    title: "차트 공부를 실제 판단으로 연결하고 싶은 분",
    detail: "지표를 아는 것에서 멈추지 않고, 제한된 정보로 직접 결정하는 연습이 필요한 분",
    icon: EyeOff,
  },
  {
    title: "계획과 실행이 자주 달라지는 분",
    detail: "진입·청산 기준을 먼저 적고 실제 행동과 비교하며 계획 준수를 돌아보고 싶은 분",
    icon: ListChecks,
  },
  {
    title: "수익률보다 판단 습관을 점검하고 싶은 분",
    detail: "한 번의 결과보다 반복되는 근거, 실행과 리스크 관리 패턴을 복기하고 싶은 분",
    icon: CircleDot,
  },
] as const;

const faqs = [
  {
    question: "실제 주식 데이터인가요?",
    answer:
      "실제 과거 시장 데이터를 기반으로 훈련하는 것을 목표로 합니다. 베타 제공 범위는 시장데이터 라이선스 조건에 따라 확정됩니다.",
  },
  {
    question: "투자 추천 서비스인가요?",
    answer:
      "아닙니다. TradeNova는 종목 추천이나 투자 자문이 아니라, 사용자의 투자 판단 과정을 훈련하고 복기하는 서비스입니다.",
  },
  {
    question: "돈을 실제로 투자하나요?",
    answer:
      "아닙니다. 과거 차트를 기반으로 가상으로 판단하고 훈련하며, 실제 주문이나 자동매매는 발생하지 않습니다.",
  },
  {
    question: "AI는 무엇을 분석하나요?",
    answer:
      "사전에 세운 계획, 거래 시점의 행동과 근거, 실제 실행 기록을 연결해 판단 과정을 복기합니다.",
  },
  {
    question: "베타는 언제 시작하나요?",
    answer:
      "시장데이터 라이선스 조건과 베타 운영 범위가 확정되면 신청자에게 우선 안내할 예정입니다.",
  },
] as const;

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function HomePage() {
  const howRef = useRef<HTMLElement>(null);

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
              TRAIN THE DECISION. NOT THE OUTCOME.
            </p>
            <h1 className="break-keep text-[2.35rem] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-[3rem] lg:text-[3.25rem] xl:text-[3.65rem]">
              <span className="block">투자 결과가 아니라,</span>
              <span className="block text-primary">판단 과정을 훈련합니다.</span>
            </h1>
            <p className="mt-7 max-w-[560px] break-keep text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              종목을 모른 채 실제 과거 차트를 보고, 계획부터 실행과 복기까지 반복하는 투자 판단 훈련 SaaS입니다.
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
                무료 베타 신청 <ArrowRight aria-hidden="true" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 bg-transparent px-6"
                onClick={() => scrollToSection("how-it-works")}
              >
                제품 사용 방식 보기 <ArrowDown aria-hidden="true" />
              </Button>
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              투자 추천이나 자동매매가 아닌, 판단 과정을 기록하고 복기하는 훈련 서비스입니다.
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
            <p className="text-xs font-semibold tracking-[0.17em] text-primary">WHY PRACTICE</p>
            <h2 className="mt-4 break-keep text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              결과를 본 뒤의 설명은,
              <br />그 순간의 판단과 다릅니다.
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
            <p className="text-xs font-semibold tracking-[0.17em] text-primary">PRODUCT WALKTHROUGH</p>
            <h2 className="mt-4 break-keep text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              먼저 판단하고, 직접 행동한 뒤 복기합니다
            </h2>
            <p className="mt-5 max-w-xl break-keep text-sm leading-7 text-muted-foreground sm:text-base">
              실제 제품 화면으로 TradeNova의 한 번의 훈련이 어떻게 이어지는지 확인해보세요.
            </p>
          </div>
          <ProductWalkthrough />
          <div className="mt-14 flex justify-center sm:mt-16">
            <Button size="lg" className="h-11 px-6" onClick={() => openBetaForm("walkthrough")}>
              무료 베타 신청 <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-10 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.17em] text-primary">A DIFFERENT PRACTICE LOOP</p>
          <h2 className="mt-4 break-keep text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            결과만 확인하는 연습과는 흐름이 다릅니다
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <article className="rounded-xl border border-primary/25 bg-primary/[0.045] p-6 sm:p-7">
            <p className="text-xs font-semibold tracking-[0.15em] text-primary">TRADENOVA</p>
            <h3 className="mt-3 text-lg font-semibold">판단을 먼저 남기는 훈련</h3>
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
            <p className="text-xs font-semibold tracking-[0.15em] text-muted-foreground">SIMPLE BACKTEST REVIEW</p>
            <h3 className="mt-3 text-lg font-semibold">결과를 중심으로 보는 방식</h3>
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
              <p className="text-xs font-semibold tracking-[0.17em] text-primary">AI REVIEW</p>
            </div>
            <h2 className="mt-4 break-keep text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              수익이 났다는 이유만으로 좋은 판단이 되지는 않습니다
            </h2>
            <p className="mt-5 break-keep text-sm leading-7 text-muted-foreground sm:text-base">
              AI가 정답이나 매수·매도 시점을 알려주는 대신, 사용자가 남긴 계획과 실제 행동을 연결해 복기합니다.
            </p>
            <ul className="mt-7 space-y-3">
              {AI_REVIEW_POINTS.map((item) => (
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
            alt="계획과 실행을 바탕으로 전체 요약과 잘 본 점, 놓친 점을 보여주는 TradeNova AI Review"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-10 lg:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.17em] text-primary">WHO IT IS FOR</p>
          <h2 className="mt-4 break-keep text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            이런 판단 훈련이 필요한 분을 위해 만들고 있습니다
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {audiences.map(({ title, detail, icon: Icon }) => (
            <article key={title} className="rounded-xl border border-border/70 bg-card/55 p-6">
              <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
              <h3 className="mt-6 break-keep text-lg font-semibold leading-7">{title}</h3>
              <p className="mt-3 break-keep text-sm leading-6 text-muted-foreground">{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="beta-apply" className="scroll-mt-20 border-t border-border/60 bg-card/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold tracking-[0.17em] text-primary">PRIVATE BETA</p>
            <h2 className="mt-4 break-keep text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              TradeNova 베타에 먼저 참여해보세요
            </h2>
            <p className="mt-5 max-w-lg break-keep text-sm leading-7 text-muted-foreground sm:text-base">
              아직 결제는 받지 않습니다. 실제 훈련 흐름을 먼저 경험하고 제품 개선을 위한 의견을 남길 수 있습니다.
            </p>
            <div className="mt-7 space-y-3 text-sm text-muted-foreground">
              {["무료 베타 오픈 소식 우선 안내", "실제 사용 피드백 반영 기회", "시장데이터 제공 범위는 라이선스 확정 후 안내"].map((item) => (
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
            궁금한 점을 먼저 답해드릴게요
          </h2>
          <div className="mt-8 divide-y divide-border/60 border-y border-border/60">
            {faqs.map(({ question, answer }) => (
              <details key={question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium marker:hidden">
                  {question}
                  <span aria-hidden="true" className="text-primary transition group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-3 max-w-3xl break-keep text-sm leading-7 text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 px-5 py-8 text-center text-xs leading-5 text-muted-foreground">
        <p>TradeNova는 투자 추천·자문·자동매매 서비스가 아닌 투자 판단 훈련 서비스입니다.</p>
        <p className="mt-1">현재 국내주식 시장데이터의 상업적 이용 계약을 검토 중이며, 베타 오픈 범위는 최종 라이선스 조건에 따라 확정됩니다.</p>
      </footer>
    </main>
  );
}
