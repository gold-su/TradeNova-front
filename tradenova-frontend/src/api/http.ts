// src/api/http.ts
import axios from "axios";
import { clearAuthSession } from "@/lib/authSession";
import { isPublicBetaClosedResponse, notifyPublicBetaClosed } from "@/lib/publicBetaAccess";

/**
 * axios 인스턴스(커스텀 axios 객체)
 * - baseURL: 모든 요청에 기본으로 붙는 서버 주소
 * - headers: 기본 헤더
 *
 * const로 선언해도 내부 속성은 변경 가능 (재할당만 불가)
 */
const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Request Interceptor
 * - 모든 요청이 서버로 나가기 전에 실행됨
 * - localStorage에 accessToken이 있으면 Authorization 헤더에 자동으로 붙임
 *
 * 주의:
 * - headers가 undefined일 수 있어서 방어 코드가 필요할 때가 있음
 */
http.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
});

/**
 * Response Interceptor (선택)
 * - 공통 에러 처리 지점
 * - 지금은 "토큰 만료/권한 없음"일 때 토큰 삭제 정도만 함
 * - 추후 refresh-token / httpOnly-cookie로 바꾸면 여기 로직이 바뀜
 */
http.interceptors.response.use(
    (res) => res,
    (error) => {
        const status = error?.response?.status;
        const errorCode = error?.response?.data?.error;

        if (isPublicBetaClosedResponse(status, errorCode)) {
            notifyPublicBetaClosed();
        }

        // 토큰이 잘못되었거나 만료되면, 일단 토큰 제거해서 재로그인 유도
        if (status === 401) {
            clearAuthSession();
            // 여기서 router navigate를 직접 하려면 별도 패턴이 필요(예: event bus)
            // 일단은 필요한 경우 페이지 컴포넌트에서 처리하는 게 깔끔함
            console.warn("Auth error:", status, "인증 정보가 제거되었습니다. 재로그인이 필요합니다.");
        }

        return Promise.reject(error);
    }
);

export default http;
