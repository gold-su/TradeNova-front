// src/pages/mypage/MyPageLayout.tsx
import { NavLink, Outlet } from "react-router-dom";

const navItemClass = ({ isActive }: { isActive: boolean }) =>
    [
        "rounded-xl border px-3 py-2 text-sm transition",
        isActive
            ? "border-primary/50 bg-primary/10 font-semibold"
            : "border-border/60 hover:bg-muted/30",
    ].join(" ");

export default function MyPageLayout() {
    return (
        <div className="mx-auto flex h-[calc(100vh-56px)] w-full max-w-6xl gap-4 px-4 py-6">
            {/* LEFT SIDEBAR */}
            <aside className="w-72 shrink-0 rounded-2xl border border-border/60 bg-muted/10 p-4">
                <div className="mb-3 text-sm font-semibold">My Page</div>

                <div className="flex flex-col gap-2">
                    <NavLink to="/mypage/profile" className={navItemClass}>
                        개인정보 / 프로필
                    </NavLink>
                    <NavLink to="/mypage/accounts" className={navItemClass}>
                        계좌 관리
                    </NavLink>
                    <NavLink to="/mypage/reports" className={navItemClass}>
                        리포트 정리본
                    </NavLink>
                </div>

                <div className="mt-4 rounded-xl border border-border/60 bg-background/10 p-3 text-xs text-muted-foreground">
                    제품 데모용 마이페이지. <br />
                    다음 단계에서 AI 한줄평/리포트 API를 연결하면 완성도 확 올라감.
                </div>
            </aside>

            {/* RIGHT CONTENT */}
            <main className="flex-1 overflow-y-auto rounded-2xl border border-border/60 bg-background/10 p-6">
                <Outlet />
            </main>
        </div>
    );
}