// src/pages/HomePage.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const userEmail = localStorage.getItem("userEmail");
  const userNickname = localStorage.getItem("userNickname");
  const displayName = userNickname || userEmail;

  return (
    <main>
      <section className="relative overflow-hidden bg-black">
        {/* Background media */}
        <div className="absolute inset-0 ">
          <img
            src="/tradeNova.gif"
            alt="TradeNova hero banner"
            className="h-full w-full object-contain"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-black/10" />
        </div>

        {/* Content */}
        <div className="relative mx-auto flex min-h-[72vh] max-w-6xl items-center px-4 py-16">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center rounded-full border border-border/60 bg-background/30 px-3 py-1 text-xs text-muted-foreground">
              Where traders are reborn
            </p>

            {displayName && (
              <p className="mb-4 text-sm text-white/80">
                Welcome back,{" "}
                <span className="font-semibold text-white">{displayName}</span>
              </p>
            )}

            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
              Your next trade <span className="text-primary">starts</span> with
              training.
            </h1>

            <p className="mt-5 text-base text-white/70 md:text-lg">
              준비되지 않은 투자를 막는다.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-6">
                <Link to="/training">Start training</Link>
              </Button>

              {!displayName && (
                <Button
                  variant="outline"
                  asChild
                  className="rounded-full px-6 bg-background/20"
                >
                  <Link to="/signup">Create account</Link>
                </Button>
              )}
            </div>

            <div className="mt-10 grid grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-background/20 p-4 text-white/90">
                랜덤 차트
                <div className="mt-1 text-xs opacity-80">실전 감각 훈련</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/20 p-4 text-white/90">
                매매일지
                <div className="mt-1 text-xs opacity-80">규칙 기반 기록</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/20 p-4 text-white/90">
                복기
                <div className="mt-1 text-xs opacity-80">뉴스/재무/AI</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
