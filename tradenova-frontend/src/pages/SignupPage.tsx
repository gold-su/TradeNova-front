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

    const t = M[getLocale()]; //언어

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const onSubmit = async () => {
        setErrorMsg("");
        setLoading(true);
        try {
            await authApi.signup({ email, nickname, password });
            nav("/login");
        } catch (e: any) {
            setErrorMsg(e?.response?.data?.message ?? "회원가입 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24, maxWidth: 380, margin: "0 auto" }}>
            <h2>{t.goSignup}</h2>

            <div style={{ display: "grid", gap: 10 }}>
                <input
                    placeholder={t.email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    placeholder={t.nickname}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />
                <input
                    placeholder={t.password}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {errorMsg && <div style={{ color: "red" }}>{errorMsg}</div>}

                <button
                    onClick={onSubmit}
                    disabled={loading || !email || !password || !nickname}
                >
                    {loading ? t.loginLoading : t.loginBtn}
                </button>

                <Link to="/login">{t.goLogin}</Link>
            </div>
        </div>
    );
}
