import type { Language } from "./resources";

export const LANGUAGE_STORAGE_KEY = "tradenova.language";
export const DEFAULT_LANGUAGE: Language = "en";

export type LanguageStorage = Pick<Storage, "getItem" | "setItem">;

export function isLanguage(value: unknown): value is Language {
  return value === "en" || value === "ko";
}

export function resolveInitialLanguage(storage?: Pick<Storage, "getItem"> | null): Language {
  if (!storage) return DEFAULT_LANGUAGE;
  try {
    const stored = storage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguage(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function persistLanguage(storage: LanguageStorage | null | undefined, language: Language) {
  try {
    storage?.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Storage can be unavailable in privacy mode. The in-memory selection still works.
  }
}
