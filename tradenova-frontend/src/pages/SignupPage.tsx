import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { M } from "../i18n/messages";
import { getLocale } from "../i18n/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type Step = "start" | "email" | "details" | "verify";

export default function SignupPage() {
    const nav = useNavigate();
    const t = M[getLocale()];

    const [step, setStep] = useState<Step>("start");

    const [email, setEmail] = useState("");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");

    const [code, setCode] = useState("");
    const [devCode, setDevCode] = useState<string | null>(null); //값이 문자열일 수도 있고, null 일 수도 있다. 초기값은 (null)

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const flow = t.signupFlow[step];

    const disabledEmail = loading || !email.trim();  //이메일 보내기 버튼 비활성화 조건, 로딩 중이거나, 이메일이 비어있으면(disabled)
    const disabledDetails = //회원가입(상세정보) 버튼 비활성화 조건
        loading || !email.trim() || !nickname.trim() || !password.trim(); //이메일 / 닉네임 / 비밀번호 중 하나라도 비어있으면
    const disabledVerify = loading || !email.trim() || !code.trim(); //이메일 인증 버튼 비활성화 조건, 로딩 중, 이메일 or 인증 코드 비어있으면

    const submitSignup = async () => { //회원가입 버튼 클릭 시 실행되는 함수
        setErrorMsg("");
        setLoading(true);
        try {
            await authApi.signup({  //회원가입 API 호출
                email: email.trim(),    //email / nickname 공백 제거
                nickname: nickname.trim(),
                password,
            });

            const res = await authApi.sendEmailVerification({ email: email.trim() }); //이메일 인증 코드 발급 요청
            setDevCode(res.devCode ?? null); //개발용 인증 코드 저장
            setStep("verify"); //verify 단계로 이동
        } catch (e: any) {  //백엔드 에러 메시지 우선순위로 추출해서 화면에 표시
            const msg =
                e?.response?.data?.message ||
                e?.response?.data?.errors?.email ||
                e?.response?.data?.errors?.nickname ||
                e?.response?.data?.errors?.password ||
                "회원가입 실패";
            setErrorMsg(msg);
        } finally {
            setLoading(false); //성공/실패 상관없이 로딩 종료
        }
    };

    const verifyEmail = async () => { //이메일 인증 버튼 클릭 시 실행
        setErrorMsg(""); //에러 초기화
        setLoading(true); //로딩 시작
        try {
            await authApi.verifyEmail({ email: email.trim(), code: code.trim() });//이메일 + 인증 코드 검증 API 호출

            // 인증 완료 → 로그인으로 이동 + 메시지/이메일 전달
            nav("/login", {
                state: {
                    verified: true,
                    email: email.trim(),
                    msg: "인증 완료! 이제 로그인하세요.",
                },
            });
        } catch (e: any) { //실패 시 서버 메시지 표시
            const msg = e?.response?.data?.message || "인증 실패";
            setErrorMsg(msg);
        } finally {
            setLoading(false); //로딩 종료
        }
    };

    const resendCode = async () => { //인증 코드 재전송 버튼 클릭 시 실행
        setErrorMsg(""); //에러 초기화
        setLoading(true); //로딩 시작
        try {
            const res = await authApi.sendEmailVerification({ email: email.trim() }); //이메일 인증 코드 재발급 요청
            setDevCode(res.devCode ?? null); //개발용 인증 코드 저장(있으면), 없으면 null
        } catch (e: any) {
            setErrorMsg("인증 코드 재전송 실패"); //실패 시 공통 에러 메시지 표시
        } finally {
            setLoading(false); //로딩 종료
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-background p-6 overflow-hidden">
            <div
                aria-hidden
                className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[520px]
                   -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
            />

            <Card className="relative z-10 w-full max-w-md bg-card border-border rounded-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">{flow.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{flow.subtitle}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                    {errorMsg && (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            {errorMsg}
                        </div>
                    )}

                    {/* start */}
                    {step === "start" && (
                        <>
                            <Button className="w-full h-11 rounded-xl" variant="secondary" disabled>
                                Continue with Google (준비중)
                            </Button>

                            <Button
                                className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:opacity-90"
                                onClick={() => setStep("email")}
                            >
                                Continue with email
                            </Button>

                            <div className="pt-2 text-sm text-muted-foreground">
                                {t.haveAccount}{" "}
                                <Link to="/login" className="text-primary font-semibold">
                                    {t.goLogin}
                                </Link>
                            </div>
                        </>
                    )}

                    {/* email */}
                    {step === "email" && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="email">{t.email}</Label>
                                <Input
                                    id="email"
                                    className="h-11 rounded-xl bg-background/40 border-border/70
                             focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                                    placeholder="example@domain.com"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !disabledEmail) setStep("details");
                                    }}
                                />
                            </div>

                            <Button
                                className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:opacity-90"
                                disabled={disabledEmail}
                                onClick={() => setStep("details")}
                            >
                                Continue
                            </Button>

                            <button
                                type="button"
                                className="text-sm text-muted-foreground hover:text-foreground"
                                onClick={() => setStep("start")}
                            >
                                Back
                            </button>
                        </>
                    )}

                    {/* details */}
                    {step === "details" && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="nickname">{t.nickname}</Label>
                                <Input
                                    id="nickname"
                                    className="h-11 rounded-xl bg-background/40 border-border/70
                             focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                                    placeholder={t.nickname}
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">{t.password}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    className="h-11 rounded-xl bg-background/40 border-border/70
                             focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !disabledDetails) submitSignup();
                                    }}
                                />
                            </div>

                            <Button
                                className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:opacity-90"
                                disabled={disabledDetails}
                                onClick={submitSignup}
                            >
                                {loading ? t.signupLoading : t.signupBtn}
                            </Button>

                            <button
                                type="button"
                                className="text-sm text-muted-foreground hover:text-foreground"
                                onClick={() => setStep("email")}
                            >
                                Back
                            </button>
                        </>
                    )}

                    {/* verify */}
                    {step === "verify" && (
                        <>
                            {/* DEV ONLY: 나중에 제거 */}
                            {devCode && (
                                <div className="rounded-xl border border-border bg-background/40 p-3 text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">DEV CODE:</span>{" "}
                                    <span className="font-mono text-foreground">{devCode}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="code">Enter code</Label>
                                <Input
                                    id="code"
                                    className="h-11 rounded-xl bg-background/40 border-border/70
                             focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                                    placeholder="6-digit code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !disabledVerify) verifyEmail();
                                    }}
                                />
                            </div>

                            <Button
                                className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:opacity-90"
                                disabled={disabledVerify}
                                onClick={verifyEmail}
                            >
                                Verify and continue
                            </Button>

                            <button
                                type="button"
                                className="text-sm text-muted-foreground hover:text-foreground"
                                onClick={resendCode}
                                disabled={loading}
                            >
                                Resend code
                            </button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>

    );

}
