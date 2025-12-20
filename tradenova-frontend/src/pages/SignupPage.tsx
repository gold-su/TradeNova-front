import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { M } from "../i18n/messages";
import { getLocale } from "../i18n/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const t = M[getLocale()];

    const onSubmit = async () => {
        setErrorMsg("");
        setLoading(true);
        try {
            await authApi.signup({ email, nickname, password });
            nav("/login");
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ||
                e?.response?.data?.errors?.email ||
                e?.response?.data?.errors?.nickname ||
                e?.response?.data?.errors?.password ||
                "회원가입 실패";
            setErrorMsg(msg);
        } finally {
            setLoading(false);
        }
    };

    const disabled =
        loading || !email.trim() || !password.trim() || !nickname.trim();

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-background p-6 overflow-hidden">
            {/* Nova glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
            />

            <Card className="relative z-10 w-full max-w-md bg-card border-border rounded-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">{t.signupTitle}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t.signupDesc}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">{t.email}</Label>
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
                        <Label htmlFor="nickname">{t.nickname}</Label>
                        <Input
                            id="nickname"
                            className="h-11 rounded-xl bg-background/40 border-border/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                            placeholder={t.nickname}
                            autoComplete="nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !disabled) onSubmit();
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">{t.password}</Label>
                        <Input
                            id="password"
                            className="h-11 rounded-xl bg-background/40 border-border/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                            type="password"
                            placeholder="••••••••"
                            autoComplete="new-password"
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
                        {loading ? t.signupLoading : t.signupBtn}
                    </Button>

                    <div className="text-sm text-muted-foreground">
                        {t.haveAccount}{" "}
                        <Link
                            to="/login"
                            className="text-primary font-semibold hover:underline underline-offset-4"
                        >
                            {t.goLogin}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

}
