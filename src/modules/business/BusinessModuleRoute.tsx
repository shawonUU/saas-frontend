
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    AlertCircle, ArrowLeft, Layers, Loader2
} from "lucide-react";
import api from "../../api/axios";
import ShopLayout from "./ShopLayout";
import BusinessTeamPage from "./team/pages/BusinessTeamPage";
import {
    businessDashboardPath,
    getSelectedBusinessId,
    validBusinessSlug
} from "./businessRoutes";
import type {
    DashboardModule,
    Language
} from "../../pages/businessDashboard.shared";

type Props = {
    language: Language;
};

type PermissionFlags = {
    can_view: boolean;
    can_create?: boolean;
    can_update?: boolean;
    can_delete?: boolean;
};

type ChildMenu = {
    id: number;
    name: string;
    slug: string;
    icon?: string | null;
    permissions?: PermissionFlags;
};

type Menu = {
    id: number;
    name: string;
    slug: string;
    icon?: string | null;
    permissions?: PermissionFlags;
    children: ChildMenu[];
};

type Module = {
    id: number;
    name: string;
    slug: string;
    icon?: string | null;
    permissions?: PermissionFlags;
    menus: Menu[];
};

type BusinessConfig = {
    business: {
        id: number;
        name: string;
        slug: string;
    };
    category: {
        id: number;
        name: string;
        slug: string;
    };
    modules: Module[];
    can_manage_team?: boolean;
};

function readError(error: unknown): string {
    const result = error as {
        response?: {
            data?: {
                message?: string;
            };
        };
        message?: string;
    };

    return result?.response?.data?.message ||
        result?.message ||
        "Unable to load business configuration.";
}

export default function BusinessModuleRoute({ language }: Props) {
    const navigate = useNavigate();

    const {
        businessSlug,
        moduleSlug,
        menuSlug,
        childSlug
    } = useParams<{
        businessSlug: string;
        moduleSlug: string;
        menuSlug?: string;
        childSlug?: string;
    }>();

    const t = (en: string, bn: string) =>
        language === "bn" ? (bn || en) : en;

    const businessId = getSelectedBusinessId();

    const [config, setConfig] = useState<BusinessConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        setError("");
        setConfig(null);

        if (
            !businessId ||
            !businessSlug ||
            !validBusinessSlug(businessSlug)
        ) {
            setError(t(
                "Please select a valid business first.",
                "আগে একটি সঠিক ব্যবসা নির্বাচন করুন।"
            ));
            setLoading(false);
            return;
        }

        const loadConfig = async () => {
            try {
                const response = await api.get(
                    `/businesses/${businessId}/dashboard-config`
                );

                if (cancelled) return;

                const data = response.data?.data ?? response.data;

                if (
                    Number(data?.business?.id) !== businessId ||
                    data?.business?.slug !== businessSlug
                ) {
                    setError(t(
                        "The selected business does not match this URL.",
                        "নির্বাচিত ব্যবসার সঙ্গে URL মিলছে না।"
                    ));
                    return;
                }

                setConfig({
                    business: data.business,
                    category: data.category,
                    modules: Array.isArray(data.modules)
                        ? data.modules
                        : [],
                    can_manage_team: Boolean(data.can_manage_team)
                });
            } catch (requestError) {
                if (!cancelled) {
                    setError(readError(requestError));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        };

        void loadConfig();

        return () => {
            cancelled = true;
        };
    }, [businessId, businessSlug, refreshKey]);

    const selected = useMemo(() => {
        const module = config?.modules.find(
            item => item.slug === moduleSlug
        );

        const menu = menuSlug
            ? module?.menus.find(item => item.slug === menuSlug)
            : undefined;

        const child = childSlug
            ? menu?.children.find(item => item.slug === childSlug)
            : undefined;

        const valid = Boolean(
            module &&
            (!menuSlug || menu) &&
            (!childSlug || (menuSlug && child))
        );

        const permitted = Boolean(
            module?.permissions?.can_view &&
            (!menuSlug || menu?.permissions?.can_view) &&
            (!childSlug || child?.permissions?.can_view)
        );

        return {
            module,
            menu,
            child,
            valid,
            permitted
        };
    }, [config, moduleSlug, menuSlug, childSlug]);

    const goDashboard = () => {
        if (businessSlug && validBusinessSlug(businessSlug)) {
            navigate(businessDashboardPath(businessSlug));
            return;
        }

        navigate("/dashboard");
    };

    const refresh = () => {
        setRefreshing(true);
        setRefreshKey(previous => previous + 1);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center gap-3 bg-slate-50 text-sm text-slate-500">
                <Loader2 size={20} className="animate-spin" />
                {t("Loading shop...", "শপ লোড হচ্ছে...")}
            </div>
        );
    }

    if (!config || error || !selected.valid || !selected.permitted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center">
                    <AlertCircle size={30} className="mx-auto text-amber-500" />

                    <h2 className="mt-3 text-lg font-bold text-slate-900">
                        {t("Page unavailable", "পেজটি পাওয়া যাচ্ছে না")}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        {error || t(
                            "The menu was not found or you do not have access.",
                            "মেনুটি পাওয়া যায়নি অথবা আপনার অনুমতি নেই।"
                        )}
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white"
                    >
                        <ArrowLeft size={16} />
                        {t("Back to Businesses", "ব্যবসার তালিকায় ফিরুন")}
                    </button>
                </div>
            </div>
        );
    }

    const title =
        selected.child?.name ||
        selected.menu?.name ||
        selected.module?.name ||
        t("Shop", "শপ");

    const breadcrumb = [
        config.business.name,
        selected.module?.name,
        selected.menu?.name,
        selected.child?.name
    ].filter(Boolean).join(" / ");

    const icon =
        selected.child?.icon ||
        selected.menu?.icon ||
        selected.module?.icon ||
        "LayoutDashboard";

    const isTeamPage =
        moduleSlug === "settings" &&
        menuSlug === "general-settings" &&
        childSlug === "users-permissions";

    const content = isTeamPage ? (
        config.can_manage_team ? (
            <BusinessTeamPage
                businessId={businessId!}
                language={language}
                onBack={goDashboard}
            />
        ) : (
            <div className="p-5 sm:p-8">
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
                >
                    {t(
                        "Only the business Owner or Admin can manage users.",
                        "শুধু ব্যবসার Owner বা Admin ইউজার পরিচালনা করতে পারবেন।"
                    )}
                </div>
            </div>
        )
    ) : (
        <div className="p-5 sm:p-8">
            <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Layers size={24} />
                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    {selected.module?.name}
                </p>

                <h1 className="mt-2 text-2xl font-bold text-slate-900">
                    {title}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    {breadcrumb}
                </p>

                <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    {t(
                        "This menu is available, but its page has not been implemented yet.",
                        "মেনুটি আছে, কিন্তু এর পেজ এখনো তৈরি করা হয়নি।"
                    )}
                </div>

                <button
                    type="button"
                    onClick={goDashboard}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-700"
                >
                    <ArrowLeft size={16} />
                    {t("Back to Dashboard", "ড্যাশবোর্ডে ফিরুন")}
                </button>
            </div>
        </div>
    );

    return (
        <ShopLayout
            businessId={config.business.id}
            businessSlug={config.business.slug}
            businessName={config.business.name}
            categoryName={config.category?.name ?? ""}
            modules={config.modules as DashboardModule[]}
            language={language}
            title={title}
            breadcrumb={breadcrumb}
            icon={icon}
            onRefresh={refresh}
            refreshing={refreshing}
        >
            {content}
        </ShopLayout>
    );
}
