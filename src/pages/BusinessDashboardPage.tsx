import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ComponentType,
} from "react";
import { useNavigate } from "react-router-dom";

import {
    Activity,
    AlertCircle,
    ArrowLeft,
    BarChart3,
    BookOpen,
    Boxes,
    Building2,
    CheckCircle2,
    ChefHat,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    Globe2,
    LayoutDashboard,
    LogOut,
    Menu as MenuIcon,
    Package,
    Pill,
    RefreshCw,
    Settings,
    ShoppingBag,
    ShoppingCart,
    Store,
    Truck,
    Users,
    X,
    Layers,
} from "lucide-react";

import type { LucideProps } from "lucide-react";
import api from "../api/axios";

type Language = "en" | "bn";

type DashboardPermission = {
    can_view: boolean;
    can_create: boolean;
    can_update: boolean;
    can_delete: boolean;
};

type DashboardChildMenu = {
    id: number;
    app_menu_id: number;
    name: string;
    slug: string;
    icon: string | null;
    route: string | null;
    sort_order: number;
    is_active: boolean;
};

type DashboardMenu = {
    id: number;
    app_module_id: number;
    name: string;
    slug: string;
    icon: string | null;
    route: string | null;
    sort_order: number;
    is_active: boolean;
    children: DashboardChildMenu[];
};

type DashboardModule = {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    route: string | null;
    sort_order: number;
    permissions: DashboardPermission;
    menus: DashboardMenu[];
};

type DashboardBranch = {
    id: number;
    name: string;
    code?: string;
    phone?: string | null;
    address?: string | null;
    status: string;
    is_default?: boolean;
};

type BusinessDashboardData = {
    business: {
        id: number;
        name: string;
        slug: string;
        country: string;
        currency: string;
        timezone: string;
        phone: string | null;
        email: string | null;
        status: string;
    };
    category: {
        id: number;
        name: string;
        slug: string;
    };
    membership: {
        id: number;
        role: string;
        status: string;
    };
    branches: DashboardBranch[];
    modules: DashboardModule[];
};

type BusinessDashboardPageProps = {
    businessId?: number;
    language: Language;
    onLanguageChange: (language: Language) => void;
    onBack: () => void;
    onLogout?: () => void;
};

type IconComponent = ComponentType<LucideProps>;

const iconMap: Record<string, IconComponent> = {
    Activity,
    BarChart3,
    BookOpen,
    Boxes,
    Building2,
    ChefHat,
    ClipboardList,
    Globe2,
    LayoutDashboard,
    Package,
    Pill,
    Settings,
    ShoppingBag,
    ShoppingCart,
    Store,
    Truck,
    Users,
    Layers,
};

const getIcon = (name?: string | null): IconComponent => {
    if (!name) return LayoutDashboard;

    return iconMap[name] ?? LayoutDashboard;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
    const axiosError = error as {
        response?: {
            data?: {
                message?: string;
            };
        };
    };

    return axiosError?.response?.data?.message ?? fallback;
};

const normalizeModules = (modules: unknown): DashboardModule[] => {
    if (!Array.isArray(modules)) return [];

    return modules.map((module) => {
        const item = module as Partial<DashboardModule>;

        const menus = Array.isArray(item.menus)
            ? item.menus
            : [];

        return {
            id: Number(item.id ?? 0),
            name: item.name ?? "Untitled Module",
            slug: item.slug ?? "",
            icon: item.icon ?? null,
            route: item.route ?? null,
            sort_order: Number(item.sort_order ?? 0),
            permissions: {
                can_view: Boolean(item.permissions?.can_view),
                can_create: Boolean(item.permissions?.can_create),
                can_update: Boolean(item.permissions?.can_update),
                can_delete: Boolean(item.permissions?.can_delete),
            },
            menus: menus
                .map((menu) => {
                    const menuItem = menu as Partial<DashboardMenu>;

                    return {
                        id: Number(menuItem.id ?? 0),
                        app_module_id: Number(
                            menuItem.app_module_id ?? item.id ?? 0,
                        ),
                        name: menuItem.name ?? "Untitled Menu",
                        slug: menuItem.slug ?? "",
                        icon: menuItem.icon ?? null,
                        route: menuItem.route ?? null,
                        sort_order: Number(menuItem.sort_order ?? 0),
                        is_active: menuItem.is_active !== false,
                        children: Array.isArray(menuItem.children)
                            ? menuItem.children
                                .map((child) => {
                                    const childItem =
                                        child as Partial<DashboardChildMenu>;

                                    return {
                                        id: Number(childItem.id ?? 0),
                                        app_menu_id: Number(
                                            childItem.app_menu_id ??
                                                menuItem.id ??
                                                0,
                                        ),
                                        name:
                                            childItem.name ??
                                            "Untitled Child Menu",
                                        slug: childItem.slug ?? "",
                                        icon: childItem.icon ?? null,
                                        route: childItem.route ?? null,
                                        sort_order: Number(
                                            childItem.sort_order ?? 0,
                                        ),
                                        is_active:
                                            childItem.is_active !== false,
                                    };
                                })
                                .filter((child) => child.is_active)
                                .sort(
                                    (a, b) => a.sort_order - b.sort_order,
                                )
                            : [],
                    };
                })
                .filter((menu) => menu.is_active)
                .sort((a, b) => a.sort_order - b.sort_order),
        };
    }).sort((a, b) => a.sort_order - b.sort_order);
};

const translations = {
    en: {
        dashboard: "Dashboard",
        overview: "Business overview",
        welcome: "Welcome to your business dashboard",
        modules: "Available Modules",
        branches: "Branches",
        businessInfo: "Business Information",
        businessName: "Business Name",
        category: "Business Category",
        role: "Your Role",
        status: "Status",
        currency: "Currency",
        timezone: "Timezone",
        phone: "Phone",
        email: "Email",
        selectBranch: "Select Branch",
        allBranches: "All Branches",
        totalModules: "Available Modules",
        activeModules: "Active Modules",
        totalBranches: "Total Branches",
        permissions: "Your Permissions",
        view: "View",
        create: "Create",
        update: "Update",
        delete: "Delete",
        noModules: "No modules are available for this business.",
        noBranches: "No branches found.",
        loading: "Loading dashboard...",
        loadError: "Unable to load business dashboard.",
        retry: "Retry",
        refresh: "Refresh",
        back: "Back to Businesses",
        logout: "Logout",
        language: "Language",
        selectModule: "Select a module from the sidebar.",
        selectedItem: "Selected Menu",
        route: "Route",
        noRoute: "No route configured",
        noMenus: "No menus configured for this module.",
        noChildren: "No child menus configured.",
        moduleDetails: "Module Details",
        expand: "Expand",
        collapse: "Collapse",
        active: "Active",
        inactive: "Inactive",
        branch: "Branch",
        branchCode: "Branch Code",
        address: "Address",
        menuCount: "Menus",
        childMenuCount: "Child Menus",
    },
    bn: {
        dashboard: "ড্যাশবোর্ড",
        overview: "ব্যবসার সারসংক্ষেপ",
        welcome: "আপনার বিজনেস ড্যাশবোর্ডে স্বাগতম",
        modules: "সকল মডিউল",
        branches: "শাখাসমূহ",
        businessInfo: "ব্যবসার তথ্য",
        businessName: "ব্যবসার নাম",
        category: "ব্যবসার ধরন",
        role: "আপনার ভূমিকা",
        status: "স্ট্যাটাস",
        currency: "মুদ্রা",
        timezone: "টাইমজোন",
        phone: "ফোন",
        email: "ইমেইল",
        selectBranch: "শাখা নির্বাচন করুন",
        allBranches: "সকল শাখা",
        totalModules: "সক্রিয় মডিউল",
        activeModules: "অনুমোদিত মডিউল",
        totalBranches: "মোট শাখা",
        permissions: "আপনার অনুমতিসমূহ",
        view: "দেখুন",
        create: "তৈরি",
        update: "আপডেট",
        delete: "ডিলিট",
        noModules: "এই ব্যবসার জন্য কোনো মডিউল নেই।",
        noBranches: "কোনো শাখা পাওয়া যায়নি।",
        loading: "ড্যাশবোর্ড লোড হচ্ছে...",
        loadError: "বিজনেস ড্যাশবোর্ড লোড করা যায়নি।",
        retry: "আবার চেষ্টা করুন",
        refresh: "রিফ্রেশ",
        back: "ব্যবসার তালিকায় ফিরুন",
        logout: "লগআউট",
        language: "ভাষা",
        selectModule: "সাইডবার থেকে একটি মডিউল নির্বাচন করুন।",
        selectedItem: "নির্বাচিত মেনু",
        route: "রুট",
        noRoute: "কোনো রুট সেট করা নেই",
        noMenus: "এই মডিউলে কোনো মেনু সেট করা নেই।",
        noChildren: "কোনো চাইল্ড মেনু সেট করা নেই।",
        moduleDetails: "মডিউলের বিস্তারিত",
        expand: "খুলুন",
        collapse: "বন্ধ করুন",
        active: "সক্রিয়",
        inactive: "নিষ্ক্রিয়",
        branch: "শাখা",
        branchCode: "শাখার কোড",
        address: "ঠিকানা",
        menuCount: "মেনু",
        childMenuCount: "চাইল্ড মেনু",
    },
};

export default function BusinessDashboardPage({
    businessId,
    language,
    onLanguageChange,
    onBack,
    onLogout,
}: BusinessDashboardPageProps) {
    const t = translations[language];
    const navigate = useNavigate();

    const [dashboard, setDashboard] =
        useState<BusinessDashboardData | null>(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [selectedBranchId, setSelectedBranchId] =
        useState<number | "all">("all");

    const [activeModuleSlug, setActiveModuleSlug] =
        useState("dashboard");

    const [activeMenuId, setActiveMenuId] =
        useState<number | null>(null);

    const [activeChildMenuId, setActiveChildMenuId] =
        useState<number | null>(null);

    const [expandedModuleSlugs, setExpandedModuleSlugs] =
        useState<string[]>(["dashboard"]);

        const [expandedMenuIds, setExpandedMenuIds] = useState<number[]>([]);

    const resolvedBusinessId = useMemo(() => {
        if (businessId && businessId > 0) {
            return businessId;
        }

        const storedId = localStorage.getItem("selected_business_id");
        const parsedId = Number(storedId);

        return Number.isFinite(parsedId) && parsedId > 0
            ? parsedId
            : null;
    }, [businessId]);

    const fetchDashboard = useCallback(
        async (showRefresh = false) => {
            if (!resolvedBusinessId) {
                setError(
                    language === "bn"
                        ? "ব্যবসার ID পাওয়া যায়নি। আবার ব্যবসা নির্বাচন করুন।"
                        : "Business ID was not found. Please select a business again.",
                );
                setLoading(false);
                setRefreshing(false);
                return;
            }

            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            try {
                const response = await api.get(
                    `/businesses/${resolvedBusinessId}/dashboard-config`,
                );

                const responseData =
                    response.data?.data ?? response.data;

                const normalizedModules = normalizeModules(
                    responseData?.modules,
                );

                const nextDashboard: BusinessDashboardData = {
                    business: responseData.business,
                    category: responseData.category,
                    membership: responseData.membership,
                    branches: Array.isArray(responseData.branches)
                        ? responseData.branches
                        : [],
                    modules: normalizedModules,
                };

                setDashboard(nextDashboard);

                const firstVisibleModule =
                    normalizedModules.find(
                        (module) => module.permissions.can_view,
                    );

                if (
                    !normalizedModules.some(
                        (module) =>
                            module.slug === activeModuleSlug &&
                            module.permissions.can_view,
                    )
                ) {
                    setActiveModuleSlug(
                        firstVisibleModule?.slug ?? "dashboard",
                    );
                    setActiveMenuId(null);
                    setActiveChildMenuId(null);
                }

                if (firstVisibleModule) {
                    setExpandedModuleSlugs((previous) =>
                        previous.includes(firstVisibleModule.slug)
                            ? previous
                            : [...previous, firstVisibleModule.slug],
                    );
                }

                setSelectedBranchId((previous) => {
                    const activeBranches = nextDashboard.branches.filter(
                        (branch) => branch.status === "active",
                    );

                    if (
                        previous !== "all" &&
                        activeBranches.some(
                            (branch) => branch.id === previous,
                        )
                    ) {
                        return previous;
                    }

                    const defaultBranch = activeBranches.find(
                        (branch) => branch.is_default,
                    );

                    return defaultBranch?.id ?? "all";
                });
            } catch (requestError) {
                setError(
                    getErrorMessage(requestError, t.loadError),
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [
            resolvedBusinessId,
            language,
            t.loadError,
            activeModuleSlug,
        ],
    );

    useEffect(() => {
        void fetchDashboard();
    }, [fetchDashboard]);

    const visibleModules = useMemo(() => {
        return (dashboard?.modules ?? []).filter(
            (module) => module.permissions.can_view,
        );
    }, [dashboard]);

    const activeModule = useMemo(() => {
        return visibleModules.find(
            (module) => module.slug === activeModuleSlug,
        ) ?? null;
    }, [visibleModules, activeModuleSlug]);

    const activeMenu = useMemo(() => {
        if (!activeModule || activeMenuId === null) {
            return null;
        }

        return activeModule.menus.find(
            (menu) => menu.id === activeMenuId,
        ) ?? null;
    }, [activeModule, activeMenuId]);

    const activeChildMenu = useMemo(() => {
        if (!activeMenu || activeChildMenuId === null) {
            return null;
        }

        return activeMenu.children.find(
            (child) => child.id === activeChildMenuId,
        ) ?? null;
    }, [activeMenu, activeChildMenuId]);

    const activeBranches = useMemo(() => {
        return (dashboard?.branches ?? []).filter(
            (branch) => branch.status === "active",
        );
    }, [dashboard]);

    const selectedBranch = useMemo(() => {
        if (selectedBranchId === "all") {
            return null;
        }

        return activeBranches.find(
            (branch) => branch.id === selectedBranchId,
        ) ?? null;
    }, [activeBranches, selectedBranchId]);

    const totalMenus = useMemo(
        () =>
            visibleModules.reduce(
                (total, module) => total + module.menus.length,
                0,
            ),
        [visibleModules],
    );

    const totalChildMenus = useMemo(
        () =>
            visibleModules.reduce(
                (total, module) =>
                    total +
                    module.menus.reduce(
                        (menuTotal, menu) =>
                            menuTotal + menu.children.length,
                        0,
                    ),
                0,
            ),
        [visibleModules],
    );

    const toggleModule = (slug: string) => {
        setExpandedModuleSlugs((previous) =>
            previous.includes(slug)
                ? previous.filter((item) => item !== slug)
                : [...previous, slug],
        );
    };

    const selectModule = (module: DashboardModule) => {
        setActiveModuleSlug(module.slug);
        setActiveMenuId(null);
        setActiveChildMenuId(null);
        setSidebarOpen(false);

        if (module.route) {
            navigate(module.route);
            return;
        }

        if (module.menus.length > 0) {
            setExpandedModuleSlugs((previous) =>
                previous.includes(module.slug)
                    ? previous
                    : [...previous, module.slug],
            );
        }
    };

    const selectMenu = (
        module: DashboardModule,
        menu: DashboardMenu,
    ) => {
        setActiveModuleSlug(module.slug);
        setActiveMenuId(menu.id);
        setActiveChildMenuId(null);
        setSidebarOpen(false);

        if (menu.route) {
            navigate(menu.route);
            return;
        }

        if (menu.children.length > 0) {
            setExpandedMenuIds((previous) =>
                previous.includes(menu.id)
                    ? previous
                    : [...previous, menu.id],
            );
        }
    };

    const selectChildMenu = (
        module: DashboardModule,
        menu: DashboardMenu,
        child: DashboardChildMenu,
    ) => {
        setActiveModuleSlug(module.slug);
        setActiveMenuId(menu.id);
        setActiveChildMenuId(child.id);
        setSidebarOpen(false);

        if (child.route) {
            navigate(child.route);
        }
    };

    const activeTitle =
        activeChildMenu?.name ??
        activeMenu?.name ??
        activeModule?.name ??
        t.dashboard;

    const activeRoute =
        activeChildMenu?.route ??
        activeMenu?.route ??
        activeModule?.route ??
        null;

    const ActiveIcon = getIcon(
        activeChildMenu?.icon ??
            activeMenu?.icon ??
            activeModule?.icon,
    );

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <p className="text-sm font-medium text-slate-600">
                        {t.loading}
                    </p>
                </div>
            </div>
        );
    }

    if (error && !dashboard) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                        <AlertCircle size={24} />
                    </div>

                    <h2 className="text-lg font-semibold text-slate-900">
                        {t.loadError}
                    </h2>

                    <p className="mt-2 break-words text-sm text-slate-600">
                        {error}
                    </p>

                    <div className="mt-6 flex justify-center gap-3">
                        <button
                            type="button"
                            onClick={onBack}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            {t.back}
                        </button>

                        <button
                            type="button"
                            onClick={() => void fetchDashboard()}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            {t.retry}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!dashboard) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }`}
            >
                <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 px-5">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveModuleSlug("dashboard");
                            setActiveMenuId(null);
                            setActiveChildMenuId(null);
                        }}
                        className="flex min-w-0 items-center gap-3 text-left"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                            <Store size={21} />
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                                {dashboard.business.name}
                            </p>
                            <p className="text-xs text-slate-500">
                                {dashboard.category.name}
                            </p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X size={19} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-4">
                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        {t.modules}
                    </p>

                    <nav className="space-y-1">
                        {visibleModules.map((module) => {
                            const ModuleIcon = getIcon(module.icon);
                            const isActiveModule =
                                activeModuleSlug === module.slug;
                            const isExpanded =
                                expandedModuleSlugs.includes(module.slug);
                            const hasMenus = module.menus.length > 0;

                            return (
                                <div key={module.id}>
                                    <div
                                        className={`flex items-center rounded-lg transition ${
                                            isActiveModule
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                selectModule(module)
                                            }
                                            className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left"
                                        >
                                            <ModuleIcon
                                                size={18}
                                                className="shrink-0"
                                            />

                                            <span className="truncate text-sm font-medium">
                                                {module.name}
                                            </span>
                                        </button>

                                        {hasMenus && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleModule(module.slug)
                                                }
                                                aria-label={
                                                    isExpanded
                                                        ? t.collapse
                                                        : t.expand
                                                }
                                                className="mr-1 rounded-md p-2 hover:bg-black/5"
                                            >
                                                {isExpanded ? (
                                                    <ChevronDown size={16} />
                                                ) : (
                                                    <ChevronRight size={16} />
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {hasMenus && isExpanded && (
                                        <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-3">
                                            {module.menus.map((menu) => {
                                                const MenuIcon = getIcon(
                                                    menu.icon,
                                                );

                                                const isActiveMenu =
                                                    isActiveModule &&
                                                    activeMenuId === menu.id;

                                                const hasChildren =
                                                    menu.children.length > 0;

                                                return (
                                                    <div key={menu.id}>
                                                        <div
                                                            className={`flex items-center rounded-lg ${
                                                                isActiveMenu
                                                                    ? "bg-blue-50 text-blue-700"
                                                                    : "text-slate-600 hover:bg-slate-50"
                                                            }`}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (
                                                                        hasChildren
                                                                    ) {
                                                                        setActiveModuleSlug(
                                                                            module.slug,
                                                                        );
                                                                        setActiveMenuId(
                                                                            menu.id,
                                                                        );
                                                                        setActiveChildMenuId(
                                                                            null,
                                                                        );

                                                                        toggleModuleMenu(
                                                                            menu.id,
                                                                        );
                                                                    } else {
                                                                        selectMenu(
                                                                            module,
                                                                            menu,
                                                                        );
                                                                    }
                                                                }}
                                                                className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 text-left"
                                                            >
                                                                <MenuIcon
                                                                    size={15}
                                                                    className="shrink-0"
                                                                />

                                                                <span className="truncate text-[13px] font-medium">
                                                                    {menu.name}
                                                                </span>
                                                            </button>

                                                            {hasChildren && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        toggleMenuExpansion(
                                                                            menu.id,
                                                                        )
                                                                    }
                                                                    className="mr-1 rounded-md p-1.5 hover:bg-black/5"
                                                                    aria-label={
                                                                        expandedMenuIds.includes(
                                                                            menu.id,
                                                                        )
                                                                            ? t.collapse
                                                                            : t.expand
                                                                    }
                                                                >
                                                                    {expandedMenuIds.includes(
                                                                        menu.id,
                                                                    ) ? (
                                                                        <ChevronDown
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <ChevronRight
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>

                                                        {hasChildren &&
                                                            expandedMenuIds.includes(
                                                                menu.id,
                                                            ) && (
                                                                <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-3">
                                                                    {menu.children.map(
                                                                        (
                                                                            child,
                                                                        ) => {
                                                                            const ChildIcon =
                                                                                getIcon(
                                                                                    child.icon,
                                                                                );

                                                                            const isActiveChild =
                                                                                isActiveModule &&
                                                                                activeMenuId ===
                                                                                    menu.id &&
                                                                                activeChildMenuId ===
                                                                                    child.id;

                                                                            return (
                                                                                <button
                                                                                    type="button"
                                                                                    key={
                                                                                        child.id
                                                                                    }
                                                                                    onClick={() =>
                                                                                        selectChildMenu(
                                                                                            module,
                                                                                            menu,
                                                                                            child,
                                                                                        )
                                                                                    }
                                                                                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
                                                                                        isActiveChild
                                                                                            ? "bg-blue-600 text-white"
                                                                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                                                                    }`}
                                                                                >
                                                                                    <ChildIcon
                                                                                        size={
                                                                                            14
                                                                                        }
                                                                                        className="shrink-0"
                                                                                    />

                                                                                    <span className="truncate text-xs font-medium">
                                                                                        {
                                                                                            child.name
                                                                                        }
                                                                                    </span>
                                                                                </button>
                                                                            );
                                                                        },
                                                                    )}
                                                                </div>
                                                            )}
                                                    </div>
                                                );
                                            })}

                                            {module.menus.length === 0 && (
                                                <p className="px-3 py-2 text-xs text-slate-400">
                                                    {t.noMenus}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {visibleModules.length === 0 && (
                        <p className="px-3 py-4 text-sm text-slate-500">
                            {t.noModules}
                        </p>
                    )}
                </div>

                <div className="shrink-0 border-t border-slate-200 p-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                        <ArrowLeft size={17} />
                        {t.back}
                    </button>

                    {onLogout && (
                        <button
                            type="button"
                            onClick={onLogout}
                            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                            <LogOut size={17} />
                            {t.logout}
                        </button>
                    )}
                </div>
            </aside>

            <div className="min-h-screen lg:pl-[280px]">
                <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                            aria-label="Open sidebar"
                        >
                            <MenuIcon size={21} />
                        </button>

                        <div className="flex min-w-0 items-center gap-3">
                            <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 sm:flex">
                                <ActiveIcon size={19} />
                            </div>

                            <div className="min-w-0">
                                <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                                    {activeTitle}
                                </h1>

                                <p className="hidden truncate text-xs text-slate-500 sm:block">
                                    {activeChildMenu
                                        ? `${activeModule?.name} / ${activeMenu?.name}`
                                        : activeMenu
                                          ? activeModule?.name
                                          : t.overview}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                onLanguageChange(
                                    language === "en" ? "bn" : "en",
                                )
                            }
                            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                            title={t.language}
                        >
                            <Globe2 size={16} />
                            <span>{language === "en" ? "EN" : "বাংলা"}</span>
                        </button>

                        <button
                            type="button"
                            disabled={refreshing}
                            onClick={() => void fetchDashboard(true)}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
                        >
                            <RefreshCw
                                size={16}
                                className={
                                    refreshing ? "animate-spin" : ""
                                }
                            />
                            <span className="hidden sm:inline">
                                {t.refresh}
                            </span>
                        </button>
                    </div>
                </header>

                <main className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
                    {error && (
                        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            <AlertCircle
                                size={18}
                                className="mt-0.5 shrink-0"
                            />
                            <p>{error}</p>
                        </div>
                    )}

                    {activeModuleSlug === "dashboard" &&
                    !activeMenu &&
                    !activeChildMenu ? (
                        <>
                            <section className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white sm:flex-row sm:items-center sm:p-8">
                                <div>
                                    <p className="text-sm font-medium text-blue-100">
                                        {t.overview}
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                                        {t.welcome}
                                    </h2>

                                    <p className="mt-2 text-sm text-blue-100">
                                        {dashboard.business.name}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4">
                                    <Building2 size={24} />

                                    <div>
                                        <p className="text-xs text-blue-100">
                                            {t.role}
                                        </p>
                                        <p className="font-semibold capitalize">
                                            {dashboard.membership.role}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <SummaryCard
                                    title={t.activeModules}
                                    value={visibleModules.length}
                                    icon={Layers}
                                    description={t.modules}
                                />

                                <SummaryCard
                                    title={t.menuCount}
                                    value={totalMenus}
                                    icon={ClipboardList}
                                    description={t.modules}
                                />

                                <SummaryCard
                                    title={t.childMenuCount}
                                    value={totalChildMenus}
                                    icon={BookOpen}
                                    description={t.modules}
                                />

                                <SummaryCard
                                    title={t.totalBranches}
                                    value={activeBranches.length}
                                    icon={Building2}
                                    description={t.branches}
                                />
                            </section>

                            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 xl:col-span-2">
                                    <div className="mb-5 flex items-center justify-between gap-3">
                                        <div>
                                            <h3 className="font-bold text-slate-900">
                                                {t.modules}
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {t.overview}
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                            {visibleModules.length}
                                        </span>
                                    </div>

                                    {visibleModules.length === 0 ? (
                                        <EmptyState text={t.noModules} />
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {visibleModules.map((module) => {
                                                const ModuleIcon = getIcon(
                                                    module.icon,
                                                );

                                                return (
                                                    <button
                                                        type="button"
                                                        key={module.id}
                                                        onClick={() =>
                                                            selectModule(module)
                                                        }
                                                        className="group flex items-start gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/50"
                                                    >
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-blue-100 group-hover:text-blue-700">
                                                            <ModuleIcon
                                                                size={21}
                                                            />
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-semibold text-slate-800">
                                                                {module.name}
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-500">
                                                                {module.menus.length}{" "}
                                                                {t.menuCount}
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-500">
                                                                {module.menus.reduce(
                                                                    (
                                                                        total,
                                                                        menu,
                                                                    ) =>
                                                                        total +
                                                                        menu
                                                                            .children
                                                                            .length,
                                                                    0,
                                                                )}{" "}
                                                                {t.childMenuCount}
                                                            </p>
                                                        </div>

                                                        <ChevronRight
                                                            size={17}
                                                            className="mt-1 shrink-0 text-slate-400 group-hover:text-blue-600"
                                                        />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                                    <h3 className="font-bold text-slate-900">
                                        {t.branches}
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {t.selectBranch}
                                    </p>

                                    <select
                                        value={selectedBranchId}
                                        onChange={(event) => {
                                            const value = event.target.value;

                                            setSelectedBranchId(
                                                value === "all"
                                                    ? "all"
                                                    : Number(value),
                                            );
                                        }}
                                        className="mt-4 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="all">
                                            {t.allBranches}
                                        </option>

                                        {activeBranches.map((branch) => (
                                            <option
                                                key={branch.id}
                                                value={branch.id}
                                            >
                                                {branch.name}
                                                {branch.is_default
                                                    ? " (Default)"
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>

                                    {activeBranches.length === 0 ? (
                                        <div className="mt-4">
                                            <EmptyState text={t.noBranches} />
                                        </div>
                                    ) : selectedBranch ? (
                                        <div className="mt-4 rounded-xl bg-slate-50 p-4">
                                            <p className="font-semibold text-slate-800">
                                                {selectedBranch.name}
                                            </p>

                                            {selectedBranch.code && (
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {t.branchCode}:{" "}
                                                    {selectedBranch.code}
                                                </p>
                                            )}

                                            {selectedBranch.address && (
                                                <p className="mt-2 text-sm text-slate-500">
                                                    {selectedBranch.address}
                                                </p>
                                            )}

                                            {selectedBranch.phone && (
                                                <p className="mt-2 text-sm text-slate-500">
                                                    {selectedBranch.phone}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-4 rounded-xl bg-slate-50 p-4">
                                            <p className="text-sm text-slate-600">
                                                {activeBranches.length}{" "}
                                                {t.totalBranches}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <Building2 size={20} />
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-slate-900">
                                            {t.businessInfo}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            {dashboard.business.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                    <InfoItem
                                        label={t.businessName}
                                        value={dashboard.business.name}
                                    />

                                    <InfoItem
                                        label={t.category}
                                        value={dashboard.category.name}
                                    />

                                    <InfoItem
                                        label={t.role}
                                        value={dashboard.membership.role}
                                        capitalize
                                    />

                                    <InfoItem
                                        label={t.status}
                                        value={dashboard.business.status}
                                        capitalize
                                    />

                                    <InfoItem
                                        label={t.currency}
                                        value={dashboard.business.currency}
                                    />

                                    <InfoItem
                                        label={t.timezone}
                                        value={dashboard.business.timezone}
                                    />

                                    <InfoItem
                                        label={t.phone}
                                        value={
                                            dashboard.business.phone || "—"
                                        }
                                    />

                                    <InfoItem
                                        label={t.email}
                                        value={
                                            dashboard.business.email || "—"
                                        }
                                    />

                                    <InfoItem
                                        label={t.branches}
                                        value={String(activeBranches.length)}
                                    />
                                </div>
                            </section>
                        </>
                    ) : (
                        <section className="space-y-6">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                        <ActiveIcon size={23} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            {activeModule?.name ??
                                                t.dashboard}
                                        </p>

                                        <h2 className="mt-1 break-words text-xl font-bold text-slate-900 sm:text-2xl">
                                            {activeTitle}
                                        </h2>

                                        <p className="mt-2 text-sm text-slate-500">
                                            {activeChildMenu
                                                ? `${activeModule?.name} / ${activeMenu?.name} / ${activeChildMenu.name}`
                                                : activeMenu
                                                  ? `${activeModule?.name} / ${activeMenu.name}`
                                                  : t.moduleDetails}
                                        </p>
                                    </div>

                                    <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                        {t.active}
                                    </span>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs font-medium text-slate-500">
                                            {t.route}
                                        </p>

                                        <p className="mt-2 break-all font-mono text-sm text-slate-800">
                                            {activeRoute || t.noRoute}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs font-medium text-slate-500">
                                            {t.selectedItem}
                                        </p>

                                        <p className="mt-2 text-sm font-semibold text-slate-800">
                                            {activeTitle}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {activeModule && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                            <CheckCircle2 size={20} />
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-slate-900">
                                                {t.permissions}
                                            </h3>

                                            <p className="text-sm text-slate-500">
                                                {activeModule.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        <PermissionItem
                                            label={t.view}
                                            enabled={
                                                activeModule.permissions
                                                    .can_view
                                            }
                                        />

                                        <PermissionItem
                                            label={t.create}
                                            enabled={
                                                activeModule.permissions
                                                    .can_create
                                            }
                                        />

                                        <PermissionItem
                                            label={t.update}
                                            enabled={
                                                activeModule.permissions
                                                    .can_update
                                            }
                                        />

                                        <PermissionItem
                                            label={t.delete}
                                            enabled={
                                                activeModule.permissions
                                                    .can_delete
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            {activeModule && !activeMenu && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-slate-900">
                                            {activeModule.name} — {t.menuCount}
                                        </h3>
                                    </div>

                                    {activeModule.menus.length === 0 ? (
                                        <EmptyState text={t.noMenus} />
                                    ) : (
                                        <div className="space-y-3">
                                            {activeModule.menus.map((menu) => {
                                                const MenuIcon = getIcon(
                                                    menu.icon,
                                                );

                                                return (
                                                    <button
                                                        type="button"
                                                        key={menu.id}
                                                        onClick={() =>
                                                            selectMenu(
                                                                activeModule,
                                                                menu,
                                                            )
                                                        }
                                                        className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-blue-300 hover:bg-blue-50/50"
                                                    >
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                                            <MenuIcon size={19} />
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium text-slate-800">
                                                                {menu.name}
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-500">
                                                                {menu.children.length}{" "}
                                                                {t.childMenuCount}
                                                            </p>
                                                        </div>

                                                        <ChevronRight
                                                            size={17}
                                                            className="text-slate-400"
                                                        />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeMenu && !activeChildMenu && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-slate-900">
                                            {activeMenu.name} —{" "}
                                            {t.childMenuCount}
                                        </h3>
                                    </div>

                                    {activeMenu.children.length === 0 ? (
                                        <EmptyState text={t.noChildren} />
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {activeMenu.children.map(
                                                (child) => {
                                                    const ChildIcon = getIcon(
                                                        child.icon,
                                                    );

                                                    return (
                                                        <button
                                                            type="button"
                                                            key={child.id}
                                                            onClick={() =>
                                                                selectChildMenu(
                                                                    activeModule!,
                                                                    activeMenu,
                                                                    child,
                                                                )
                                                            }
                                                            className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-blue-300 hover:bg-blue-50/50"
                                                        >
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                                                <ChildIcon
                                                                    size={19}
                                                                />
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-medium text-slate-800">
                                                                    {child.name}
                                                                </p>

                                                                <p className="mt-1 truncate font-mono text-xs text-slate-500">
                                                                    {child.route ||
                                                                        t.noRoute}
                                                                </p>
                                                            </div>

                                                            <ChevronRight
                                                                size={17}
                                                                className="text-slate-400"
                                                            />
                                                        </button>
                                                    );
                                                },
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeChildMenu && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                            <ActiveIcon size={20} />
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="font-bold text-slate-900">
                                                {activeChildMenu.name}
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {activeMenu?.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-xs font-medium text-slate-500">
                                            {t.route}
                                        </p>

                                        <p className="mt-2 break-all font-mono text-sm text-slate-800">
                                            {activeChildMenu.route ||
                                                t.noRoute}
                                        </p>
                                    </div>

                                    <p className="mt-4 text-sm text-slate-500">
                                        {t.businessInfo}:{" "}
                                        {dashboard.business.name}
                                    </p>
                                </div>
                            )}
                        </section>
                    )}
                </main>
            </div>
        </div>
    );

    function toggleModuleMenu(menuId: number) {
        setExpandedMenuIds((previous) =>
            previous.includes(menuId)
                ? previous.filter((id) => id !== menuId)
                : [...previous, menuId],
        );
    }

    function toggleMenuExpansion(menuId: number) {
        setExpandedMenuIds((previous) =>
            previous.includes(menuId)
                ? previous.filter((id) => id !== menuId)
                : [...previous, menuId],
        );
    }
}

function SummaryCard({
    title,
    value,
    icon: Icon,
    description,
}: {
    title: string;
    value: number;
    icon: IconComponent;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-3 text-3xl font-bold text-slate-900">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        {description}
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Icon size={21} />
                </div>
            </div>
        </div>
    );
}

function InfoItem({
    label,
    value,
    capitalize = false,
}: {
    label: string;
    value: string;
    capitalize?: boolean;
}) {
    return (
        <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>

            <p
                className={`mt-1 break-words text-sm font-semibold text-slate-800 ${
                    capitalize ? "capitalize" : ""
                }`}
            >
                {value}
            </p>
        </div>
    );
}

function PermissionItem({
    label,
    enabled,
}: {
    label: string;
    enabled: boolean;
}) {
    return (
        <div
            className={`flex items-center gap-2 rounded-xl border p-3 ${
                enabled
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-slate-200 bg-slate-50 text-slate-400"
            }`}
        >
            {enabled ? (
                <CheckCircle2 size={17} />
            ) : (
                <X size={17} />
            )}

            <span className="text-sm font-medium">{label}</span>
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
            <p className="text-sm text-slate-500">{text}</p>
        </div>
    );
}