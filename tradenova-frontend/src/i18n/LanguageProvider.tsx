import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_LANGUAGE, persistLanguage, resolveInitialLanguage } from "./language";
import { translate, translationValue, type Language, type TranslationParams } from "./resources";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: TranslationParams) => string;
  value: <T = unknown>(key: string) => T;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() =>
    typeof window === "undefined" ? DEFAULT_LANGUAGE : resolveInitialLanguage(window.localStorage),
  );

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    if (typeof window !== "undefined") persistLanguage(window.localStorage, nextLanguage);
    if (typeof document !== "undefined") document.documentElement.lang = nextLanguage;
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translate(language, "landing.meta.title");
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute(
      "content",
      translate(language, "landing.meta.description"),
    );
  }, [language]);

  const context = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    t: (key, params) => translate(language, key, params),
    value: <T,>(key: string) => translationValue<T>(language, key),
  }), [language]);

  return <LanguageContext.Provider value={context}>{children}</LanguageContext.Provider>;
}

// The provider and its colocated hook form one small public i18n boundary.
// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useI18n must be used inside LanguageProvider");
  return context;
}
