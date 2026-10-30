import type { Language } from "@/i18n/resources";

export type AiReviewGenerateRequest = {
  language: Language;
};

export function aiReviewGenerateRequest(language: Language): AiReviewGenerateRequest {
  return { language };
}
