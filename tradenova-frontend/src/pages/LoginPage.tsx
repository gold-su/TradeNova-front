// src/pages/LoginPage.tsx
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useI18n } from "@/i18n/LanguageProvider";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { saveAuthSession } from "@/lib/authSession";

export default function LoginPage() {
    const nav = useNavigate();
    const { t } = useI18n();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const onSubmit = async () => {
        setErrorMsg("");
        setLoading(true);

        try {
            const data = await authApi.login({ email, password });

            // 로그인 성공 → 토큰 저장
            saveAuthSession(data.accessToken, data.user.email, data.user.nickname);
            // 홈으로 이동
            nav("/");
        } catch (error: unknown) {
            // 백엔드 에러 응답 구조가 다양할 수 있어서 안전하게 처리
            const data = axios.isAxiosError(error) ? error.response?.data : undefined;
            const msg =
                data?.message ||
                data?.msg1 ||
                data?.errors?.email ||
                data?.errors?.password ||
                t("auth.loginFailed");

            setErrorMsg(String(msg));
        } finally {
            setLoading(false);
        }
    };

    const disabled = loading || !email.trim() || !password.trim();

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-background p-6 overflow-hidden">
            <div
                aria-hidden
                className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
            />

            <Card className="relative z-10 w-full max-w-md bg-card border-border rounded-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">{t("auth.loginTitle")}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t("auth.loginDesc")}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">{t("auth.email")}</Label>
                        <Input
                            id="email"
                            className="h-11 rounded-xl bg-background/40 border-border/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                            placeholder="example@domain.com"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !disabled) onSubmit();
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">{t("auth.password")}</Label>
                        <Input
                            id="password"
                            className="h-11 rounded-xl bg-background/40 border-border/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !disabled) onSubmit();
                            }}
                        />
                    </div>

                    {errorMsg && (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            {errorMsg}
                        </div>
                    )}

                    <Button
                        className="w-full h-11 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90"
                        onClick={onSubmit}
                        disabled={disabled}
                    >
                        {loading ? t("auth.loggingIn") : t("auth.login")}
                    </Button>

                    <div className="text-sm text-muted-foreground">
                        {t("auth.noAccount")}{" "}
                        <Link
                            to="/signup"
                            className="text-primary font-semibold hover:underline underline-offset-4"
                        >
                            {t("auth.signup")}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
