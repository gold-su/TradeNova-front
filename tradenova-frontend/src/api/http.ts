// src/api/http.ts
import axios from "axios";

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
        // axios v1에서 headers 타입이 다양해서 이런 방식이 제일 안전함
        config.headers = config.headers ?? {}; //config.headers가 null 또는 undefined가 아니면 config.headers 그대로 쓰고 맞다면 {} <- 공백 사용
        (config.headers as any).Authorization = `Bearer ${token}`; //Axios v1부터 config.headers 타입이 복잡한 유니온 타입이라서 config.headers.Authorization 바로 못 믿음. 그래서 as any로 그냥 넣어달라고 하는거임
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

        // 토큰이 잘못되었거나 만료되면, 일단 토큰 제거해서 재로그인 유도
        if (status === 401 || status === 403) {
            localStorage.removeItem("accessToken");
            // 여기서 router navigate를 직접 하려면 별도 패턴이 필요(예: event bus)
            // 일단은 필요한 경우 페이지 컴포넌트에서 처리하는 게 깔끔함
            console.warn("Auth error:", status, "토큰 제거됨. 재로그인 필요");
        }

        return Promise.reject(error);
    }
);

export default http;
