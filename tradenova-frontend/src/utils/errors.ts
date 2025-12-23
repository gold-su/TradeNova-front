// src/utils/errors.ts

// 각 입력 필드별 에러를 담기 위한 타입
// Partial → 필요한 필드만 선택적으로 채울 수 있음
type FieldErrors = Partial<{
    email: string;
    nickname: string;
    password: string;
    code: string;
}>;

// 백엔드에서 내려오는 에러 응답 구조
type ErrorResponse = {
    status?: number;                 // HTTP status (optional)
    code?: string;                   // 핵심: 백엔드 ErrorCode 이름
    message?: string;                // 사용자에게 보여줄 메시지
    errors?: Record<string, string>; // @Valid DTO 검증 에러들
};

// axios 에러를 받아서
// - 공통 message
// - 필드별 에러
// - ErrorCode(code)
// 로 정리해서 반환
export function getFieldErrors(
    err: any
): { message?: string; fieldErrors: FieldErrors; code?: string } {

    // axios 에러에서 실제 응답 데이터 추출
    const data: ErrorResponse | undefined = err?.response?.data;

    // 기본 반환 형태
    const out = {
        message: undefined as string | undefined,
        fieldErrors: {} as FieldErrors,
        code: undefined as string | undefined,
    };

    // 응답 데이터 자체가 없으면 그대로 반환
    if (!data) return out;

    // 공통 message 추출
    if (typeof data.message === "string") out.message = data.message;

    // ErrorCode 문자열 추출
    if (typeof data.code === "string") out.code = data.code;

    // 1) DTO validation 에러 처리 (@Valid)
    // { errors: { email: "...", password: "..." } } 형태
    if (data.errors && typeof data.errors === "object") {
        const fe: FieldErrors = {};
        if (data.errors.email) fe.email = data.errors.email;
        if (data.errors.nickname) fe.nickname = data.errors.nickname;
        if (data.errors.password) fe.password = data.errors.password;
        if (data.errors.code) fe.code = data.errors.code;

        // 검증 에러는 가장 정확하므로 바로 반환
        return { message: out.message, fieldErrors: fe, code: out.code };
    }

    // 2) ErrorCode 기반 필드 매핑 (비즈니스 에러)
    // message는 유지하고, 어떤 필드 에러인지 code로 판단
    const fe: FieldErrors = {};
    switch (out.code) {
        case "DUPLICATE_EMAIL":
        case "EMAIL_ALREADY_EXISTS":
            if (out.message) fe.email = out.message;
            break;

        case "DUPLICATE_NICKNAME":
        case "NICKNAME_ALREADY_EXISTS":
            if (out.message) fe.nickname = out.message;
            break;

        case "INVALID_PASSWORD":
            if (out.message) fe.password = out.message;
            break;

        case "INVALID_VERIFICATION_CODE":
        case "VERIFICATION_CODE_EXPIRED":
            if (out.message) fe.code = out.message;
            break;

        default:
            // 어떤 필드에도 명확히 매핑되지 않으면 global message로 처리
            break;
    }

    out.fieldErrors = fe;
    return out;
}
