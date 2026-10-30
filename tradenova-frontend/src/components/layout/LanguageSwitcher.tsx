import { useI18n } from "@/i18n/LanguageProvider";
import type { Language } from "@/i18n/resources";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useI18n();
  return (
    <div className={cn("inline-flex items-center rounded-md border border-border/60 bg-background/40 p-0.5", compact && "self-start")} role="group" aria-label={t("common.changeLanguage")}>
      {(["en", "ko"] as const).map((option) => (
        <button
          key={option}
          type="button"
          lang={option}
          aria-pressed={language === option}
          className={cn("rounded px-2 py-1 text-[11px] font-semibold transition", language === option ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}
          onClick={() => setLanguage(option as Language)}
        >
          {option === "en" ? "EN" : "KO"}
        </button>
      ))}
    </div>
  );
}
