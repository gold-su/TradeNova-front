import { Link, Outlet } from "react-router-dom";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useI18n } from "@/i18n/LanguageProvider";

export function AuthLayout() {
    const { t } = useI18n();
    return (
        <div className="relative min-h-dvh">
            <Link to="/" className="absolute left-5 top-5 z-20 text-base sm:left-8 sm:top-7" aria-label={`TradeNova ${t("common.home")}`}>
                <BrandWordmark />
            </Link>
            <div className="absolute right-5 top-5 z-20 sm:right-8 sm:top-7"><LanguageSwitcher /></div>
            <Outlet />
        </div>
    );
}
