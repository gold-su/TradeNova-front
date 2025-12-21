//export는 이 파일 밖에서도 이걸 쓰게 해달라는 선언
//얘네들은 백엔드로 따지면 DTO임, interface = 설계도, 대신 검증 로직이 없음 (@NotBlank)
//런타임에는 없음

// 로그인 요청
export interface LoginRequest {
    email: string;
    password: string;
}

// 로그인 응답
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

// 회원가입 요청
export interface SignupRequest {
    email: string;
    password: string;
    nickname: string;
}


//중복 체크
export interface CheckEmailRequest {
    email: string;
}

export interface CheckNicknameRequest {
    nickname: string;
}

// 이메일 인증 코드 발송 요청
export interface EmailSendRequest {
    email: string;
}


// 이메일 인증 코드 발송 응답
export interface EmailSendResponse {
    message: string;
    devCode?: string; // 개발용 (운영에서 제거 예정)
}

// 이메일 인증 코드 확인 요청
export interface EmailVerifyRequest {
    email: string;
    code: string;
}