import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";

export default function SignupPage() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");

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
            <h2>회원가입</h2>

            <div style={{ display: "grid", gap: 10 }}>
                <input
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    placeholder="닉네임"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />
                <input
                    placeholder="비밀번호"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {errorMsg && <div style={{ color: "red" }}>{errorMsg}</div>}

                <button
                    onClick={onSubmit}
                    disabled={loading || !email || !password || !nickname}
                >
                    {loading ? "가입 중..." : "회원가입"}
                </button>

                <Link to="/login">로그인 하러가기</Link>
            </div>
        </div>
    );
}
