// src/api/authApi.ts
import http from "./http";
import type {
    LoginRequest,
    LoginResponse,
    SignupRequest,
    EmailSendRequest,
    EmailSendResponse,
    EmailVerifyRequest,
    CheckEmailRequest,
    CheckNicknameRequest,
} from "../types/auth";

/**
 * authApi
 * - UI에서 직접 axios를 쓰지 않고 "API 함수"로 감싸두면
 *   1) 유지보수 쉬움
 *   2) 타입 관리 쉬움
 *   3) 공통 에러 처리도 한곳에서 가능
 */
export const authApi = {
    /**
     * 로그인
     * POST /api/auth/login
     */
    login: async (body: LoginRequest) => {
        const res = await http.post<LoginResponse>("/api/auth/login", body);
        return res.data;
    },

    /**
     * 회원가입
     * POST /api/auth/signup
     */
    signup: async (body: SignupRequest) => {
        const res = await http.post("/api/auth/signup", body);
        return res.data;
    },

    /**
     * 이메일 인증 코드 발송
     * POST /api/auth/email/send
     */
    sendEmailVerification: async (body: EmailSendRequest) => {
        const res = await http.post<EmailSendResponse>("/api/auth/email/send", body);
        return res.data;
    },

    /**
     * 이메일 인증 코드 확인
     * POST /api/auth/email/verify
     */
    verifyEmail: async (body: EmailVerifyRequest) => {
        const res = await http.post("/api/auth/email/verify", body);
        return res.data;
    },

    /**
     * 이메일 중복 체크
     * POST /api/auth/email/check
     */
    checkEmail: async (body: CheckEmailRequest) => {
        const res = await http.post("/api/auth/email/check", body);
        return res.data;
    },

    /**
     * 닉네임 중복 체크
     * POST /api/auth/nickname/check
     */
    checkNickname: async (body: CheckNicknameRequest) => {
        const res = await http.post("/api/auth/nickname/check", body);
        return res.data;
    },

    /**
     * 로그아웃(프론트 기준)
     * - 서버에 별도 로그아웃 API가 없으면 토큰만 제거해도 됨
     * - 나중에 refresh token/httpOnly-cookie 쓰면 서버 로그아웃이 필요해짐
     */
    logoutLocal: () => {
        localStorage.removeItem("accessToken");
    },
};
