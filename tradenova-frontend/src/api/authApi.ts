import http from "./http";
import type { LoginRequest, LoginResponse, SignupRequest } from "../types/auth"; //타입 전용 import하여 DTO 불러옴

export const authApi = { //동기로 만든다면 서버에 응답이 올 때까지 약 2초 동안 웹사이트가 멈춘 것처럼 보임.
    login: async (body: LoginRequest) => { //호출할 login 함수를 생성, async는 비동기 함수 항상 Promise(나중에 성공 or 실패 값을 알려주겠다는 약속 객체)를 반환
        const res = await http.post<LoginResponse>("/api/auth/login", body); //await은 값이 돌아올 때까지 대기.
        return res.data; //res의 data만 반환
    },
    signup: async (body: SignupRequest) => {
        const res = await http.post("/api/auth/signup", body);
        return res.data;
    },
}
