import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        // 토큰이 없으면 /login으로 이동
        return <Navigate to="/login" replace />;
    }

    return <>{children} </>;
}
