// src/pages/mypage/MyPageLayout.tsx
import { Outlet } from "react-router-dom";

export default function MyPageLayout() {
    return (
        <main className="min-h-[calc(100dvh-56px)] bg-background"><Outlet /></main>
    );
}
