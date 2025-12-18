import type { Locale } from "./messages";

export const getLocale = (): Locale => {
    const lang = navigator.language;
    if (lang.startsWith("ja")) return "ja";
    if (lang.startsWith("en")) return "en";
    return "ko";
};
