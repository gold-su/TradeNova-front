//export는 이 파일 밖에서도 이걸 쓰게 해달라는 선언
//얘네들은 백엔드로 따지면 DTO임, interface = 설계도, 대신 검증 로직이 없음 (@NotBlank)
//런타임에는 없음
export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    email: string;
    password: string;
    nickname: string;
}

export interface LoginResponse {
    accessToken: string;
    tokenType: string;
    user: {
        id: number;
        email: string;
        nickname: string;
        role: string;
    };
}
