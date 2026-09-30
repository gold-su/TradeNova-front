import { Link, Outlet } from "react-router-dom";
import { BrandWordmark } from "@/components/brand/BrandWordmark";

export function AuthLayout() {
    return (
        <div className="relative min-h-dvh">
            <Link to="/" className="absolute left-5 top-5 z-20 text-base sm:left-8 sm:top-7" aria-label="TradeNova 홈으로">
                <BrandWordmark />
            </Link>
            <Outlet />
        </div>
    );
}
