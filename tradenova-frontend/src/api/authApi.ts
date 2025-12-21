import http from "./http";
import type {
    LoginRequest,
    LoginResponse,
    SignupRequest,
    EmailSendRequest,
    EmailSendResponse,
    EmailVerifyRequest,
} from "../types/auth"; //타입 전용 import하여 DTO 불러옴

export const authApi = { //동기로 만든다면 서버에 응답이 올 때까지 약 2초 동안 웹사이트가 멈춘 것처럼 보임.
    login: async (body: LoginRequest) => { //호출할 login 함수를 생성, async는 비동기 함수 항상 Promise(나중에 성공 or 실패 값을 알려주겠다는 약속 객체)를 반환
        const res = await http.post<LoginResponse>("/api/auth/login", body); //await은 값이 돌아올 때까지 대기.
        return res.data; //res의 data만 반환
    },
    signup: async (body: SignupRequest) => {
        const res = await http.post("/api/auth/signup", body);
        return res.data;
    },
    /**
  * 이메일 인증 코드 발송
  * POST /api/auth/email/send
  */
    sendEmailVerification: async (body: EmailSendRequest) => {
        const res = await http.post<EmailSendResponse>(
            "/api/auth/email/send",
            body
        );
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

    //  이메일 중복 체크
    checkEmail: async (body: CheckEmailRequest) => {
        await http.post("/api/auth/email/check", body);
    },

    //  닉네임 중복 체크
    checkNickname: async (body: CheckNicknameRequest) => {
        await http.post("/api/auth/nickname/check", body);
    },

    //  이메일 인증 코드 발급
    sendEmailVerification: async (body: EmailSendRequest) => {
        const res = await http.post<EmailSendResponse>("/api/auth/email/send", body);
        return res.data;
    },

    //  이메일 인증 확인
    verifyEmail: async (body: EmailVerifyRequest) => {
        await http.post("/api/auth/email/verify", body);
    },
}
