import { authMessages } from "./resources/auth";
import { commonMessages } from "./resources/common";
import { landingMessages } from "./resources/landing";
import { trainingMessages } from "./resources/training";
import { mypageMessages } from "./resources/mypage";
import { growthMessages } from "./resources/growth";
import { communityMessages } from "./resources/community";

export const resources = {
  en: { common: commonMessages.en, auth: authMessages.en, landing: landingMessages.en, training: trainingMessages.en, mypage: mypageMessages.en, growth: growthMessages.en, community: communityMessages.en },
  ko: { common: commonMessages.ko, auth: authMessages.ko, landing: landingMessages.ko, training: trainingMessages.ko, mypage: mypageMessages.ko, growth: growthMessages.ko, community: communityMessages.ko },
} as const;

export type Language = keyof typeof resources;
export type TranslationParams = Record<string, string | number>;

function readPath(root: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, segment) => {
    if (!value || typeof value !== "object") return undefined;
    return (value as Record<string, unknown>)[segment];
  }, root);
}

export function translate(language: Language, key: string, params?: TranslationParams): string {
  const value = readPath(resources[language], key) ?? readPath(resources.en, key);
  if (typeof value !== "string") return key;
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match,
  );
}

export function translationValue<T = unknown>(language: Language, key: string): T {
  return (readPath(resources[language], key) ?? readPath(resources.en, key)) as T;
}
