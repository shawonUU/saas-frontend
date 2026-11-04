
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft, ChevronDown, ChevronRight,
    LogOut, Search, Store, X
} from "lucide-react";
import {
    getIcon,
    type DashboardModule,
    type DashboardMenu,
    type DashboardChildMenu,
    type Language
} from "./businessDashboard.shared";
import {
    businessPath,
    validBusinessSlug
} from "../modules/business/businessRoutes";

export type SidebarSelection = {
    moduleSlug: string;
    menuId: number | null;
    childMenuId: number | null;
};

type Props = {
    businessId?: number | string;
    businessSlug?: string;
    businessName: string;
    categoryName: string;
    modules: DashboardModule[];
    language?: Language;
    open: boolean;
    onClose: () => void;
    selected?: SidebarSelection;
    onSelectionChange?: (value: SidebarSelection) => void;
    onBack: () => void;
    onLogout?: () => void;
    labels?: Record<string, string>;
    activeModuleSlug?: string;
    activeMenuId?: number | null;
    activeChildMenuId?: number | null;
    expandedModuleSlugs?: string[];
    expandedMenuIds?: number[];
    onToggleModule?: (slug: string) => void;
    onToggleMenu?: (id: number) => void;
    onSelectModule?: (module: DashboardModule) => void;
    onSelectMenu?: (module: DashboardModule, menu: DashboardMenu) => void;
    onSelectChild?: (
        module: DashboardModule,
        menu: DashboardMenu,
        child: DashboardChildMenu
    ) => void;
};

const clean = (path: string) => path.replace(/\/+$/, "") || "/";

export default function BusinessSidebar(p: Props) {
    const navigate = useNavigate();
    const location = useLocation();
    const t = (en: string, bn: string) => p.language === "bn" ? (bn || en) : en;

    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [openedModules, setOpenedModules] = useState<string[]>([]);
    const [openedMenus, setOpenedMenus] = useState<number[]>([]);
    const [localSelection, setLocalSelection] = useState<SidebarSelection>({
        moduleSlug: "dashboard",
        menuId: null,
        childMenuId: null
    });

    const businessSlug = useMemo(() => {
        const match = location.pathname.match(/^\/b\/([^/]+)(?:\/|$)/);
        const slug =
            match?.[1] ||
            p.businessSlug ||
            localStorage.getItem("selected_business_slug") ||
            "";

        return validBusinessSlug(slug) ? slug : null;
    }, [location.pathname, p.businessSlug]);

    const makeRoute = (
        moduleSlug: string,
        menuSlug?: string,
        childSlug?: string
    ): string | null => {
        if (!businessSlug) return null;
        try {
            return businessPath(businessSlug, moduleSlug, menuSlug, childSlug);
        } catch {
            return null;
        }
    };

    const currentPath = clean(location.pathname);

    const modules = useMemo(
        () => p.modules.filter(module => module.permissions?.can_view),
        [p.modules]
    );

    const routeSelection = useMemo((): SidebarSelection | null => {
        if (!businessSlug) return null;

        for (const module of modules) {
            for (const menu of module.menus ?? []) {
                for (const child of menu.children ?? []) {
                    if (
                        makeRoute(module.slug, menu.slug, child.slug) === currentPath
                    ) {
                        return {
                            moduleSlug: module.slug,
                            menuId: menu.id,
                            childMenuId: child.id
                        };
                    }
                }

                if (makeRoute(module.slug, menu.slug) === currentPath) {
                    return {
                        moduleSlug: module.slug,
                        menuId: menu.id,
                        childMenuId: null
                    };
                }
            }

            if (makeRoute(module.slug) === currentPath) {
                return {
                    moduleSlug: module.slug,
                    menuId: null,
                    childMenuId: null
                };
            }
        }

        return null;
    }, [businessSlug, currentPath, modules]);

    const selected = routeSelection ?? p.selected ?? {
        moduleSlug: p.activeModuleSlug ?? localSelection.moduleSlug,
        menuId: p.activeMenuId ?? localSelection.menuId,
        childMenuId: p.activeChildMenuId ?? localSelection.childMenuId
    };

    useEffect(() => {
        if (selected.moduleSlug) {
            setOpenedModules(previous =>
                previous.includes(selected.moduleSlug)
                    ? previous
                    : [...previous, selected.moduleSlug]
            );
        }

        if (selected.menuId !== null) {
            const id = selected.menuId;
            setOpenedMenus(previous =>
                previous.includes(id) ? previous : [...previous, id]
            );
        }
    }, [selected.moduleSlug, selected.menuId]);

    const toggleModule = (slug: string) => {
        setOpenedModules(previous =>
            previous.includes(slug)
                ? previous.filter(item => item !== slug)
                : [...previous, slug]
        );
    };

    const toggleMenu = (id: number) => {
        setOpenedMenus(previous =>
            previous.includes(id)
                ? previous.filter(item => item !== id)
                : [...previous, id]
        );
    };

    const updateSelection = (next: SidebarSelection) => {
        setLocalSelection(next);
        p.onSelectionChange?.(next);
    };

    const openPage = (path: string | null, next: SidebarSelection) => {
        if (!path) {
            setError(t(
                "Business slug or menu slug is invalid.",
                "Business অথবা Menu slug সঠিক নয়।"
            ));
            return;
        }

        setError("");
        updateSelection(next);
        p.onClose();

        if (currentPath !== clean(path)) navigate(path);
    };

    const selectModule = (module: DashboardModule) => {
        const next: SidebarSelection = {
            moduleSlug: module.slug,
            menuId: null,
            childMenuId: null
        };

        if (module.menus.length) {
            updateSelection(next);
            toggleModule(module.slug);
        } else {
            openPage(makeRoute(module.slug), next);
        }
    };

    const selectMenu = (module: DashboardModule, menu: DashboardMenu) => {
        const next: SidebarSelection = {
            moduleSlug: module.slug,
            menuId: menu.id,
            childMenuId: null
        };

        if (menu.children.length) {
            updateSelection(next);
            toggleMenu(menu.id);
        } else {
            openPage(makeRoute(module.slug, menu.slug), next);
        }
    };

    const selectChild = (
        module: DashboardModule,
        menu: DashboardMenu,
        child: DashboardChildMenu
    ) => {
        openPage(
            makeRoute(module.slug, menu.slug, child.slug),
            {
                moduleSlug: module.slug,
                menuId: menu.id,
                childMenuId: child.id
            }
        );
    };

    const keyword = search.trim().toLowerCase();
    const matches = (value?: string | null) =>
        (value ?? "").toLowerCase().includes(keyword);

    const filtered = modules.filter(module =>
        !keyword ||
        matches(module.name) ||
        module.menus.some(menu =>
            matches(menu.name) ||
            menu.children.some(child => matches(child.name))
        )
    );

    return (
        <>
            {p.open && (
                <button
                    type="button"
                    onClick={p.onClose}
                    aria-label={t("Close sidebar", "সাইডবার বন্ধ করুন")}
                    className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
                />
            )}

            <aside
                aria-label={t("Business navigation", "ব্যবসার নেভিগেশন")}
                className={`fixed inset-y-0 left-0 z-50 flex w-[276px] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 lg:translate-x-0 lg:shadow-none ${
                    p.open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-100 px-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                            <Store size={20} />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                                {p.businessName}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                                {p.categoryName}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={p.onClose}
                        aria-label={t("Close sidebar", "সাইডবার বন্ধ করুন")}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-3 py-4">
                    <div className="relative">
                        <Search
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="search"
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                            placeholder={t(
                                "Search modules or menus...",
                                "মডিউল অথবা মেনু খুঁজুন..."
                            )}
                            aria-label={t("Search navigation", "নেভিগেশন খুঁজুন")}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                {error && (
                    <p
                        role="alert"
                        className="mx-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700"
                    >
                        {error}
                    </p>
                )}

                <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {t("Navigation", "নেভিগেশন")}
                    </p>

                    {filtered.map(module => {
                        const ModuleIcon = getIcon(module.icon);
                        const moduleActive = selected.moduleSlug === module.slug;
                        const moduleExpanded = !!keyword ||
                            openedModules.includes(module.slug);

                        const menus = module.menus.filter(menu =>
                            !keyword ||
                            matches(module.name) ||
                            matches(menu.name) ||
                            menu.children.some(child => matches(child.name))
                        );

                        return (
                            <div key={module.id}>
                                <div className={`flex items-center rounded-xl ${
                                    moduleActive
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-slate-600 hover:bg-slate-50"
                                }`}>
                                    <button
                                        type="button"
                                        onClick={() => selectModule(module)}
                                        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left"
                                    >
                                        <ModuleIcon size={17} className="shrink-0" />
                                        <span className="truncate text-[13px] font-semibold">
                                            {module.name}
                                        </span>
                                    </button>
                                    {module.menus.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => toggleModule(module.slug)}
                                            aria-expanded={moduleExpanded}
                                            aria-label={t(
                                                "Toggle module",
                                                "মডিউল খুলুন বা বন্ধ করুন"
                                            )}
                                            className="mr-1 rounded-lg p-2 hover:bg-black/5"
                                        >
                                            {moduleExpanded
                                                ? <ChevronDown size={15} />
                                                : <ChevronRight size={15} />}
                                        </button>
                                    )}
                                </div>

                                {moduleExpanded && menus.length > 0 && (
                                    <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-3">
                                        {menus.map(menu => {
                                            const MenuIcon = getIcon(menu.icon);
                                            const menuActive = moduleActive &&
                                                selected.menuId === menu.id;
                                            const menuExpanded = !!keyword ||
                                                openedMenus.includes(menu.id);

                                            const children = menu.children.filter(child =>
                                                !keyword ||
                                                matches(module.name) ||
                                                matches(menu.name) ||
                                                matches(child.name)
                                            );

                                            return (
                                                <div key={menu.id}>
                                                    <div className={`flex items-center rounded-lg ${
                                                        menuActive
                                                            ? "bg-blue-50 text-blue-700"
                                                            : "text-slate-600 hover:bg-slate-50"
                                                    }`}>
                                                        <button
                                                            type="button"
                                                            onClick={() => selectMenu(module, menu)}
                                                            className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 text-left"
                                                        >
                                                            <MenuIcon size={15} className="shrink-0" />
                                                            <span className="truncate text-[12px] font-medium">
                                                                {menu.name}
                                                            </span>
                                                        </button>
                                                        {menu.children.length > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleMenu(menu.id)}
                                                                aria-expanded={menuExpanded}
                                                                aria-label={t(
                                                                    "Toggle menu",
                                                                    "মেনু খুলুন বা বন্ধ করুন"
                                                                )}
                                                                className="mr-1 rounded-lg p-1.5 hover:bg-black/5"
                                                            >
                                                                {menuExpanded
                                                                    ? <ChevronDown size={14} />
                                                                    : <ChevronRight size={14} />}
                                                            </button>
                                                        )}
                                                    </div>

                                                    {menuExpanded && children.length > 0 && (
                                                        <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-200 pl-2">
                                                            {children.map(child => {
                                                                const ChildIcon = getIcon(child.icon);
                                                                const childActive = menuActive &&
                                                                    selected.childMenuId === child.id;

                                                                return (
                                                                    <button
                                                                        key={child.id}
                                                                        type="button"
                                                                        onClick={() => selectChild(module, menu, child)}
                                                                        aria-current={childActive ? "page" : undefined}
                                                                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[11px] font-normal leading-4 transition ${
                                                                            childActive
                                                                                ? "bg-blue-600 text-white"
                                                                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                                        }`}
                                                                    >
                                                                        <ChildIcon
                                                                            size={13}
                                                                            className="shrink-0"
                                                                        />
                                                                        <span className="truncate text-[12px] font-medium">
                                                                            {child.name}
                                                                        </span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {filtered.length === 0 && (
                        <p className="px-3 py-5 text-xs text-slate-500">
                            {keyword
                                ? t("No matching menus found.", "কোনো মেনু পাওয়া যায়নি।")
                                : t("No modules available.", "কোনো মডিউল নেই।")}
                        </p>
                    )}
                </nav>

                <div className="shrink-0 border-t border-slate-100 p-3">
                    <button
                        type="button"
                        onClick={p.onBack}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                        <ArrowLeft size={17} />
                        {t("Back to Businesses", "ব্যবসার তালিকায় ফিরুন")}
                    </button>
                    {p.onLogout && (
                        <button
                            type="button"
                            onClick={p.onLogout}
                            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                            <LogOut size={17} />
                            {t("Logout", "লগআউট")}
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}
