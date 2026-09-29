import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { authApi } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { clearAuthSession, hasValidAccessToken, subscribeToAuthSession } from "@/lib/authSession";

const publicLinks = [
  { to: "/#service-intro", label: "서비스 소개" },
  { to: "/#how-it-works", label: "훈련 방식" },
  { to: "/#faq", label: "FAQ" },
];

const memberLinks = [
  { to: "/#service-intro", label: "서비스 소개" },
  { to: "/training", label: "훈련 시작" },
  { to: "/growth", label: "성장" },
  { to: "/mypage", label: "마이페이지" },
];

export function AppHeader() {
  const navigate = useNavigate();
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

  const links = isAuthenticated ? memberLinks : publicLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="font-semibold tracking-tight" aria-label="TradeNova 홈">TradeNova</Link>
        <nav className="ml-8 hidden items-center gap-6 text-sm text-muted-foreground md:flex" aria-label="주요 메뉴">
          {links.map((link) => <Link key={link.to} className="transition hover:text-foreground" to={link.to}>{link.label}</Link>)}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" onClick={logout}><LogOut className="h-4 w-4" />로그아웃</Button>
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
              <><Button variant="outline" asChild><Link to="/mypage" onClick={() => setOpen(false)}>마이페이지</Link></Button><Button variant="outline" onClick={logout}>로그아웃</Button></>
            ) : (
              <><Button variant="outline" asChild><Link to="/login" onClick={() => setOpen(false)}>로그인</Link></Button><Button asChild><Link to="/#beta-apply" onClick={() => setOpen(false)}>베타 신청</Link></Button></>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
