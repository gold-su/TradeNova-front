import { useEffect, useRef } from "react";
import { ArrowDown, ArrowRight, BrainCircuit, ChartNoAxesCombined, Check, EyeOff, Flag, ListChecks, MousePointerClick, RefreshCcw, ShieldCheck } from "lucide-react";
import { BetaWaitlistForm } from "@/components/landing/BetaWaitlistForm";
import { Button } from "@/components/ui/button";
import { trackLandingEvent } from "@/lib/landing/analytics";

const steps = [
  { step: "01", name: "BLIND", detail: "종목명 없이 실제 과거 차트를 확인", icon: EyeOff },
  { step: "02", name: "PLAN", detail: "진입 근거와 손절·익절 계획 설정", icon: ListChecks },
  { step: "03", name: "TRADE", detail: "NEXT로 시장을 진행하며 가상 매매", icon: MousePointerClick },
  { step: "04", name: "REVIEW", detail: "AI가 계획 준수와 판단 과정을 복기", icon: BrainCircuit },
  { step: "05", name: "REVEAL", detail: "훈련 종료 후 실제 종목 공개", icon: Flag },
];

const differences = [
  { title: "실제 과거 시장", detail: "임의 생성 차트가 아니라 실제 시장의 흐름을 바탕으로 판단을 훈련합니다.", icon: ChartNoAxesCombined },
  { title: "결과보다 과정", detail: "수익과 손실만 보지 않고 계획, 행동, 당시 근거가 어떻게 연결됐는지 돌아봅니다.", icon: ShieldCheck },
  { title: "반복할수록 보이는 습관", detail: "훈련 기록을 쌓으며 계획 준수와 반복되는 판단 패턴을 확인합니다.", icon: RefreshCcw },
];

const faqs = [
  { question: "실제 주식 데이터인가요?", answer: "실제 과거 시장 데이터를 기반으로 훈련하는 것을 목표로 합니다. 현재 국내주식 시장데이터의 상업적 이용 계약을 검토 중이며, 베타 제공 범위는 최종 라이선스 조건에 따라 확정됩니다." },
  { question: "투자 추천 서비스인가요?", answer: "아닙니다. TradeNova는 종목을 추천하거나 매매를 지시하는 서비스가 아니라, 사용자가 자신의 투자 판단 과정을 훈련하고 복기하는 서비스입니다." },
  { question: "돈을 실제로 투자하나요?", answer: "아닙니다. 과거 차트를 진행하며 가상으로 BUY, SELL, WAIT를 선택합니다. 실제 주문이나 자동매매는 일어나지 않습니다." },
  { question: "AI는 무엇을 분석하나요?", answer: "사전에 세운 계획, 거래 시점의 행동과 근거, 당시 차트의 기술적 사실, 실제 실행 기록을 연결해 판단 과정을 복기합니다." },
  { question: "베타는 언제 시작하나요?", answer: "시장데이터 라이선스 조건과 베타 운영 범위를 확정한 뒤 신청자에게 먼저 안내할 예정입니다." },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function ProductPreview() {
  const bars = [42, 50, 47, 61, 56, 68, 64, 74, 70, 82, 77, 86, 80, 91];
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card/80 shadow-[0_28px_90px_-50px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <div><p className="text-[10px] font-semibold tracking-[0.17em] text-primary">TRAINING WORKSPACE</p><p className="mt-1 text-sm font-medium">Chart 01 · 종목 비공개</p></div>
        <span className="rounded border border-primary/25 bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">BLIND</span>
      </div>
      <div className="grid min-h-[335px] grid-cols-[minmax(0,1fr)_118px] sm:grid-cols-[minmax(0,1fr)_155px]">
        <div className="relative overflow-hidden border-r border-border/60 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:42px_42px] px-4 pb-14 pt-9">
          <div className="flex h-44 items-end gap-2 sm:gap-3" aria-label="블라인드 차트 미리보기">
            {bars.map((height, index) => (
              <span key={index} className="relative flex h-full flex-1 items-end justify-center">
                <span className={`absolute w-px ${index % 3 === 0 ? "bg-red-400/65" : "bg-primary/65"}`} style={{ height: `${Math.max(16, height - 14)}%`, bottom: `${Math.max(2, 88 - height)}%` }} />
                <span className={`relative z-10 w-full max-w-2 rounded-[1px] ${index % 3 === 0 ? "bg-red-400/80" : "bg-primary/80"}`} style={{ height: `${8 + (index % 4) * 3}%`, marginBottom: `${Math.max(2, 84 - height)}%` }} />
              </span>
            ))}
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex gap-2">
            <span className="flex-1 rounded-md border border-primary/30 bg-primary/10 py-2 text-center text-[11px] font-semibold text-primary">BUY</span>
            <span className="flex-1 rounded-md border border-red-400/25 bg-red-400/[0.07] py-2 text-center text-[11px] font-semibold text-red-300">SELL</span>
            <span className="flex-1 rounded-md border border-border bg-background/70 py-2 text-center text-[11px] font-semibold">NEXT →</span>
          </div>
        </div>
        <div className="flex flex-col gap-4 px-3 py-4 sm:px-4">
          <div><p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground">PLAN</p><p className="mt-2 text-xs font-medium leading-5">진입·청산·무효화 조건 기록</p></div>
          <div className="h-px bg-border/60" />
          <div><p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground">ACTION</p><p className="mt-2 text-xs leading-5 text-muted-foreground">계획과 실제 행동 연결</p></div>
          <div className="mt-auto rounded-lg border border-primary/20 bg-primary/[0.06] p-3"><p className="text-[10px] font-semibold tracking-[0.12em] text-primary">AI REVIEW</p><p className="mt-2 text-[11px] leading-5 text-muted-foreground">PLAN · ACTION · FACT · EXECUTION</p></div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const howRef = useRef<HTMLElement>(null);

  useEffect(() => { trackLandingEvent("landing_view"); }, []);
  useEffect(() => {
    const section = howRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return;
    let tracked = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || tracked) return;
      tracked = true;
      trackLandingEvent("how_it_works_view");
      observer.disconnect();
    }, { threshold: 0.35 });
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
        <div className="pointer-events-none absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/[0.07] blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid min-h-[calc(100dvh-57px)] w-full max-w-[1440px] items-center gap-12 px-5 py-14 sm:px-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)] lg:px-14 lg:py-16 xl:gap-20 xl:px-16">
          <div className="max-w-[650px]">
            <p className="mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-primary"><span className="h-px w-7 bg-primary/70" aria-hidden="true" />DECISION TRAINING</p>
            <h1 className="break-keep text-[clamp(2.45rem,5.1vw,4.9rem)] font-semibold leading-[1.08] tracking-[-0.045em]">종목명을 숨기면,<br /><span className="text-primary">당신은 진짜 차트만 보고</span><br />판단할 수 있을까요?</h1>
            <p className="mt-7 max-w-[590px] break-keep text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">실제 과거 시장에서 투자 판단을 훈련하고,<br className="hidden sm:block" /> AI와 함께 내 판단 과정과 매매 습관을 복기하세요.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="h-11 px-6" onClick={() => openBetaForm("hero")}>무료 베타 신청하기 <ArrowRight aria-hidden="true" /></Button>
              <Button size="lg" variant="outline" className="h-11 bg-transparent px-6" onClick={() => scrollToSection("how-it-works")}>어떻게 훈련하나요? <ArrowDown aria-hidden="true" /></Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">투자 추천이나 자동매매가 아닌, 판단 훈련을 위한 서비스입니다.</p>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-10 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div><p className="text-xs font-semibold tracking-[0.17em] text-primary">THE PROBLEM</p><h2 className="mt-4 break-keep text-3xl font-semibold tracking-tight sm:text-4xl">차트를 공부하는 것과,<br />실제로 판단하는 것은 다릅니다.</h2></div>
          <ul className="divide-y divide-border/60 border-y border-border/60">
            {["결과를 알고 보는 차트는 쉽습니다.", "모의투자는 수익률은 보여줘도 판단 과정은 잘 남기지 않습니다.", "계획을 세워도 실제 판단에서는 쉽게 바뀝니다."].map((item) => <li key={item} className="flex gap-3 py-4 text-sm leading-6 text-muted-foreground sm:text-base"><Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> {item}</li>)}
          </ul>
        </div>
      </section>

      <section id="how-it-works" ref={howRef} className="scroll-mt-20 border-y border-border/60 bg-card/35">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-10 lg:py-24">
          <div className="max-w-xl"><p className="text-xs font-semibold tracking-[0.17em] text-primary">HOW IT WORKS</p><h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">판단부터 복기까지, 한 번의 훈련으로</h2></div>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border/70 bg-border/70 md:grid-cols-5">
            {steps.map(({ step, name, detail, icon: Icon }) => <li key={step} className="bg-background p-5 md:min-h-56"><div className="flex items-center justify-between"><span className="text-xs font-semibold tabular-nums text-primary">{step}</span><Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" /></div><h3 className="mt-10 text-sm font-semibold tracking-[0.12em]">{name}</h3><p className="mt-3 break-keep text-sm leading-6 text-muted-foreground">{detail}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-10 lg:py-28">
        <div className="text-center"><p className="text-xs font-semibold tracking-[0.17em] text-primary">WHY TRADENOVA</p><h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">수익률표에서 놓치는 것을 훈련합니다</h2></div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">{differences.map(({ title, detail, icon: Icon }) => <article key={title} className="rounded-xl border border-border/70 bg-card/55 p-6"><Icon className="h-5 w-5 text-primary" aria-hidden="true" /><h3 className="mt-6 text-lg font-semibold">{title}</h3><p className="mt-3 break-keep text-sm leading-6 text-muted-foreground">{detail}</p></article>)}</div>
      </section>

      <section className="border-y border-border/60 bg-card/35">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:py-24">
          <div><p className="text-xs font-semibold tracking-[0.17em] text-primary">PRODUCT FLOW</p><h2 className="mt-4 break-keep text-3xl font-semibold tracking-tight sm:text-4xl">차트를 보고, 계획하고,<br />행동한 뒤 복기합니다</h2><p className="mt-5 break-keep text-sm leading-7 text-muted-foreground sm:text-base">Blind Chart에서 시작해 BUY·SELL·WAIT를 선택하고, NEXT로 시장을 진행합니다. 훈련이 끝나면 종목을 공개하고 AI Review로 계획과 행동을 연결해 봅니다.</p></div>
          <ProductPreview />
        </div>
      </section>

      <section id="beta-apply" className="scroll-mt-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-28">
          <div className="lg:sticky lg:top-24 lg:self-start"><p className="text-xs font-semibold tracking-[0.17em] text-primary">PRIVATE BETA</p><h2 className="mt-4 break-keep text-3xl font-semibold tracking-tight sm:text-4xl">TradeNova의 첫 훈련에<br />참여해보세요</h2><p className="mt-5 max-w-lg break-keep text-sm leading-7 text-muted-foreground sm:text-base">아직 결제는 받지 않습니다. 베타 범위가 확정되면 신청자에게 먼저 안내하고, 제품을 직접 사용한 의견을 듣겠습니다.</p><div className="mt-8 space-y-3 text-sm text-muted-foreground">{["무료 베타 오픈 소식 우선 안내", "최소한의 질문으로 참여 의향 확인", "시장데이터 라이선스 범위 확정 후 제공"].map((item) => <p key={item} className="flex gap-3"><Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{item}</p>)}</div></div>
          <div className="rounded-xl border border-border/70 bg-card/70 p-5 sm:p-7"><BetaWaitlistForm /></div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-card/30">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-10 lg:py-24">
          <p className="text-center text-xs font-semibold tracking-[0.17em] text-primary">FAQ</p><h2 className="mt-4 text-center text-3xl font-semibold tracking-tight">궁금한 점을 먼저 답해드릴게요</h2>
          <div className="mt-10 divide-y divide-border/60 border-y border-border/60">{faqs.map(({ question, answer }) => <details key={question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium marker:hidden">{question}<span className="text-primary transition group-open:rotate-45" aria-hidden="true">＋</span></summary><p className="mt-3 max-w-3xl break-keep text-sm leading-7 text-muted-foreground">{answer}</p></details>)}</div>
        </div>
      </section>

      <footer className="border-t border-border/60 px-5 py-8 text-center text-xs leading-5 text-muted-foreground"><p>TradeNova는 투자 추천·자문·자동매매 서비스가 아닌 투자 판단 훈련 서비스입니다.</p><p className="mt-1">현재 국내주식 시장데이터의 상업적 이용 계약을 검토 중이며, 베타 오픈 범위는 최종 라이선스 조건에 따라 확정됩니다.</p></footer>
    </main>
  );
}
