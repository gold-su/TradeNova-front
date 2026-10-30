import { LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BETA_WAITLIST_PATH } from "@/lib/publicBetaAccess";
import { useI18n } from "@/i18n/LanguageProvider";

export function PublicBetaClosed() {
  const { t } = useI18n();
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-5 py-16">
      <section className="w-full max-w-lg rounded-2xl border border-border/70 bg-card/65 px-6 py-10 text-center shadow-xl sm:px-10">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-5 text-xs font-semibold tracking-[0.16em] text-primary">PRIVATE BETA</p>
        <h1 className="mt-3 break-keep text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("landing.gate.title")}
        </h1>
        <p className="mx-auto mt-4 max-w-md break-keep text-sm leading-7 text-muted-foreground">
          {t("landing.gate.body")}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link to={BETA_WAITLIST_PATH}>{t("landing.gate.apply")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">{t("landing.gate.home")}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
