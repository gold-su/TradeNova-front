import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { contentStudioApi } from "@/api/contentStudioApi";
import { Button } from "@/components/ui/button";
import { clearAuthSession, hasValidAccessToken } from "@/lib/authSession";
import { useI18n } from "@/i18n/LanguageProvider";

type AccessState = "CHECKING" | "ALLOWED" | "FORBIDDEN" | "ERROR";

export function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [state, setState] = useState<AccessState>("CHECKING");
  const validToken = hasValidAccessToken(localStorage);

  useEffect(() => {
    if (!validToken) return;
    let active = true;
    void contentStudioApi.getAccess()
      .then(() => active && setState("ALLOWED"))
      .catch((error: unknown) => {
        if (!active) return;
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          setState("FORBIDDEN");
          return;
        }
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearAuthSession();
          setState("FORBIDDEN");
          return;
        }
        setState("ERROR");
      });
    return () => { active = false; };
  }, [validToken]);

  if (!validToken) return <Navigate to="/login" replace />;
  if (state === "ALLOWED") return <>{children}</>;
  if (state === "FORBIDDEN") {
    return <main className="grid min-h-dvh place-items-center bg-background px-6 text-center"><div><h1 className="text-xl font-semibold">{t("admin.access.denied")}</h1><p className="mt-3 text-sm text-muted-foreground">{t("admin.access.deniedBody")}</p></div></main>;
  }
  if (state === "ERROR") {
    return <main className="grid min-h-dvh place-items-center bg-background px-6 text-center"><div><p className="text-sm text-muted-foreground">{t("admin.access.failed")}</p><Button className="mt-4" onClick={() => window.location.reload()}>{t("common.retry")}</Button></div></main>;
  }
  return <div className="grid min-h-dvh place-items-center bg-background text-sm text-muted-foreground" role="status">{t("admin.access.checking")}</div>;
}
