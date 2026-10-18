import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, UserRound, X } from "lucide-react";
import { authApi } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { clearAuthSession, hasValidAccessToken, subscribeToAuthSession } from "@/lib/authSession";

const publicLinks = [
  { to: "/#service-intro", label: "제품 소개" },
  { to: "/#how-it-works", label: "훈련 방식" },
  { to: "/#product-preview", label: "예시 화면" },
  { to: "/#faq", label: "FAQ" },
];

const memberLinks = [
  { to: "/training", label: "훈련" },
  { to: "/growth", label: "성장 리포트" },
  { to: "/mypage", label: "마이페이지" },
];

export function AppHeader() {
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
  const links = isLanding || !isAuthenticated ? publicLinks : memberLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link to="/" aria-label="TradeNova 홈"><BrandWordmark /></Link>
        <nav className="ml-8 hidden items-center gap-6 text-sm text-muted-foreground md:flex" aria-label="주요 메뉴">
          {links.map((link) => <Link key={link.to} className="transition hover:text-foreground" to={link.to}>{link.label}</Link>)}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              {isLanding && <Button size="sm" className="rounded-full px-4" asChild><Link to="/training">훈련 시작</Link></Button>}
              <details className="group relative">
                <summary className="flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-md px-2.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground marker:hidden" aria-label="사용자 메뉴">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="absolute right-0 top-11 w-36 rounded-lg border border-border/70 bg-popover p-1.5 shadow-lg">
                  <button type="button" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground" onClick={logout}>
                    <LogOut className="h-4 w-4" aria-hidden="true" />로그아웃
                  </button>
                </div>
              </details>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild><Link to="/login">로그인</Link></Button>
              <Button size="sm" className="rounded-full px-4" asChild><Link to="/#beta-apply">무료 베타 신청</Link></Button>
            </>
          )}
        </div>
        <button type="button" className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 md:hidden" aria-label={open ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-border/60 bg-background px-4 py-4 md:hidden" aria-label="모바일 메뉴">
          <div className="grid gap-1">
            {links.map((link) => <Link key={link.to} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground" to={link.to} onClick={() => setOpen(false)}>{link.label}</Link>)}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
            {isAuthenticated ? (
              <><Button asChild><Link to="/training" onClick={() => setOpen(false)}>{isLanding ? "훈련 시작" : "훈련"}</Link></Button><Button variant="outline" onClick={logout}>로그아웃</Button></>
            ) : (
              <><Button variant="outline" asChild><Link to="/login" onClick={() => setOpen(false)}>로그인</Link></Button><Button asChild><Link to="/#beta-apply" onClick={() => setOpen(false)}>베타 신청</Link></Button></>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
