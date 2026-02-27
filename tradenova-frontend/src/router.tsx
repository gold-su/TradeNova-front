// src/router.tsx
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import TrainingSessionPage from "@/pages/TrainingSessionPage";

import MyPageLayout from "@/pages/mypage/MyPageLayout";
import MyProfilePage from "@/pages/mypage/MyProfilePage";
import MyAccountsPage from "@/pages/mypage/MyAccountsPage";
import MyReportsPage from "@/pages/mypage/MyReportsPage";

export const router = createBrowserRouter([
    //헤더 보이는 영역
    {
        element: <AppLayout />,
        children: [
            { path: "/", element: <HomePage /> },
            {
                path: "/training",
                element: (
                    <ProtectedRoute>
                        <TrainingSessionPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/mypage",
                element: (
                    <ProtectedRoute>
                        <MyPageLayout />
                    </ProtectedRoute>
                ),
                children: [
                    { path: "profile", element: <MyProfilePage /> },
                    { path: "accounts", element: <MyAccountsPage /> },
                    { path: "reports", element: <MyReportsPage /> },
                ],
            },
        ],
    },
    //헤더 안 보이는 영역
    {
        element: <AuthLayout />,
        children: [
            { path: "/login", element: <LoginPage /> },
            { path: "/signup", element: <SignupPage /> },
        ],
    },
]);