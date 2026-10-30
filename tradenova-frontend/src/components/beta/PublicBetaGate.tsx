import { useCallback, useEffect, useState } from "react";
import { betaAccessApi } from "@/api/betaAccessApi";
import { Button } from "@/components/ui/button";
import {
  PUBLIC_BETA_CLOSED_EVENT,
  resolvePublicBetaAccessView,
  type PublicBetaAccessView,
} from "@/lib/publicBetaAccess";
import { PublicBetaClosed } from "./PublicBetaClosed";
import { useI18n } from "@/i18n/LanguageProvider";

type GateState = PublicBetaAccessView | "LOADING" | "ERROR";

export function PublicBetaGate({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [state, setState] = useState<GateState>("LOADING");

  const checkAccess = useCallback(async () => {
    setState("LOADING");
    try {
      const response = await betaAccessApi.getAccess();
      setState(resolvePublicBetaAccessView(response));
    } catch {
      setState("ERROR");
    }
  }, []);

  useEffect(() => {
    let active = true;
    void betaAccessApi.getAccess()
      .then((response) => {
        if (active) setState(resolvePublicBetaAccessView(response));
      })
      .catch(() => {
        if (active) setState("ERROR");
      });

    const handleClosed = () => setState("CLOSED");
    window.addEventListener(PUBLIC_BETA_CLOSED_EVENT, handleClosed);
    return () => {
      active = false;
      window.removeEventListener(PUBLIC_BETA_CLOSED_EVENT, handleClosed);
    };
  }, []);

  if (state === "CLOSED") return <PublicBetaClosed />;

  if (state === "ERROR") {
    return (
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-5 py-16 text-center">
        <div>
          <h1 className="text-xl font-semibold">{t("landing.gate.errorTitle")}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{t("landing.gate.errorBody")}</p>
          <Button variant="outline" className="mt-6" onClick={() => void checkAccess()}>
            {t("common.retry")}
          </Button>
        </div>
      </main>
    );
  }

  if (state === "LOADING") {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center text-sm text-muted-foreground" role="status">
        {t("landing.gate.checking")}
      </div>
    );
  }

  return <>{children}</>;
}
