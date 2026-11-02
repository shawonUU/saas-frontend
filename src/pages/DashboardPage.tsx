import { TOKEN_KEY, USER_KEY } from "../api/axios";
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type FormEvent,
} from "react";

import {
    Activity,
    AlertCircle,
    ArrowRight,
    Building2,
    CheckCircle2,
    ChevronDown,
    CircleUserRound,
    Globe2,
    LayoutDashboard,
    LogOut,
    Mail,
    MapPin,
    Menu,
    Phone,
    Plus,
    RefreshCw,
    Settings,
    Store,
    Users,
    X,
    Boxes,
} from "lucide-react";

import api from "../api/axios";

type Language = "en" | "bn";
type Page = "home" | "login" | "register" | "dashboard" | "business-dashboard";

type DashboardUser = {
    id?: number;
    name?: string;
    email?: string;
};

type BusinessCategory = {
    id: number;
    name: string;
    name_bn?: string;
    slug: string;
    is_active: boolean;
};

type Branch = {
    id: number;
    business_id?: number;
    name: string;
    code: string;
    phone?: string | null;
    address?: string | null;
    is_default?: boolean;
    status?: string;
};

type Business = {
    id: number;
    owner_id?: number;
    category_id: number;
    category?: BusinessCategory;
    name: string;
    slug?: string;
    country?: string;
    currency?: string;
    timezone?: string;
    phone?: string | null;
    email?: string | null;
    status?: string;
    branches_count?: number;
    branches?: Branch[];
};

type DashboardPageProps = {
    navigate: (page: Page) => void;
    language: Language;
    onLanguageChange: (language: Language) => void;
};

type BusinessForm = {
    admin_password: string;
    slug: string;
    name: string;
    category_id: string;
    country: string;
    phone: string;
    email: string;
};

const API_ERROR_DEFAULT = "Something went wrong. Please try again.";

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

const initialBusinessForm: BusinessForm = {
    admin_password: "",
    slug: "",
    name: "",
    category_id: "",
    country: "Bangladesh",
    phone: "",
    email: "",
};

const getResponseData = (response: any): any =>
    response?.data?.data ?? response?.data ?? [];

const getErrorMessage = (
    error: any,
    fallback = API_ERROR_DEFAULT,
): string => {
    const responseData = error?.response?.data;

    if (responseData?.errors) {
        const firstError = Object.values(responseData.errors).flat()[0];
        if (typeof firstError === "string") return firstError;
    }

    return responseData?.message ?? error?.message ?? fallback;
};

const getBusinessList = (responseData: any): Business[] => {
    let data = responseData;

    if (data && !Array.isArray(data)) {
        if (Array.isArray(data.businesses)) data = data.businesses;
        else if (Array.isArray(data.data)) data = data.data;
        else data = [];
    }

    if (!Array.isArray(data)) return [];

    return data.filter(
        (item: any) =>
            item &&
            typeof item.id !== "undefined" &&
            typeof item.name === "string",
    );
};

const getCategoryList = (responseData: any): BusinessCategory[] => {
    let data = responseData;

    if (data && !Array.isArray(data)) {
        if (Array.isArray(data.categories)) data = data.categories;
        else if (Array.isArray(data.data)) data = data.data;
        else data = [];
    }

    if (!Array.isArray(data)) return [];

    return data.filter(
        (category: any) =>
            category &&
            typeof category.id !== "undefined" &&
            typeof category.name === "string" &&
            (category.is_active === true || category.is_active === 1),
    );
};

export default function DashboardPage({
    navigate,
    language,
    onLanguageChange,
}: DashboardPageProps) {
    const isBangla = language === "bn";
    const t = useCallback(
        (english: string, bangla: string) => (isBangla ? bangla : english),
        [isBangla],
    );

    const [user, setUser] = useState<DashboardUser | null>(null);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [categories, setCategories] = useState<BusinessCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [creatingBusiness, setCreatingBusiness] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
    const [businessForm, setBusinessForm] = useState<BusinessForm>(initialBusinessForm);
    const [domainStatus, setDomainStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
    useEffect(() => {
        const slug = businessForm.slug;
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length < 3 || slug.length > 50) {
            return;
        }
        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setDomainStatus("checking");
            try {
                const res = await api.get("/shop-domains/check", { params: { slug }, signal: controller.signal });
                setDomainStatus(res.data.available ? "available" : "taken");
            } catch { if (!controller.signal.aborted) setDomainStatus("idle"); }
        }, 400);
        return () => { window.clearTimeout(timer); controller.abort(); };
    }, [businessForm.slug]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user") ?? sessionStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                setUser(null);
            }
        }

        const storedBusinessId = Number(localStorage.getItem("selected_business_id"));
        if (Number.isFinite(storedBusinessId) && storedBusinessId > 0) {
            setSelectedBusinessId(storedBusinessId);
        }
    }, []);

    const loadCategories = useCallback(async () => {
        setLoadingCategories(true);
        try {
            const response = await api.get("/business-categories");
            const categoryList = getCategoryList(getResponseData(response));
            setCategories(categoryList);
            setBusinessForm((current) => ({
                ...current,
                category_id: categoryList.some(
                    (category) => String(category.id) === current.category_id,
                )
                    ? current.category_id
                    : "",
            }));
        } catch (requestError: any) {
            setCategories([]);
            setError(
                getErrorMessage(
                    requestError,
                    t("Could not load business categories.", "ব্যবসার ক্যাটাগরি লোড করা যায়নি।"),
                ),
            );
        } finally {
            setLoadingCategories(false);
        }
    }, [t]);

    const loadBusinesses = useCallback(
        async (showSpinner = true) => {
            if (showSpinner) setLoading(true);
            else setRefreshing(true);

            setError("");

            try {
                const response = await api.get("/businesses");
                const list = getBusinessList(getResponseData(response));

                const withBranchCounts = await Promise.all(
                    list.map(async (business) => {
                        if (typeof business.branches_count === "number") return business;
                        if (Array.isArray(business.branches)) {
                            return { ...business, branches_count: business.branches.length };
                        }

                        try {
                            const branchResponse = await api.get(
                                `/businesses/${business.id}/branches`,
                            );
                            const branchData = getResponseData(branchResponse);
                            let branches: Branch[] = [];

                            if (Array.isArray(branchData)) branches = branchData;
                            else if (Array.isArray(branchData?.branches)) branches = branchData.branches;
                            else if (Array.isArray(branchData?.data)) branches = branchData.data;

                            return {
                                ...business,
                                branches_count: branches.length,
                                branches,
                            };
                        } catch {
                            return { ...business, branches_count: 0 };
                        }
                    }),
                );

                setBusinesses(withBranchCounts);
                setSelectedBusinessId((currentId) => {
                    if (currentId && withBranchCounts.some((item) => item.id === currentId)) {
                        return currentId;
                    }
                    return withBranchCounts[0]?.id ?? null;
                });

                // if (withBranchCounts.length === 0) setShowCreateModal(true);
            } catch (requestError: any) {
                setError(
                    getErrorMessage(
                        requestError,
                        t("Could not load your businesses.", "আপনার ব্যবসাগুলো লোড করা যায়নি।"),
                    ),
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [t],
    );

    useEffect(() => {
        void loadBusinesses();
        void loadCategories();
    }, [loadBusinesses, loadCategories]);

    const totalBranches = useMemo(
        () => businesses.reduce((total, business) => total + (business.branches_count ?? 0), 0),
        [businesses],
    );

    const activeBusinesses = useMemo(
        () =>
            businesses.filter(
                (business) => (business.status ?? "Active").toLowerCase() === "active",
            ).length,
        [businesses],
    );

    const selectedBusiness = useMemo(
        () => businesses.find((business) => business.id === selectedBusinessId) ?? null,
        [businesses, selectedBusinessId],
    );

    const updateBusinessForm = (field: keyof BusinessForm, value: string) => {
        setBusinessForm((current) => ({ ...current, [field]: value }));
    };

    const resetBusinessForm = () => setBusinessForm(initialBusinessForm);

    const closeCreateModal = () => {
        if (businesses.length === 0 || creatingBusiness) return;
        setShowCreateModal(false);
        setError("");
        resetBusinessForm();
    };

    const handleCreateBusiness = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (domainStatus !== "available") {
            setError(t("Choose an available shop domain.", "একটি খালি শপ ডোমেইন নির্বাচন করুন।"));
            return;
        }
        if (!businessForm.name.trim()) {
            setError(t("Please enter your business name.", "আপনার ব্যবসার নাম লিখুন।"));
            return;
        }

        if (
            !businessForm.category_id ||
            !categories.some((category) => String(category.id) === businessForm.category_id)
        ) {
            setError(t("Please select a valid business category.", "সঠিক ব্যবসার ক্যাটাগরি নির্বাচন করুন।"));
            return;
        }

        setCreatingBusiness(true);

        try {
            await api.post("/businesses", {
                name: businessForm.name.trim(),
                admin_password: businessForm.admin_password,
                slug: businessForm.slug,
                category_id: Number(businessForm.category_id),
                country: businessForm.country.trim() || "Bangladesh",
                currency: "BDT",
                timezone: "Asia/Dhaka",
                phone: businessForm.phone.trim() || null,
                email: businessForm.email.trim() || null,
            });

            setShowCreateModal(false);
            resetBusinessForm();
            setSuccess(
                t(
                    "Business and main branch created successfully.",
                    "ব্যবসা ও প্রধান ব্রাঞ্চ সফলভাবে তৈরি হয়েছে।",
                ),
            );
            await loadBusinesses(false);
        } catch (requestError: any) {
            setError(
                getErrorMessage(
                    requestError,
                    t("Could not create the business.", "ব্যবসা তৈরি করা যায়নি।"),
                ),
            );
        } finally {
            setCreatingBusiness(false);
        }
    };


    const openBusinessDashboard = (business: Business) => {
        if ((business.status ?? "Active").toLowerCase() !== "active") {
            setError(t("This business is inactive.", "এই ব্যবসাটি নিষ্ক্রিয়।"));
            return;
        }

        const businessId = Number(business.id);
        const businessSlug = business.slug?.trim();

        if (!Number.isSafeInteger(businessId) || businessId <= 0) {
            setError(t("Invalid business ID.", "ব্যবসার আইডি সঠিক নয়।"));
            return;
        }

        if (!businessSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(businessSlug)) {
            setError(t(
                "This business does not have a valid slug.",
                "এই ব্যবসার সঠিক Slug পাওয়া যায়নি।"
            ));
            return;
        }

        localStorage.setItem("selected_business_id", String(businessId));
        localStorage.setItem("selected_business_slug", businessSlug);

        setSelectedBusinessId(businessId);
        setError("");

        window.history.replaceState(
            { ...window.history.state },
            "",
            window.location.pathname
        );

        window.location.assign(`${window.location.protocol}//admin.${businessSlug}.${import.meta.env.VITE_SAAS_DOMAIN || "localtest.me"}:${window.location.port || "5173"}`);
    };


    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await api.post("/auth/logout");
        } catch {
            // Local credentials are cleared even if the server request fails.
        } finally {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem("selected_business_id");
            sessionStorage.removeItem(TOKEN_KEY);
            sessionStorage.removeItem(USER_KEY);
            setLoggingOut(false);
            navigate("login");
        }
    };

    const displayName =
        user?.name?.trim() || user?.email?.split("@")[0] || t("User", "ইউজার");
    const initials = displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <div className="flex min-h-screen">
                {sidebarOpen && (
                    <button
                        type="button"
                        aria-label={t("Close sidebar", "সাইডবার বন্ধ করুন")}
                        className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <aside
                    className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
                        sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
                        <button
                            type="button"
                            className="flex items-center gap-3"
                            onClick={() => navigate("home")}
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white">
                                <Boxes size={22} />
                            </span>
                            <span className="text-left">
                                <span className="block text-lg font-bold tracking-tight text-slate-900">
                                    NexaBiz
                                </span>
                                <span className="block text-xs text-slate-500">
                                    {t("Business Management", "বিজনেস ম্যানেজমেন্ট")}
                                </span>
                            </span>
                        </button>
                        <button
                            type="button"
                            aria-label={t("Close sidebar", "সাইডবার বন্ধ করুন")}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X size={19} />
                        </button>
                    </div>

                    <div className="flex-1 px-4 py-6">
                        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {t("Workspace", "ওয়ার্কস্পেস")}
                        </p>
                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl bg-blue-50 px-3 py-3 text-sm font-semibold text-blue-700"
                        >
                            <LayoutDashboard size={19} />
                            {t("Dashboard", "ড্যাশবোর্ড")}
                        </button>

                        <div className="mt-8">
                            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                {t("Business", "ব্যবসা")}
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setError("");
                                    setSuccess("");
                                    setShowCreateModal(true);
                                    setSidebarOpen(false);
                                }}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                            >
                                <Building2 size={19} />
                                {t("My Businesses", "আমার ব্যবসা")}
                                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                                    {businesses.length}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setError("");
                                    setSuccess("");
                                    setShowCreateModal(true);
                                    setSidebarOpen(false);
                                }}
                                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                            >
                                <Plus size={19} />
                                {t("Create Business", "ব্যবসা তৈরি করুন")}
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 p-4">
                        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                                {initials || "U"}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-800">{displayName}</p>
                                <p className="truncate text-xs text-slate-500">{user?.email || ""}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            disabled={loggingOut}
                            onClick={handleLogout}
                            className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                        >
                            <LogOut size={18} />
                            {loggingOut ? t("Signing out...", "লগআউট হচ্ছে...") : t("Logout", "লগআউট")}
                        </button>
                    </div>
                </aside>

                <main className="min-w-0 flex-1">
                    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-10">
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                type="button"
                                aria-label={t("Open sidebar", "সাইডবার খুলুন")}
                                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu size={21} />
                            </button>
                            <div className="min-w-0">
                                <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                                    {t("Dashboard", "ড্যাশবোর্ড")}
                                </h1>
                                <p className="hidden text-xs text-slate-500 sm:block">
                                    {t("Manage your businesses in one place", "এক জায়গা থেকে আপনার ব্যবসাগুলো পরিচালনা করুন")}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-1">
                                <button
                                    type="button"
                                    onClick={() => onLanguageChange("en")}
                                    className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${
                                        language === "en" ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-100"
                                    }`}
                                >
                                    EN
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onLanguageChange("bn")}
                                    className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${
                                        language === "bn" ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-100"
                                    }`}
                                >
                                    বাংলা
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    void loadBusinesses(false);
                                    void loadCategories();
                                }}
                                disabled={refreshing || loadingCategories}
                                title={t("Refresh", "রিফ্রেশ")}
                                className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                                <RefreshCw
                                    size={18}
                                    className={refreshing || loadingCategories ? "animate-spin" : ""}
                                />
                            </button>
                            <div className="hidden h-9 w-px bg-slate-200 sm:block" />
                            <div className="hidden items-center gap-2 sm:flex">
                                <CircleUserRound size={20} className="text-slate-400" />
                                <span className="max-w-36 truncate text-sm font-medium text-slate-700">
                                    {displayName}
                                </span>
                            </div>
                        </div>
                    </header>

                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
                        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <p className="mb-1 text-sm font-medium text-blue-700">{t("Welcome back", "স্বাগতম")}</p>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                    {t(`Hello, ${displayName}`, `হ্যালো, ${displayName}`)}
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                    {t(
                                        "Here is an overview of your business workspace.",
                                        "আপনার বিজনেস ওয়ার্কস্পেসের সারসংক্ষেপ এখানে দেখুন।",
                                    )}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setError("");
                                    setSuccess("");
                                    setShowCreateModal(true);
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100"
                            >
                                <Plus size={18} />
                                {t("Create Business", "ব্যবসা তৈরি করুন")}
                            </button>
                        </div>

                        {error && (
                            <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                                <span className="min-w-0 flex-1">{error}</span>
                                <button type="button" aria-label={t("Dismiss error", "এরর বন্ধ করুন")} onClick={() => setError("")} className="rounded p-0.5 hover:bg-red-100">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {success && (
                            <div role="status" className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                <CheckCircle2 size={19} className="shrink-0" />
                                <span className="min-w-0 flex-1">{success}</span>
                                <button type="button" aria-label={t("Dismiss message", "বার্তা বন্ধ করুন")} onClick={() => setSuccess("")} className="rounded p-0.5 hover:bg-emerald-100">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            <SummaryCard
                                icon={<Building2 size={21} />}
                                title={t("Total Businesses", "মোট ব্যবসা")}
                                value={loading ? "—" : businesses.length}
                                description={t("Businesses available to you", "আপনার ব্যবসার সংখ্যা")}
                                iconClass="bg-blue-50 text-blue-700"
                            />
                            <SummaryCard
                                icon={<Store size={21} />}
                                title={t("Total Branches", "মোট ব্রাঞ্চ")}
                                value={loading ? "—" : totalBranches}
                                description={t("Branches across your businesses", "আপনার ব্যবসাগুলোর সব ব্রাঞ্চ")}
                                iconClass="bg-violet-50 text-violet-700"
                            />
                            <SummaryCard
                                icon={<Activity size={21} />}
                                title={t("Active Businesses", "সক্রিয় ব্যবসা")}
                                value={loading ? "—" : activeBusinesses}
                                description={t("Businesses with active status", "সক্রিয় অবস্থায় থাকা ব্যবসা")}
                                iconClass="bg-emerald-50 text-emerald-700"
                            />
                        </div>

                        <section className="mb-8">
                            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{t("My Businesses", "আমার ব্যবসাগুলো")}</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {t("Businesses associated with your account.", "আপনার অ্যাকাউন্টের সঙ্গে যুক্ত ব্যবসাগুলো।")}
                                    </p>
                                </div>
                                {!loading && businesses.length > 0 && (
                                    <span className="text-sm text-slate-500">
                                        {businesses.length} {t(businesses.length === 1 ? "business" : "businesses", "টি ব্যবসা")}
                                    </span>
                                )}
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
                                            <div className="mb-5 h-11 w-11 rounded-xl bg-slate-100" />
                                            <div className="mb-3 h-4 w-2/3 rounded bg-slate-100" />
                                            <div className="mb-6 h-3 w-1/2 rounded bg-slate-100" />
                                            <div className="h-20 rounded-xl bg-slate-50" />
                                        </div>
                                    ))}
                                </div>
                            ) : businesses.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center sm:px-10">
                                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                                        <Building2 size={30} />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900">
                                        {t("Create your first business", "আপনার প্রথম ব্যবসা তৈরি করুন")}
                                    </h4>
                                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                        {t(
                                            "You do not have any businesses yet. Create a business to start setting up your workspace and main branch.",
                                            "এখনো আপনার কোনো ব্যবসা নেই। ওয়ার্কস্পেস এবং প্রধান ব্রাঞ্চ সেটআপ করতে একটি ব্যবসা তৈরি করুন।",
                                        )}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setError("");
                                            setShowCreateModal(true);
                                        }}
                                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
                                    >
                                        <Plus size={18} />
                                        {t("Create your first business", "প্রথম ব্যবসা তৈরি করুন")}
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {businesses.map((business) => {
                                        const isSelected = selectedBusinessId === business.id;
                                        const isActive = (business.status ?? "Active").toLowerCase() === "active";

                                        return (
                                            <div
                                                key={business.id}
                                                className={`rounded-2xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md ${
                                                    isSelected ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"
                                                }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedBusinessId(business.id)}
                                                    className="w-full text-left"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                                            <Building2 size={23} />
                                                        </span>
                                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                                            {business.status ?? "Active"}
                                                        </span>
                                                    </div>
                                                    <h4 className="mt-5 truncate text-base font-bold text-slate-900">{business.name}</h4>
                                                    <p className="mt-1 truncate text-xs text-slate-500">{business.slug || `ID: ${business.id}`}</p>
                                                    {(business.category?.name || categories.find((category) => category.id === business.category_id)?.name) && (
                                                        <p className="mt-2 truncate text-xs font-medium text-blue-700">
                                                            {business.category?.name ?? categories.find((category) => category.id === business.category_id)?.name}
                                                        </p>
                                                    )}
                                                </button>

                                                <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Store size={16} className="shrink-0 text-slate-400" />
                                                        <span>
                                                            {business.branches_count ?? 0} {t((business.branches_count ?? 0) === 1 ? "branch" : "branches", "টি ব্রাঞ্চ")}
                                                        </span>
                                                    </div>
                                                    {business.country && (
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <Globe2 size={16} className="shrink-0 text-slate-400" />
                                                            <span className="truncate">{business.country}</span>
                                                        </div>
                                                    )}
                                                    {business.phone && (
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <Phone size={16} className="shrink-0 text-slate-400" />
                                                            <span className="truncate">{business.phone}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                                                    <span className="text-xs font-medium text-slate-500">
                                                        {t("Business ID", "ব্যবসার ID")}: {business.id}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => openBusinessDashboard(business)}
                                                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
                                                    >
                                                        {t("Open Dashboard", "ড্যাশবোর্ড খুলুন")}
                                                        <ArrowRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {selectedBusiness && !loading && (
                            <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                            <Store size={22} />
                                        </span>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{selectedBusiness.name}</h3>
                                            <p className="mt-0.5 text-xs text-slate-500">{t("Selected business", "নির্বাচিত ব্যবসা")}</p>
                                        </div>
                                    </div>
                                    <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                                        <CheckCircle2 size={15} className="text-emerald-600" />
                                        {t("Business overview", "ব্যবসার সারসংক্ষেপ")}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
                                    <DetailItem icon={<Building2 size={17} />} label={t("Business name", "ব্যবসার নাম")} value={selectedBusiness.name} />
                                    <DetailItem
                                        icon={<Store size={17} />}
                                        label={t("Category", "ক্যাটাগরি")}
                                        value={
                                            selectedBusiness.category?.name ??
                                            categories.find((category) => category.id === selectedBusiness.category_id)?.name ??
                                            t("Not provided", "দেওয়া হয়নি")
                                        }
                                    />
                                    <DetailItem icon={<Store size={17} />} label={t("Branches", "ব্রাঞ্চ")} value={String(selectedBusiness.branches_count ?? 0)} />
                                    <DetailItem icon={<Globe2 size={17} />} label={t("Country", "দেশ")} value={selectedBusiness.country || "Bangladesh"} />
                                    <DetailItem icon={<MapPin size={17} />} label={t("Timezone", "টাইমজোন")} value={selectedBusiness.timezone || "Asia/Dhaka"} />
                                    <DetailItem icon={<Settings size={17} />} label={t("Currency", "মুদ্রা")} value={selectedBusiness.currency || "BDT"} />
                                    <DetailItem icon={<Mail size={17} />} label={t("Email", "ইমেইল")} value={selectedBusiness.email || t("Not provided", "দেওয়া হয়নি")} />
                                    <DetailItem icon={<Phone size={17} />} label={t("Phone", "ফোন")} value={selectedBusiness.phone || t("Not provided", "দেওয়া হয়নি")} />
                                </div>

                                <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                    <p className="text-xs leading-5 text-slate-500">
                                        {t("Business ID", "ব্যবসার ID")}: {selectedBusiness.id}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => openBusinessDashboard(selectedBusiness)}
                                        className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 sm:self-auto"
                                    >
                                        <LayoutDashboard size={16} />
                                        {t("Open Business Dashboard", "বিজনেস ড্যাশবোর্ড খুলুন")}
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </section>
                        )}

                        <section className="rounded-2xl bg-gradient-to-r from-blue-800 to-blue-700 p-6 text-white sm:p-8">
                            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                                <div className="max-w-2xl">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                                        <Users size={21} />
                                    </div>
                                    <h3 className="text-xl font-bold">{t("Your business workspace", "আপনার বিজনেস ওয়ার্কস্পেস")}</h3>
                                    <p className="mt-2 text-sm leading-6 text-blue-100">
                                        {t(
                                            "Manage your businesses here. Open an individual business dashboard to access its modules and settings.",
                                            "এখান থেকে আপনার ব্যবসাগুলো পরিচালনা করুন। নির্দিষ্ট ব্যবসার মডিউল ও সেটিংসে যেতে তার ড্যাশবোর্ড খুলুন।",
                                        )}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setError("");
                                        setSuccess("");
                                        setShowCreateModal(true);
                                    }}
                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
                                >
                                    {t("Add another business", "আরেকটি ব্যবসা যোগ করুন")}
                                    <ArrowRight size={17} />
                                </button>
                            </div>
                        </section>

                        <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row">
                            <p>© {new Date().getFullYear()} NexaBiz. {t("All rights reserved.", "সর্বস্বত্ব সংরক্ষিত।")}</p>
                            <p>{t("Business Management Platform", "বিজনেস ম্যানেজমেন্ট প্ল্যাটফর্ম")}</p>
                        </footer>
                    </div>
                </main>
            </div>

            {showCreateModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            businesses.length > 0 &&
                            !creatingBusiness
                        ) {
                            closeCreateModal();
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-business-title"
                        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                    >
                        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
                            <div className="flex items-start gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <Building2 size={23} />
                                </span>
                                <div>
                                    <h3 id="create-business-title" className="text-lg font-bold text-slate-900">
                                        {t("Create a Business", "নতুন ব্যবসা তৈরি করুন")}
                                    </h3>
                                    <p className="mt-1 text-sm leading-5 text-slate-500">
                                        {t("Enter your business details to get started.", "শুরু করতে আপনার ব্যবসার তথ্য দিন।")}
                                    </p>
                                </div>
                            </div>
                            {businesses.length > 0 && (
                                <button
                                    type="button"
                                    disabled={creatingBusiness}
                                    aria-label={t("Close modal", "মডাল বন্ধ করুন")}
                                    onClick={closeCreateModal}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                                >
                                    <X size={19} />
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleCreateBusiness}>
                            <div className="max-h-[65vh] space-y-6 overflow-y-auto px-5 py-6 sm:px-7">
                                <div>
                                    <h4 className="mb-4 text-sm font-bold text-slate-800">
                                        {t("Business Information", "ব্যবসার তথ্য")}
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <FormField label={t("Business Name", "ব্যবসার নাম")} required>
                                            <input
                                                autoFocus
                                                type="text"
                                                value={businessForm.name}
                                                onChange={(event) => updateBusinessForm("name", event.target.value)}
                                                placeholder={t("e.g. My General Store", "যেমন: আমার জেনারেল স্টোর")}
                                                required
                                                maxLength={255}
                                                className={inputClass}
                                            />
                                        </FormField>

                                        <div className="sm:col-span-2">
                                            <FormField label={t("Choose Shop Domain", "শপ ডোমেইন নির্বাচন করুন")} required>
                                                <div className="flex items-center rounded-xl border border-slate-200 bg-white focus-within:border-blue-500">
                                                    <input type="text" value={businessForm.slug} maxLength={50} required minLength={3}
                                                        pattern="[a-z0-9]+(-[a-z0-9]+)*" className="min-w-0 flex-1 px-3.5 py-3 text-sm outline-none"
                                                        placeholder="shawonstore" onChange={e => { updateBusinessForm("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); setDomainStatus("idle"); }} />
                                                    <span className="pr-3 text-xs text-slate-500">.localtest.me</span>
                                                </div>
                                            </FormField>
                                            <p aria-live="polite" className={`mt-1.5 text-xs ${domainStatus === "available" ? "text-emerald-700" : domainStatus === "taken" ? "text-red-600" : "text-slate-500"}`}>
                                                {domainStatus === "available" ? t("Domain available", "ডোমেইন খালি আছে") : domainStatus === "taken" ? t("Domain unavailable", "ডোমেইনটি পাওয়া যাচ্ছে না") : domainStatus === "checking" ? t("Checking domain...", "ডোমেইন যাচাই হচ্ছে...") : t("Choose a unique shop address", "একটি ইউনিক শপ ঠিকানা নির্বাচন করুন")}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">{businessForm.slug || "yourshop"}.localtest.me · admin.{businessForm.slug || "yourshop"}.localtest.me</p>
                                        </div>

                                        <FormField label={t("Shop Admin Password", "শপ অ্যাডমিন পাসওয়ার্ড")} required>
                                            <input type="password" autoComplete="new-password" minLength={8}
                                                value={businessForm.admin_password}
                                                onChange={(event) => updateBusinessForm("admin_password", event.target.value)}
                                                placeholder={t("Separate from your SaaS password", "SaaS পাসওয়ার্ড থেকে আলাদা")}
                                                className={inputClass} required />
                                        </FormField>

                                        <FormField label={t("Business Category", "ব্যবসার ক্যাটাগরি")} required>
                                            <select
                                                value={businessForm.category_id}
                                                onChange={(event) => updateBusinessForm("category_id", event.target.value)}
                                                required
                                                disabled={loadingCategories || categories.length === 0}
                                                className={inputClass}
                                            >
                                                <option value="">
                                                    {loadingCategories
                                                        ? t("Loading categories...", "ক্যাটাগরি লোড হচ্ছে...")
                                                        : t("Select a category", "ক্যাটাগরি নির্বাচন করুন")}
                                                </option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={String(category.id)}>
                                                        {language === "bn" ? category.name_bn || category.name : category.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {!loadingCategories && categories.length === 0 && (
                                                <p className="mt-1.5 text-xs leading-5 text-red-600">
                                                    {t(
                                                        "No active categories found. Please add an active category first.",
                                                        "কোনো সক্রিয় ক্যাটাগরি পাওয়া যায়নি। প্রথমে একটি সক্রিয় ক্যাটাগরি যোগ করুন।",
                                                    )}
                                                </p>
                                            )}
                                        </FormField>

                                        <FormField label={t("Country", "দেশ")} required>
                                            <input
                                                type="text"
                                                value={businessForm.country}
                                                onChange={(event) => updateBusinessForm("country", event.target.value)}
                                                required
                                                maxLength={100}
                                                className={inputClass}
                                            />
                                        </FormField>

                                        <FormField label={t("Currency", "মুদ্রা")} required>
                                            <select value="BDT" disabled className={inputClass}>
                                                <option value="BDT">BDT - Bangladeshi Taka</option>
                                            </select>
                                        </FormField>

                                        <FormField label={t("Timezone", "টাইমজোন")} required>
                                            <select value="Asia/Dhaka" disabled className={inputClass}>
                                                <option value="Asia/Dhaka">Asia/Dhaka</option>
                                            </select>
                                        </FormField>

                                        <FormField label={t("Phone Number", "ফোন নম্বর")}>
                                            <input
                                                type="tel"
                                                value={businessForm.phone}
                                                onChange={(event) => updateBusinessForm("phone", event.target.value)}
                                                maxLength={30}
                                                className={inputClass}
                                            />
                                        </FormField>

                                        <div className="sm:col-span-2">
                                            <FormField label={t("Business Email", "ব্যবসার ইমেইল")}>
                                                <input
                                                    type="email"
                                                    value={businessForm.email}
                                                    onChange={(event) => updateBusinessForm("email", event.target.value)}
                                                    maxLength={255}
                                                    className={inputClass}
                                                />
                                            </FormField>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                                    <div className="flex items-start gap-3">
                                        <span className="mt-0.5 text-blue-700"><CheckCircle2 size={19} /></span>
                                        <div>
                                            <h5 className="text-sm font-semibold text-slate-800">{t("Main Branch", "প্রধান ব্রাঞ্চ")}</h5>
                                            <p className="mt-1 text-xs leading-5 text-slate-600">
                                                {t(
                                                    "The backend will automatically create a default main branch with the code MAIN after the business is created.",
                                                    "ব্যবসা তৈরি হলে backend স্বয়ংক্রিয়ভাবে MAIN কোডসহ একটি default প্রধান ব্রাঞ্চ তৈরি করবে।",
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                                {businesses.length > 0 && (
                                    <button
                                        type="button"
                                        disabled={creatingBusiness}
                                        onClick={closeCreateModal}
                                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        {t("Cancel", "বাতিল")}
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={creatingBusiness || loadingCategories || categories.length === 0}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {creatingBusiness ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            {t("Creating...", "তৈরি হচ্ছে...")}
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={17} />
                                            {t("Create Business", "ব্যবসা তৈরি করুন")}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function FormField({
    label,
    required = false,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="min-w-0">
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </label>
            {children}
        </div>
    );
}

function SummaryCard({
    icon,
    title,
    value,
    description,
    iconClass,
}: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    description: string;
    iconClass: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>
                    {icon}
                </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{description}</p>
        </div>
    );
}

function DetailItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 text-slate-400">{icon}</span>
            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p>
            </div>
        </div>
    );
}

