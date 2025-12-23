import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";

export function AppLayout() {
    return (
        <div className="min-h-dvh">
            <AppHeader />
            <Outlet />
            {/* Footer는 나중에 */}
        </div>
    );
}
