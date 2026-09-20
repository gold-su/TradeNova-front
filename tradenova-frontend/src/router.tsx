// src/router.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import TrainingSessionPage from "@/pages/training/TrainingSessionPage";

import MyPageLayout from "@/pages/mypage/MyPageLayout";
import MyPageHub from "@/pages/mypage/MyPageHub";
import MyAccountsPage from "@/pages/mypage/MyAccountsPage";
import TrainingHistoryPage from "@/pages/mypage/TrainingHistoryPage";
import TrainingHistoryDetailPage from "@/pages/mypage/TrainingHistoryDetailPage";
import GrowthAnalyticsPage from "@/pages/growth/GrowthAnalyticsPage";

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
                path: "/growth",
                element: <ProtectedRoute><GrowthAnalyticsPage /></ProtectedRoute>,
            },
            {
                path: "/mypage",
                element: (
                    <ProtectedRoute>
                        <MyPageLayout />
                    </ProtectedRoute>
                ),
                children: [
                    { index: true, element: <MyPageHub /> },
                    { path: "profile", element: <Navigate to="/mypage" replace /> },
                    { path: "accounts", element: <MyAccountsPage /> },
                    { path: "history", element: <TrainingHistoryPage /> },
                    { path: "history/:sessionId", element: <TrainingHistoryDetailPage /> },
                    { path: "reports", element: <Navigate to="/mypage" replace /> },
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
