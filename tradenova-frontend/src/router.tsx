// src/router.tsx
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";

import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";

// 차트/훈련 페이지 만들면 아래처럼 보호 라우트 적용 가능
import TrainingPage from "@/pages/TrainingPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const router = createBrowserRouter([
    // 헤더 보이는 영역
    {
        element: <AppLayout />,
        children: [
            { path: "/", element: <HomePage /> },
            {
                path: "/training",
                element: (
                    // 토큰 없으면 /login으로 이동
                    <ProtectedRoute>
                        <TrainingPage />
                    </ProtectedRoute>
                ),
            },
        ],
    },

    // 헤더 안 보이는 영역 (로그인/회원가입)
    {
        element: <AuthLayout />,
        children: [
            { path: "/login", element: <LoginPage /> },
            { path: "/signup", element: <SignupPage /> },
        ],
    },
]);
