
export function getErrorMessage(err: any) {
    //axios error 형태 대응
    const data = err?.response?.data;

    if (!data) return "요청에 실패했습니다.";

    // GlobalExceptionHandler에서 Map으로 내려주는 케이스 { message: "..." }
    if (typeof data?.message === "string") return data.message;

    // ErrorResponse 형태 { status, code, message }
    if (typeof data?.message === "string") return data.message;

    // 검증 오류 { message, errors: { field: msg } }
    if (data?.errors && typeof data.errors === "object") {
        const firstKey = Object.keys(data.errors)[0];
        if (firstKey) return data.errors[firstKey];
    }

    return "요청에 실패했습니다.";
}