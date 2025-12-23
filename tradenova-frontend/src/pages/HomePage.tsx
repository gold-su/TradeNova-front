// src/pages/HomePage.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HomePage() {
    return (
        <main>
            <section className="relative overflow-hidden">
                {/* Background media */}
                <div className="absolute inset-0">
                    {/* 비디오 추천 (public/hero.mp4) */}
                    <video
                        className="h-full w-full object-cover opacity-80"
                        autoPlay
                        muted
                        loop
                        playsInline
                    >
                        <source src="/hero.mp4" type="video/mp4" />
                    </video>

                    {/* overlay (가독성) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/30" />
                    {/* 별/노이즈 느낌 추가 */}
                    <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.25)_0,transparent_35%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.18)_0,transparent_40%),radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.12)_0,transparent_40%)]" />
                </div>

                {/* Content */}
                <div className="relative mx-auto flex min-h-[72vh] max-w-6xl items-center px-4 py-16">
                    <div className="max-w-2xl">
                        <p className="mb-3 inline-flex items-center rounded-full border border-border/60 bg-background/30 px-3 py-1 text-xs text-muted-foreground">
                            Where traders are reborn
                        </p>

                        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                            Your next trade{" "}
                            <span className="text-primary">starts</span>{" "}
                            with training.
                        </h1>

                        <p className="mt-5 text-base text-muted-foreground md:text-lg">
                            랜덤 차트로 매수/매도 판단을 훈련하고, 매매일지와 복기로 실력을 올려.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button asChild className="rounded-full px-6">
                                <Link to="/training">Start training</Link>
                            </Button>
                            <Button variant="outline" asChild className="rounded-full px-6 bg-background/20">
                                <Link to="/signup">Create account</Link>
                            </Button>
                        </div>

                        <div className="mt-10 grid grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                            <div className="rounded-xl border border-border/60 bg-background/20 p-4">
                                랜덤 차트
                                <div className="mt-1 text-xs opacity-80">실전 감각 훈련</div>
                            </div>
                            <div className="rounded-xl border border-border/60 bg-background/20 p-4">
                                매매일지
                                <div className="mt-1 text-xs opacity-80">규칙 기반 기록</div>
                            </div>
                            <div className="rounded-xl border border-border/60 bg-background/20 p-4">
                                복기
                                <div className="mt-1 text-xs opacity-80">뉴스/재무/AI</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 아래 섹션은 나중에 Features/How it works/FAQ로 확장 */}
        </main>
    );
}
