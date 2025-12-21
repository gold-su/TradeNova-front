// src/utils/errors.ts
type FieldErrors = Partial<{
    email: string;
    nickname: string;
    password: string;
    code: string;
}>;

export function getFieldErrors(err: any): { message?: string; fieldErrors: FieldErrors } {
    const data = err?.response?.data;
    const status = err?.response?.status;

    const out: { message?: string; fieldErrors: FieldErrors } = { fieldErrors: {} };

    // 기본 message
    const msg = typeof data?.message === "string" ? data.message : undefined;
    if (msg) out.message = msg;

    // 1) DTO validation 형태 { errors: { field: msg } }
    if (data?.errors && typeof data.errors === "object") {
        const fe: FieldErrors = {};
        if (data.errors.email) fe.email = data.errors.email;
        if (data.errors.nickname) fe.nickname = data.errors.nickname;
        if (data.errors.password) fe.password = data.errors.password;
        if (data.errors.code) fe.code = data.errors.code;
        return { message: out.message, fieldErrors: fe };
    }

    // 2) 우리 ErrorCode 기반 메시지 매핑 (백엔드가 code를 내려준다는 가정이 있으면 더 정확해짐)
    // 지금은 message 문자열로 대략 매핑
    if (msg) {
        const fe: FieldErrors = {};
        if (msg.includes("이메일")) fe.email = msg;
        else if (msg.includes("닉네임")) fe.nickname = msg;
        else if (msg.includes("비밀번호")) fe.password = msg;
        else if (msg.includes("인증")) fe.code = msg; // 인증 코드 관련
        out.fieldErrors = fe;
    }

    // 3) 409 conflict 같은 케이스를 보강
    if (status === 409 && msg) {
        const fe: FieldErrors = {};
        if (msg.includes("이메일")) fe.email = msg;
        if (msg.includes("닉네임")) fe.nickname = msg;
        out.fieldErrors = { ...out.fieldErrors, ...fe };
    }

    return out;
}
