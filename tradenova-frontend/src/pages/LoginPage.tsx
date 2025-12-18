import { useState } from "react"; //컴포넌트 안에서 '상태(state)를 만들고 관리함. 상태가 바뀌면 화면이 다시 랜더링됨.
import { Link, useNavigate } from "react-router-dom"; //useNavigate는 페이지 이동 함수 / Link는 <a>는 태그 대신 쓰는 리액트용 링크, 새로고침 없이 페이지 이동
import { authApi } from "../api/authApi"; //만들어둔 API 서비스 객체
import { M } from "../i18n/messages";
import { getLocale } from "../i18n/locale";

export default function LoginPage() {
    const nav = useNavigate();
    const [email, setEmail] = useState(""); //입력창 값 저장용 상태
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false); //로그인 요청 중인지 여부, 버튼 비활성화 / 로딩 문구 표시용
    const [errorMsg, setErrorMsg] = useState(""); //서버 에러 메시지 보여주기 용

    const t = M[getLocale()]; //언어

    const onSubmit = async () => { //로그인 버튼 클릭 시 실행할 함수, 비동기 함수
        setErrorMsg(""); //이전 에러 메시지 제거
        setLoading(true); //로딩 시작(버튼 잠김)
        try {
            const data = await authApi.login({ email, password });
            localStorage.setItem("accessToken", data.accessToken); //로그인 상태를 브라우저에 저장, 이후 모든 요청에 인터셉터가 자동으로 토큰 붙임
            nav("/"); //로그인 성공하면 홈으로
        } catch (e: any) { //axios 에러 타입이 복잡해서 일단 any, 실무에서도 자주 이렇게 시작함.
            setErrorMsg(e?.response?.data?.message ?? "로그인 실패"); //e?.response?.data?.message 중간에 하나라도 없으면 에러 안 터지고 undefined
        } finally { //성공하든, 실패하든 무조건 실행
            setLoading(false);  //로딩 상태 해제 보장
        }
    };

    return (
        <div style={{ padding: 24, maxWidth: 380, margin: "0 auto" }}>
            <h2>{t.goLogin}</h2>

            <div style={{ display: "grid", gap: 10 }}>
                <input
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    placeholder="비밀번호"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {errorMsg && <div style={{ color: "red" }}>{errorMsg}</div>}

                <button onClick={onSubmit} disabled={loading || !email || !password}>
                    {loading ? t.loginLoading : t.loginBtn}
                </button>

                <Link to="/signup">{t.signupBtn}</Link>
            </div>
        </div>
    );
}
