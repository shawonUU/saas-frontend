import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {Activity, BarChart3, BookOpen, Boxes, Building2, ChefHat, ClipboardList, Globe2, LayoutDashboard, Package, Pill, Settings, ShoppingBag, ShoppingCart, Store, Truck, Users, Layers, RefreshCw, Plus, ChartNoAxesCombined} from "lucide-react";

export type Language = "en" | "bn";

export type DashboardPermission = {
    can_view: boolean;
    can_create: boolean;
    can_update: boolean;
    can_delete: boolean;
};

export type DashboardChildMenu = {
    id: number;
    app_menu_id: number;
    name: string;
    slug: string;
    icon: string | null;
    route: string | null;
    sort_order: number;
    is_active: boolean;
};

export type DashboardMenu = {
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

export type DashboardModule = {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    route: string | null;
    sort_order: number;
    permissions: DashboardPermission;
    menus: DashboardMenu[];
};

export type DashboardBranch = {
    id: number;
    name: string;
    code?: string;
    phone?: string | null;
    address?: string | null;
    status: string;
    is_default?: boolean;
};

export type BusinessDashboardData = {
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
    RefreshCw, Plus, ChartNoAxesCombined,
};

export const getIcon = (name?: string | null): IconComponent => {
    if (!name) return LayoutDashboard;

    return iconMap[name] ?? LayoutDashboard;
};

