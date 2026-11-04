
import {
    Globe2, Menu, RefreshCw
} from "lucide-react";
import {
    getIcon,
    type Language
} from "./businessDashboard.shared";

type Props = {
    title: string;
    breadcrumb: string;
    icon?: string | null;
    businessName: string;
    language: Language;
    onLanguageChange: (language: Language) => void;
    onOpenSidebar: () => void;
    onRefresh: () => void;
    refreshing: boolean;
};

export default function BusinessTopbar({
    title, breadcrumb, icon, businessName, language,
    onLanguageChange, onOpenSidebar, onRefresh, refreshing
}: Props) {
    const t = (en: string, bn: string) => language === "bn" ? (bn || en) : en;
    const ActiveIcon = getIcon(icon);

    return (
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    onClick={onOpenSidebar}
                    aria-label={t("Open sidebar", "সাইডবার খুলুন")}
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                >
                    <Menu size={21} />
                </button>

                <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 sm:flex">
                    <ActiveIcon size={20} />
                </span>

                <div className="min-w-0">
                    <div className="hidden items-center gap-1.5 text-[11px] text-slate-400 sm:flex">
                        <span className="max-w-36 truncate">{businessName}</span>
                        <span>/</span>
                        <span className="max-w-40 truncate">{breadcrumb}</span>
                    </div>
                    <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                        {title}
                    </h1>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                    <button
                        type="button"
                        onClick={() => onLanguageChange("en")}
                        aria-label={t("English language", "ইংরেজি ভাষা")}
                        aria-pressed={language === "en"}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                            language === "en"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                        EN
                    </button>
                    <button
                        type="button"
                        onClick={() => onLanguageChange("bn")}
                        aria-label={t("Bangla language", "বাংলা ভাষা")}
                        aria-pressed={language === "bn"}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                            language === "bn"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                        বাংলা
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={refreshing}
                    title={t("Refresh Dashboard", "ড্যাশবোর্ড রিফ্রেশ করুন")}
                    aria-label={t("Refresh Dashboard", "ড্যাশবোর্ড রিফ্রেশ করুন")}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={refreshing ? "animate-spin" : ""}
                    />
                    <span className="hidden md:inline">
                        {t("Refresh", "রিফ্রেশ")}
                    </span>
                </button>
            </div>
        </header>
    );
}
