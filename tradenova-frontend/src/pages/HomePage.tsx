import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const decisionLoop = [
  { step: "01", name: "BLIND", detail: "종목 정보 없이 차트를 관찰" },
  { step: "02", name: "PLAN", detail: "진입 · 청산 · 무효화 조건을 기록" },
  { step: "03", name: "EXECUTE", detail: "계획과 실제 행동을 연결" },
  { step: "04", name: "MEASURE", detail: "실행과 결과를 함께 확인" },
  { step: "05", name: "REVIEW", detail: "AI가 계획 · 행동 · 당시 근거를 비교" },
  { step: "06", name: "RE-TRAIN", detail: "복기한 판단을 다음 훈련에 반영" },
];

const features = [
  { name: "BLIND CHART", detail: "종목을 가리고 판단" },
  { name: "PLAN & EXECUTE", detail: "계획과 행동을 연결" },
  { name: "AI REVIEW", detail: "결과가 아닌 과정을 복기" },
];

export default function HomePage() {
  const userEmail = localStorage.getItem("userEmail");
  const userNickname = localStorage.getItem("userNickname");
  const displayName = userNickname || userEmail;

  return (
    <main className="min-h-[calc(100dvh-57px)] bg-background">
      <section className="mx-auto flex w-full max-w-[1440px] flex-col px-6 pb-12 pt-16 sm:px-10 lg:min-h-[calc(100dvh-57px)] lg:justify-center lg:px-14 lg:pb-12 lg:pt-12 xl:px-16">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-16 xl:gap-20">
          <div className="max-w-[650px]">
            <p className="mb-7 flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-primary">
              <span className="h-px w-7 bg-primary/70" aria-hidden="true" />
              DECISION TRAINING
            </p>

            {displayName && (
              <p className="mb-5 text-sm text-muted-foreground">
                Welcome back,{" "}
                <span className="font-medium text-foreground">
                  {displayName}
                </span>
              </p>
            )}

            <h1 className="text-[clamp(2.75rem,4.6vw,5rem)] font-semibold leading-[1.07] tracking-[-0.045em] text-foreground">
              Train the decision.
              <br />
              <span className="text-primary">Not the outcome.</span>
            </h1>

            <p className="mt-8 break-keep text-base font-medium leading-relaxed text-foreground/90 sm:text-xl">
              결과가 아니라 투자 판단 과정을 훈련하세요.
            </p>
            <p className="mt-2 max-w-[520px] break-keep text-sm leading-7 text-muted-foreground sm:text-base">
              블라인드 차트에서 계획하고, 실행하고, AI로 판단 과정을 복기합니다.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-11 rounded-lg px-6 text-sm font-semibold shadow-none"
              >
                <Link to="/training">
                  훈련 시작 <ArrowRight className="ml-1" aria-hidden="true" />
                </Link>
              </Button>
              {!displayName && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-11 rounded-lg border-border/80 bg-transparent px-5 text-sm shadow-none hover:bg-muted/50"
                >
                  <Link to="/signup">계정 만들기</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="min-w-0 rounded-xl border border-border/80 bg-card/70 px-6 py-6 shadow-[0_24px_80px_-52px_rgba(0,0,0,0.8)] sm:px-8 sm:py-7">
            <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-5">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-primary">
                  THE TRAINING LOOP
                </p>
                <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                  판단의 과정을 훈련합니다
                </h2>
              </div>
              <span className="mt-0.5 shrink-0 text-xs tabular-nums text-muted-foreground">
                01 — 06
              </span>
            </div>

            <ol className="divide-y divide-border/45">
              {decisionLoop.map(({ step, name, detail }) => (
                <li
                  key={step}
                  className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 py-3 sm:grid-cols-[2.25rem_6.5rem_minmax(0,1fr)] sm:items-baseline sm:gap-3.5"
                >
                  <span className="text-xs font-medium tabular-nums text-primary/85">
                    {step}
                  </span>
                  <span className="text-xs font-semibold tracking-[0.12em] text-foreground">
                    {name}
                  </span>
                  <span className="col-start-2 text-[13px] leading-5 text-muted-foreground sm:col-start-3">
                    {detail}
                  </span>
                </li>
              ))}
            </ol>

            <div className="border-t border-border/70 pt-4 text-xs leading-5 text-muted-foreground">
              AI REVIEW <span className="mx-2 text-primary/70">/</span> PLAN ·
              ACTION · FACT · EXECUTION
            </div>
          </div>
        </div>

        <div className="mt-16 grid border-t border-border/70 pt-6 sm:grid-cols-3 lg:mt-20">
          {features.map(({ name, detail }, index) => (
            <div
              key={name}
              className={`py-3 sm:py-1 ${index > 0 ? "border-t border-border/40 sm:border-l sm:border-t-0 sm:pl-7" : ""}`}
            >
              <p className="text-xs font-semibold tracking-[0.11em] text-foreground">
                {name}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
