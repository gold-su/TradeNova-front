import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";

import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";

export const router = createBrowserRouter([
    // 헤더 보이는 영역
    {
        element: <AppLayout />,
        children: [
            { path: "/", element: <HomePage /> },
            // { path: "/training", element: <TrainingPage /> },
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
