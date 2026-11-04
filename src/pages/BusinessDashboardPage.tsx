
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertCircle, ArrowRight, Building2,
    CheckCircle2, ChevronRight, ClipboardList,
    Layers, MapPin, Store, Users
} from "lucide-react";
import api from "../api/axios";
import BusinessSidebar, { type SidebarSelection } from "./BusinessSidebar";
import BusinessTopbar from "./BusinessTopbar";
import {
    getIcon,
    type Language,
    type DashboardModule,
    type BusinessDashboardData
} from "./businessDashboard.shared";

type Props = {
    businessId?: number;
    language: Language;
    onLanguageChange: (language: Language) => void;
    onBack: () => void;
    onLogout?: () => void;
};

const isActive = (status?: string | null) =>
    (status ?? "").toLowerCase() === "active";

const normalizeModules = (input: unknown): DashboardModule[] => {
    if (!Array.isArray(input)) return [];

    return (input as DashboardModule[])
        .filter(module => module && module.permissions?.can_view)
        .map(module => ({
            ...module,
            menus: (module.menus ?? [])
                .filter(menu => menu.is_active !== false)
                .map(menu => ({
                    ...menu,
                    children: (menu.children ?? [])
                        .filter(child => child.is_active !== false)
                        .sort((a, b) => a.sort_order - b.sort_order)
                }))
                .sort((a, b) => a.sort_order - b.sort_order)
        }))
        .sort((a, b) => a.sort_order - b.sort_order);
};

const getErrorMessage = (error: unknown, fallback: string): string => {
    const e = error as { response?: { data?: { message?: string } } };
    return e?.response?.data?.message ?? fallback;
};

export default function BusinessDashboardPage({
    businessId, language, onLanguageChange, onBack, onLogout
}: Props) {
    const t = (en: string, bn: string) => language === "bn" ? (bn || en) : en;

    const [dashboard, setDashboard] = useState<BusinessDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState<number | "all">("all");

    const [sidebarSelection, setSidebarSelection] = useState<SidebarSelection>({
        moduleSlug: "dashboard",
        menuId: null,
        childMenuId: null
    });

    const resolvedBusinessId = useMemo(() => {
        if (businessId && businessId > 0) return businessId;
        const value = Number(localStorage.getItem("selected_business_id"));
        return Number.isFinite(value) && value > 0 ? value : null;
    }, [businessId]);

    const fetchDashboard = useCallback(async (refresh = false) => {
        if (!resolvedBusinessId) {
            setError("Business ID not found.");
            setLoading(false);
            setRefreshing(false);
            return;
        }

        if (refresh) setRefreshing(true);
        else setLoading(true);
        setError("");

        try {
            const response = await api.get(
                `/businesses/${resolvedBusinessId}/dashboard-config`
            );
            const data = response.data?.data ?? response.data;
            const modules = normalizeModules(data?.modules);

            const result: BusinessDashboardData = {
                business: data.business,
                category: data.category,
                membership: data.membership,
                branches: Array.isArray(data.branches) ? data.branches : [],
                modules
            };

            setDashboard(result);

            setSidebarSelection(previous => {
                const module = modules.find(
                    item => item.slug === previous.moduleSlug
                ) ?? modules.find(item => item.slug === "dashboard")
                    ?? modules[0];

                if (!module) {
                    return {
                        moduleSlug: "",
                        menuId: null,
                        childMenuId: null
                    };
                }

                const menu = module.menus.find(
                    item => item.id === previous.menuId
                );
                const childExists = menu?.children.some(
                    item => item.id === previous.childMenuId
                ) ?? false;

                return {
                    moduleSlug: module.slug,
                    menuId: menu?.id ?? null,
                    childMenuId: childExists ? previous.childMenuId : null
                };
            });

            setSelectedBranchId(previous => {
                const branches = result.branches.filter(
                    branch => isActive(branch.status)
                );
                if (
                    previous !== "all" &&
                    branches.some(branch => branch.id === previous)
                ) return previous;

                return branches.find(branch => branch.is_default)?.id
                    ?? branches[0]?.id ?? "all";
            });
        } catch (requestError) {
            setError(getErrorMessage(
                requestError,
                "Unable to load business dashboard."
            ));
            if (!refresh) setDashboard(null);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [resolvedBusinessId]);

    useEffect(() => {
        void fetchDashboard();
    }, [fetchDashboard]);

    const modules = useMemo(
        () => dashboard?.modules ?? [],
        [dashboard]
    );

    const activeModule = useMemo(
        () => modules.find(
            item => item.slug === sidebarSelection.moduleSlug
        ) ?? null,
        [modules, sidebarSelection.moduleSlug]
    );

    const activeMenu = useMemo(
        () => activeModule?.menus.find(
            item => item.id === sidebarSelection.menuId
        ) ?? null,
        [activeModule, sidebarSelection.menuId]
    );

    const activeChildMenu = useMemo(
        () => activeMenu?.children.find(
            item => item.id === sidebarSelection.childMenuId
        ) ?? null,
        [activeMenu, sidebarSelection.childMenuId]
    );

    const branches = useMemo(
        () => (dashboard?.branches ?? []).filter(
            branch => isActive(branch.status)
        ),
        [dashboard]
    );

    const selectedBranch = branches.find(
        branch => branch.id === selectedBranchId
    ) ?? null;

    const isOverview = !activeModule || activeModule.slug === "dashboard";

    const activeTitle = activeChildMenu?.name
        ?? activeMenu?.name
        ?? activeModule?.name
        ?? t("Dashboard", "ড্যাশবোর্ড");

    const activeIcon = activeChildMenu?.icon
        ?? activeMenu?.icon
        ?? activeModule?.icon
        ?? "LayoutDashboard";

    const ActiveIcon = getIcon(activeIcon);

    const totalMenus = modules.reduce(
        (sum, item) => sum + item.menus.length, 0
    );

    const totalChildren = modules.reduce(
        (sum, item) => sum + item.menus.reduce(
            (count, menu) => count + menu.children.length, 0
        ), 0
    );

    if (loading && !dashboard) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <p className="mt-4 text-sm text-slate-500">
                        {t("Loading dashboard...", "ড্যাশবোর্ড লোড হচ্ছে...")}
                    </p>
                </div>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <AlertCircle size={32} className="mx-auto text-red-500" />
                    <h2 className="mt-3 text-lg font-bold text-slate-900">
                        {t("Unable to load dashboard", "ড্যাশবোর্ড লোড করা যায়নি")}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        {error || t("Please try again.", "আবার চেষ্টা করুন।")}
                    </p>
                    <div className="mt-5 flex justify-center gap-3">
                        <button
                            type="button"
                            onClick={onBack}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                        >
                            {t("Go Back", "ফিরে যান")}
                        </button>
                        <button
                            type="button"
                            onClick={() => void fetchDashboard()}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
                        >
                            {t("Retry", "আবার চেষ্টা করুন")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const stats = [
        {
            label: t("Available Modules", "সক্রিয় মডিউল"),
            value: modules.length,
            icon: Layers
        },
        {
            label: t("Main Menus", "প্রধান মেনু"),
            value: totalMenus,
            icon: ClipboardList
        },
        {
            label: t("Child Menus", "চাইল্ড মেনু"),
            value: totalChildren,
            icon: Store
        },
        {
            label: t("Active Branches", "সক্রিয় ব্রাঞ্চ"),
            value: branches.length,
            icon: MapPin
        }
    ];

    const businessInfo = [
        [t("Business Name", "ব্যবসার নাম"), dashboard.business.name],
        [t("Category", "ক্যাটাগরি"), dashboard.category.name],
        [t("Your Role", "আপনার ভূমিকা"), dashboard.membership.role],
        [t("Status", "স্ট্যাটাস"), dashboard.business.status],
        [t("Currency", "মুদ্রা"), dashboard.business.currency],
        [t("Timezone", "টাইমজোন"), dashboard.business.timezone],
        [t("Phone", "ফোন"), dashboard.business.phone || "—"],
        [t("Email", "ইমেইল"), dashboard.business.email || "—"]
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <BusinessSidebar
                businessName={dashboard.business.name}
                categoryName={dashboard.category.name}
                modules={modules}
                language={language}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                selected={sidebarSelection}
                onSelectionChange={setSidebarSelection}
                onBack={onBack}
                onLogout={onLogout}
            />

            <div className="min-h-screen min-w-0 lg:ml-[276px]">
                <BusinessTopbar
                    title={isOverview ? t("Dashboard", "ড্যাশবোর্ড") : activeTitle}
                    breadcrumb={activeModule?.name ?? t("Overview", "সারসংক্ষেপ")}
                    icon={activeIcon}
                    businessName={dashboard.business.name}
                    language={language}
                    onLanguageChange={onLanguageChange}
                    onOpenSidebar={() => setSidebarOpen(true)}
                    onRefresh={() => void fetchDashboard(true)}
                    refreshing={refreshing}
                />

                <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                    {error && (
                        <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
                                {dashboard.category.name}
                            </p>
                            <h2 className="mt-1 text-2xl font-bold text-slate-900">
                                {isOverview ? dashboard.business.name : activeTitle}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {isOverview
                                    ? t(
                                        "Manage your business from one workspace.",
                                        "এক জায়গা থেকে আপনার ব্যবসা পরিচালনা করুন।"
                                    )
                                    : t(
                                        "Explore your module and its available menus.",
                                        "আপনার মডিউল ও মেনুগুলো দেখুন।"
                                    )}
                            </p>
                        </div>

                        <div className="w-full sm:w-60">
                            <label
                                htmlFor="dashboard-branch"
                                className="mb-1 block text-xs font-medium text-slate-500"
                            >
                                {t("Select Branch", "ব্রাঞ্চ নির্বাচন করুন")}
                            </label>
                            <select
                                id="dashboard-branch"
                                value={selectedBranchId}
                                onChange={event => setSelectedBranchId(
                                    event.target.value === "all"
                                        ? "all"
                                        : Number(event.target.value)
                                )}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            >
                                <option value="all">
                                    {t("All Branches", "সকল ব্রাঞ্চ")}
                                </option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {isOverview ? (
                        <>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {stats.map(item => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={item.label}
                                            className="rounded-2xl border border-slate-200 bg-white p-5"
                                        >
                                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                                <Icon size={20} />
                                            </span>
                                            <p className="mt-5 text-3xl font-bold text-slate-900">
                                                {item.value}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {item.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                                <section className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-2">
                                    <h3 className="font-bold text-slate-900">
                                        {t("Available Modules", "সকল মডিউল")}
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {t(
                                            "Select a module to view its menus.",
                                            "মেনু দেখতে একটি মডিউল নির্বাচন করুন।"
                                        )}
                                    </p>

                                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {modules.filter(module => module.slug !== "dashboard")
                                            .map(module => {
                                                const Icon = getIcon(module.icon);
                                                return (
                                                    <button
                                                        key={module.id}
                                                        type="button"
                                                        onClick={() => setSidebarSelection({
                                                            moduleSlug: module.slug,
                                                            menuId: null,
                                                            childMenuId: null
                                                        })}
                                                        className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                                                    >
                                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                                            <Icon size={20} />
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block truncate text-sm font-semibold">
                                                                {module.name}
                                                            </span>
                                                            <span className="block text-xs text-slate-500">
                                                                {module.menus.length} {t("Menus", "মেনু")}
                                                            </span>
                                                        </span>
                                                        <ArrowRight size={16} className="text-slate-400" />
                                                    </button>
                                                );
                                            })}
                                    </div>

                                    {modules.length === 0 && (
                                        <p className="mt-5 text-sm text-slate-500">
                                            {t(
                                                "No modules available.",
                                                "কোনো মডিউল পাওয়া যায়নি।"
                                            )}
                                        </p>
                                    )}
                                </section>

                                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <div className="flex items-center gap-2">
                                        <Building2 size={19} className="text-blue-600" />
                                        <h3 className="font-bold text-slate-900">
                                            {t("Business Information", "ব্যবসার তথ্য")}
                                        </h3>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {businessInfo.map(([label, value]) => (
                                            <div
                                                key={label}
                                                className="border-b border-slate-100 pb-3 last:border-0"
                                            >
                                                <p className="text-xs text-slate-400">{label}</p>
                                                <p className="mt-1 break-words text-sm font-medium">
                                                    {value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <section className="rounded-2xl border border-slate-200 bg-white p-5">
                                <h3 className="font-bold text-slate-900">
                                    {t("Business Branches", "ব্যবসার ব্রাঞ্চসমূহ")}
                                </h3>
                                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                                    {branches.map(branch => (
                                        <div
                                            key={branch.id}
                                            className="rounded-xl border border-slate-200 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <MapPin size={17} className="shrink-0 text-blue-600" />
                                                    <p className="truncate text-sm font-semibold">
                                                        {branch.name}
                                                    </p>
                                                </div>
                                                {branch.is_default && (
                                                    <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                                                        {t("Default", "ডিফল্ট")}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-3 text-xs text-slate-500">
                                                {t("Code", "কোড")}: {branch.code || "—"}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {branch.address || "—"}
                                            </p>
                                        </div>
                                    ))}
                                    {branches.length === 0 && (
                                        <p className="text-sm text-slate-500">
                                            {t("No branches found.", "কোনো ব্রাঞ্চ পাওয়া যায়নি।")}
                                        </p>
                                    )}
                                </div>
                            </section>
                        </>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 xl:col-span-2">
                                <div className="flex items-start gap-4">
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                        <ActiveIcon size={23} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-500">
                                            {activeModule?.name}
                                            {activeMenu ? ` / ${activeMenu.name}` : ""}
                                        </p>
                                        <h3 className="mt-1 text-xl font-bold">
                                            {activeTitle}
                                        </h3>
                                        <p className="mt-2 text-sm text-slate-500">
                                            {t(
                                                "Available module menus and features.",
                                                "মডিউলের মেনু ও ফিচারসমূহ।"
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    {activeModule?.menus.map(menu => {
                                        const MenuIcon = getIcon(menu.icon);
                                        return (
                                            <div
                                                key={menu.id}
                                                className="rounded-xl border border-slate-200 p-4"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="rounded-lg bg-slate-100 p-2 text-slate-600">
                                                        <MenuIcon size={18} />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold">
                                                            {menu.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {menu.children.length} {t(
                                                                "Child Menus", "চাইল্ড মেনু"
                                                            )}
                                                        </p>
                                                    </div>
                                                    <ChevronRight size={16} className="text-slate-400" />
                                                </div>

                                                {menu.children.length > 0 && (
                                                    <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2">
                                                        {menu.children.map(child => (
                                                            <button
                                                                key={child.id}
                                                                type="button"
                                                                onClick={() => setSidebarSelection({
                                                                    moduleSlug: activeModule.slug,
                                                                    menuId: menu.id,
                                                                    childMenuId: child.id
                                                                })}
                                                                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3 text-left text-xs transition hover:bg-blue-50 hover:text-blue-700"
                                                            >
                                                                <span>{child.name}</span>
                                                                <ArrowRight size={15} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {activeModule?.menus.length === 0 && (
                                        <p className="text-sm text-slate-500">
                                            {t(
                                                "No menus configured for this module.",
                                                "এই মডিউলে কোনো মেনু সেট করা নেই।"
                                            )}
                                        </p>
                                    )}
                                </div>
                            </section>

                            <div className="space-y-5">
                                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <div className="flex items-center gap-2">
                                        <Users size={18} className="text-blue-600" />
                                        <h3 className="text-sm font-bold">
                                            {t("Your Permissions", "আপনার অনুমতিসমূহ")}
                                        </h3>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        {([
                                            ["can_view", t("View", "দেখুন")],
                                            ["can_create", t("Create", "তৈরি")],
                                            ["can_update", t("Update", "আপডেট")],
                                            ["can_delete", t("Delete", "ডিলিট")]
                                        ] as const).map(([key, label]) => (
                                            <div
                                                key={key}
                                                className="flex items-center justify-between"
                                            >
                                                <span className="text-sm text-slate-600">
                                                    {label}
                                                </span>
                                                <CheckCircle2
                                                    size={18}
                                                    className={
                                                        activeModule?.permissions[key]
                                                            ? "text-emerald-500"
                                                            : "text-slate-200"
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <div className="flex items-center gap-2">
                                        <Building2 size={18} className="text-blue-600" />
                                        <h3 className="text-sm font-bold">
                                            {t("Selected Branch", "নির্বাচিত ব্রাঞ্চ")}
                                        </h3>
                                    </div>
                                    <p className="mt-3 text-sm font-medium text-slate-700">
                                        {selectedBranch?.name
                                            ?? t("All Branches", "সকল ব্রাঞ্চ")}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {selectedBranch?.code ?? dashboard.business.name}
                                    </p>
                                </section>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
