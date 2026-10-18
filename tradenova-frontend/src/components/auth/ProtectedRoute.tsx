import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { clearAuthSession, hasValidAccessToken } from "@/lib/authSession";

//accessToken 확인용
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem("accessToken");
    const valid = hasValidAccessToken(localStorage);

    useEffect(() => {
        if (token && !valid) clearAuthSession();
    }, [token, valid]);

    if (!valid) {
        // 토큰이 없으면 /login으로 이동
        return <Navigate to="/login" replace />;
    }

    return <>{children} </>;
}
