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
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">{t.signupTitle}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t.signupDesc}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">{t.email}</Label>
                        <Input
                            id="email"
                            placeholder="example@domain.com"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nickname">{t.nickname}</Label>
                        <Input
                            id="nickname"
                            placeholder={t.nickname}
                            autoComplete="nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">{t.password}</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {errorMsg && (
                        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                            {errorMsg}
                        </div>
                    )}

                    <Button className="w-full" onClick={onSubmit} disabled={disabled}>
                        {loading ? t.signupLoading : t.signupBtn}
                    </Button>

                    <div className="text-sm text-muted-foreground">
                        {t.haveAccount}{" "}
                        <Link
                            to="/login"
                            className="text-foreground font-semibold underline underline-offset-4"
                        >
                            {t.goLogin}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
