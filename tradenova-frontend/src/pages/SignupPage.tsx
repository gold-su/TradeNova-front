// src/pages/SignupPage.tsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { M } from "../i18n/messages";
import { getLocale } from "../i18n/locale";
import { getFieldErrors } from "../utils/errors";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type Step = "start" | "email" | "details" | "verify";

type FieldErrors = Partial<{
    email: string;
    nickname: string;
    password: string;
    code: string;
}>;

// 간단한 프론트 검증 규칙
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidNickname = (v: string) => v.length >= 2 && v.length <= 12; // 너 서비스 기준으로 조정
const isValidPassword = (v: string) =>
    v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v); // 영문+숫자 최소

export default function SignupPage() {
    const nav = useNavigate();
    const t = M[getLocale()];

    const [step, setStep] = useState<Step>("start");

    const [email, setEmail] = useState("");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");

    const [code, setCode] = useState("");
    const [devCode, setDevCode] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [globalMsg, setGlobalMsg] = useState<string>(""); // 꼭 필요할 때만 사용

    const flow = t.signupFlow[step];

    const disabledEmail = loading || !email.trim();
    const disabledDetails = loading || !nickname.trim() || !password.trim() || !email.trim();
    const disabledVerify = loading || !email.trim() || !code.trim();

    const emailTrim = useMemo(() => email.trim(), [email]);
    const nicknameTrim = useMemo(() => nickname.trim(), [nickname]);

    const clearAllErrors = () => {
        setErrors({});
        setGlobalMsg("");
    };

    // 이메일 단계: 형식 + 서버 중복 체크 후 details로
    const continueEmail = async () => {
        clearAllErrors();

        // 1) 프론트 형식 검증
        if (!isValidEmail(emailTrim)) {
            setErrors({ email: "올바른 이메일 형식이 아닙니다." });
            return;
        }

        setLoading(true);
        try {
            // 2) 서버 중복 체크
            await authApi.checkEmail({ email: emailTrim });
            setStep("details");
        } catch (e: any) {
            const { message, fieldErrors } = getFieldErrors(e);
            setErrors({ ...fieldErrors, email: fieldErrors.email || message || "이메일 확인 실패" });
        } finally {
            setLoading(false);
        }
    };

    // details 단계: 닉네임(형식+중복) + 비번(형식) 통과 시 signup + 인증코드 발급
    const submitDetails = async () => {
        clearAllErrors();

        // 1) 닉네임 프론트 검증
        if (!isValidNickname(nicknameTrim)) {
            setErrors({ nickname: "닉네임은 2~12자로 입력해주세요." });
            return;
        }

        // 2) 비밀번호 프론트 검증
        if (!isValidPassword(password)) {
            setErrors({ password: "비밀번호는 8자 이상, 영문+숫자를 포함해야 합니다." });
            return;
        }

        setLoading(true);
        try {
            // 3) 닉네임 중복 체크 (서버)
            await authApi.checkNickname({ nickname: nicknameTrim });

            // 4) 회원가입
            await authApi.signup({
                email: emailTrim,
                nickname: nicknameTrim,
                password,
            });

            // 5) 인증 코드 발급
            const res = await authApi.sendEmailVerification({ email: emailTrim });
            setDevCode(res.devCode ?? null);
            setStep("verify");
        } catch (e: any) {
            const { message, fieldErrors } = getFieldErrors(e);

            // 서버에서 내려준 필드 에러 우선
            if (Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors);
            } else if (message) {
                // 어느 필드인지 애매하면 global로 (최소 사용)
                setGlobalMsg(message);
            } else {
                setGlobalMsg("회원가입에 실패했습니다.");
            }
        } finally {
            setLoading(false);
        }
    };

    // verify 단계: 인증 코드 검증
    const verifyEmail = async () => {
        clearAllErrors();

        // 프론트 간단 검증 (6자리 숫자 등)
        if (!/^\d{6}$/.test(code.trim())) {
            setErrors({ code: "인증 코드는 6자리 숫자로 입력해주세요." });
            return;
        }

        setLoading(true);
        try {
            await authApi.verifyEmail({ email: emailTrim, code: code.trim() });

            // 인증 완료 → 로그인 이동
            nav("/login", {
                state: {
                    verified: true,
                    email: emailTrim,
                    msg: "인증 완료! 이제 로그인하세요.",
                },
            });
        } catch (e: any) {
            const { message, fieldErrors } = getFieldErrors(e);
            setErrors({ ...fieldErrors, code: fieldErrors.code || message || "인증 실패" });
        } finally {
            setLoading(false);
        }
    };

    const resendCode = async () => {
        clearAllErrors();
        setLoading(true);
        try {
            const res = await authApi.sendEmailVerification({ email: emailTrim });
            setDevCode(res.devCode ?? null);
            setGlobalMsg("인증 코드를 다시 보냈습니다.");
        } catch (e: any) {
            const { message } = getFieldErrors(e);
            setGlobalMsg(message || "인증 코드 재전송 실패");
        } finally {
            setLoading(false);
        }
    };

    // 공통: 인풋 + 에러 스타일
    const inputClass = (hasError?: boolean) =>
        cn(
            "h-11 rounded-xl bg-background/40 border-border/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
            hasError && "border-destructive/60 focus-visible:ring-destructive/40"
        );

    const errorText = (msg?: string) =>
        msg ? <p className="mt-1 text-xs text-destructive/80">{msg}</p> : null;

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
                    {/* global message는 정말 애매할 때만 */}
                    {globalMsg && (
                        <div className="rounded-xl border border-border bg-background/40 p-3 text-sm text-muted-foreground">
                            {globalMsg}
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
                                onClick={() => {
                                    clearAllErrors();
                                    setStep("email");
                                }}
                            >
                                Continue with email
                            </Button>

                            <div className="pt-2 text-sm text-muted-foreground">
                                {t.haveAccount}{" "}
                                <Link to="/login" className="text-primary font-semibold hover:underline underline-offset-4">
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
                                    className={inputClass(!!errors.email)}
                                    placeholder="example@domain.com"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        // 입력 중에는 해당 필드 에러만 제거(UX)
                                        if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                                    }}
                                    onBlur={() => {
                                        // blur에서 형식만 가볍게 체크
                                        if (emailTrim && !isValidEmail(emailTrim)) {
                                            setErrors((p) => ({ ...p, email: "올바른 이메일 형식이 아닙니다." }));
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !disabledEmail) continueEmail();
                                    }}
                                />
                                {errorText(errors.email)}
                            </div>

                            <Button
                                className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:opacity-90"
                                disabled={disabledEmail}
                                onClick={continueEmail}
                            >
                                Continue
                            </Button>

                            <button
                                type="button"
                                className="text-sm text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                    clearAllErrors();
                                    setStep("start");
                                }}
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
                                    className={inputClass(!!errors.nickname)}
                                    placeholder={t.nickname}
                                    value={nickname}
                                    onChange={(e) => {
                                        setNickname(e.target.value);
                                        if (errors.nickname) setErrors((p) => ({ ...p, nickname: undefined }));
                                    }}
                                    onBlur={() => {
                                        if (nicknameTrim && !isValidNickname(nicknameTrim)) {
                                            setErrors((p) => ({ ...p, nickname: "닉네임은 2~12자로 입력해주세요." }));
                                        }
                                    }}
                                />
                                {errorText(errors.nickname)}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">{t.password}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    className={inputClass(!!errors.password)}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                                    }}
                                    onBlur={() => {
                                        if (password && !isValidPassword(password)) {
                                            setErrors((p) => ({
                                                ...p,
                                                password: "비밀번호는 8자 이상, 영문+숫자를 포함해야 합니다.",
                                            }));
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !disabledDetails) submitDetails();
                                    }}
                                />
                                {errorText(errors.password)}
                            </div>

                            <Button
                                className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:opacity-90"
                                disabled={disabledDetails}
                                onClick={submitDetails}
                            >
                                {loading ? t.signupLoading : t.signupBtn}
                            </Button>

                            <button
                                type="button"
                                className="text-sm text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                    clearAllErrors();
                                    setStep("email");
                                }}
                            >
                                Back
                            </button>
                        </>
                    )}

                    {/* verify */}
                    {step === "verify" && (
                        <>
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
                                    className={inputClass(!!errors.code)}
                                    placeholder="6-digit code"
                                    value={code}
                                    onChange={(e) => {
                                        setCode(e.target.value);
                                        if (errors.code) setErrors((p) => ({ ...p, code: undefined }));
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !disabledVerify) verifyEmail();
                                    }}
                                />
                                {errorText(errors.code)}
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

                            <div className="pt-2 text-sm text-muted-foreground">
                                {t.haveAccount}{" "}
                                <Link to="/login" className="text-primary font-semibold hover:underline underline-offset-4">
                                    {t.goLogin}
                                </Link>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
