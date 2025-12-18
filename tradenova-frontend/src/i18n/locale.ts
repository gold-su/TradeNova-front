import type { Locale } from "./messages";

export const getLocale = (): Locale => {
    // 나중에: 브라우저 언어/유저 설정/DB 값으로 바꾸면 됨
    return "ko";
};
