import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, UserRound, X } from "lucide-react";
import { authApi } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useI18n } from "@/i18n/LanguageProvider";
import { clearAuthSession, hasValidAccessToken, subscribeToAuthSession } from "@/lib/authSession";

export function AppHeader() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasValidAccessToken(localStorage));

  useEffect(() => {
    const sync = () => {
      const valid = hasValidAccessToken(localStorage);
      setIsAuthenticated(valid);
      if (!valid && localStorage.getItem("accessToken")) clearAuthSession();
    };
    sync();
    return subscribeToAuthSession(sync);
  }, []);

  const logout = () => {
    authApi.logoutLocal();
    setOpen(false);
    navigate("/", { replace: true });
  };

  const isLanding = location.pathname === "/";
  const publicLinks = [
    { to: "/#service-intro", label: t("landing.nav.intro") },
    { to: "/#how-it-works", label: t("landing.nav.method") },
    { to: "/#product-preview", label: t("landing.nav.preview") },
    { to: "/#faq", label: t("landing.nav.faq") },
  ];
  const memberLinks = [
    { to: "/training", label: t("landing.nav.training") },
    { to: "/growth", label: t("landing.nav.growth") },
    { to: "/mypage", label: t("landing.nav.mypage") },
  ];
  const links = isLanding || !isAuthenticated ? publicLinks : memberLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link to="/" aria-label={`TradeNova ${t("common.home")}`}><BrandWordmark /></Link>
        <nav className="ml-8 hidden items-center gap-6 text-sm text-muted-foreground md:flex" aria-label={t("landing.nav.mainMenu")}>
          {links.map((link) => <Link key={link.to} className="transition hover:text-foreground" to={link.to}>{link.label}</Link>)}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <>
              {isLanding && <Button size="sm" className="rounded-full px-4" asChild><Link to="/training">{t("landing.nav.start")}</Link></Button>}
              <details className="group relative">
                <summary className="flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-md px-2.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground marker:hidden" aria-label={t("landing.nav.userMenu")}>
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="absolute right-0 top-11 w-36 rounded-lg border border-border/70 bg-popover p-1.5 shadow-lg">
                  <button type="button" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground" onClick={logout}>
                    <LogOut className="h-4 w-4" aria-hidden="true" />{t("landing.nav.logout")}
                  </button>
                </div>
              </details>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild><Link to="/login">{t("landing.nav.login")}</Link></Button>
              <Button size="sm" className="rounded-full px-4" asChild><Link to="/#beta-apply">{t("landing.nav.beta")}</Link></Button>
            </>
          )}
        </div>
        <button type="button" className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 md:hidden" aria-label={open ? t("landing.nav.closeMenu") : t("landing.nav.openMenu")} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-border/60 bg-background px-4 py-4 md:hidden" aria-label={t("landing.nav.mobileMenu")}>
          <LanguageSwitcher compact />
          <div className="grid gap-1">
            {links.map((link) => <Link key={link.to} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground" to={link.to} onClick={() => setOpen(false)}>{link.label}</Link>)}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
            {isAuthenticated ? (
              <><Button asChild><Link to="/training" onClick={() => setOpen(false)}>{isLanding ? t("landing.nav.start") : t("landing.nav.training")}</Link></Button><Button variant="outline" onClick={logout}>{t("landing.nav.logout")}</Button></>
            ) : (
              <><Button variant="outline" asChild><Link to="/login" onClick={() => setOpen(false)}>{t("landing.nav.login")}</Link></Button><Button asChild><Link to="/#beta-apply" onClick={() => setOpen(false)}>{t("landing.nav.beta")}</Link></Button></>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
