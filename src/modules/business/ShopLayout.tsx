
import { useState, type ReactNode } from "react";
import { useLanguage } from "../../locales/LanguageContext";
import { useNavigate } from "react-router-dom";
import BusinessSidebar from "../../pages/BusinessSidebar";
import BusinessTopbar from "../../pages/BusinessTopbar";
import type {
    DashboardModule,
    Language
} from "../../pages/businessDashboard.shared";
import { businessDashboardPath } from "./businessRoutes";

type Props = {
    businessId: number;
    businessSlug: string;
    businessName: string;
    categoryName: string;
    modules: DashboardModule[];
    language: Language;
    title: string;
    breadcrumb: string;
    icon?: string | null;
    children: ReactNode;
    onRefresh?: () => void;
    refreshing?: boolean;
};

export default function ShopLayout({
    businessId,
    businessSlug,
    businessName,
    categoryName,
    modules,
    language,
    title,
    breadcrumb,
    icon,
    children,
    onRefresh,
    refreshing = false
}: Props) {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [selected, setSelected] = useState({
        moduleSlug: "dashboard",
        menuId: null as number | null,
        childMenuId: null as number | null
    });

    const t = (en: string, bn: string) =>
        language === "bn" ? (bn || en) : en;

    const { changeLanguage } = useLanguage();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <BusinessSidebar
                businessId={businessId}
                businessSlug={businessSlug}
                businessName={businessName}
                categoryName={categoryName}
                modules={modules}
                language={language}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                selected={selected}
                onSelectionChange={setSelected}
                onBack={() => navigate("/dashboard")}
            />

            <div className="min-h-screen min-w-0 lg:pl-[276px]">
                <BusinessTopbar
                    title={title}
                    breadcrumb={breadcrumb}
                    icon={icon ?? "LayoutDashboard"}
                    businessName={businessName}
                    language={language}
                    onLanguageChange={changeLanguage}
                    onOpenSidebar={() => setSidebarOpen(true)}
                    onRefresh={() => onRefresh?.()}
                    refreshing={refreshing}
                />

                <main
                    aria-label={t("Shop content", "শপের কনটেন্ট")}
                    className="min-w-0"
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
