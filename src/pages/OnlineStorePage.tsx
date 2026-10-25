
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
    Store,
    Plus,
    RefreshCw,
    Globe,
    Pencil,
    ExternalLink,
    Send,
    X,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import api from "../api/axios";

type OnlineStore = {
    id: number;
    business_id: number;
    name: string;
    slug: string;
    domain: string;
    description?: string | null;
    logo?: string | null;
    banner?: string | null;
    status: "draft" | "published" | "suspended" | string;
    published_at?: string | null;
    theme_settings?: Record<string, unknown> | null;
    created_at?: string;
};

type StoreForm = {
    name: string;
    slug: string;
    description: string;
};

const initialForm: StoreForm = {
    name: "",
    slug: "",
    description: "",
};

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

function getErrorMessage(error: any): string {
    const responseData = error?.response?.data;

    if (responseData?.errors) {
        const firstError = Object.values(responseData.errors).flat()[0];
        if (typeof firstError === "string") return firstError;
    }

    return responseData?.message ?? error?.message ?? "Something went wrong.";
}

function getStoreList(responseData: any): OnlineStore[] {
    const data = responseData?.data ?? responseData;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.online_stores)) return data.online_stores;

    return [];
}

function getStore(responseData: any): OnlineStore {
    return responseData?.data?.data ?? responseData?.data ?? responseData;
}

export default function OnlineStorePage() {
    const [businessId, setBusinessId] = useState<number | null>(null);
    const [stores, setStores] = useState<OnlineStore[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishingId, setPublishingId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingStore, setEditingStore] = useState<OnlineStore | null>(null);
    const [form, setForm] = useState<StoreForm>(initialForm);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const storedId = Number(localStorage.getItem("selected_business_id"));

        if (Number.isInteger(storedId) && storedId > 0) {
            setBusinessId(storedId);
        } else {
            setError("No business selected. Please select a business first.");
            setLoading(false);
        }
    }, []);

    const loadStores = useCallback(async () => {
        if (!businessId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await api.get(
                `/businesses/${businessId}/online-stores`,
            );

            setStores(getStoreList(response.data));
        } catch (requestError: any) {
            setError(getErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        if (businessId) {
            void loadStores();
        }
    }, [businessId, loadStores]);

    const openCreateForm = () => {
        setEditingStore(null);
        setForm(initialForm);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const openEditForm = (store: OnlineStore) => {
        setEditingStore(store);
        setForm({
            name: store.name,
            slug: store.slug,
            description: store.description ?? "",
        });
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const closeForm = () => {
        if (saving) return;
        setShowForm(false);
        setEditingStore(null);
        setForm(initialForm);
    };

    const updateForm = (field: keyof StoreForm, value: string) => {
        setForm((current) => {
            const updated = { ...current, [field]: value };

            if (field === "name" && !editingStore) {
                updated.slug = value
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "");
            }

            return updated;
        });
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!businessId) {
            setError("Please select a business first.");
            return;
        }

        if (!form.name.trim() || !form.slug.trim()) {
            setError("Store name and store address are required.");
            return;
        }

        setSaving(true);

        try {
            const payload = {
                name: form.name.trim(),
                slug: form.slug.trim().toLowerCase(),
                description: form.description.trim() || null,
            };

            if (editingStore) {
                await api.patch(
                    `/online-stores/${editingStore.id}`,
                    payload,
                );
                setSuccess("Online store updated successfully.");
            } else {
                await api.post(
                    `/businesses/${businessId}/online-stores`,
                    payload,
                );
                setSuccess("Online store created successfully.");
            }

            setShowForm(false);
            setEditingStore(null);
            setForm(initialForm);
            await loadStores();
        } catch (requestError: any) {
            setError(getErrorMessage(requestError));
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async (store: OnlineStore) => {
        const confirmed = window.confirm(
            `Publish "${store.name}" now?`,
        );

        if (!confirmed) return;

        setPublishingId(store.id);
        setError("");
        setSuccess("");

        try {
            await api.post(`/online-stores/${store.id}/publish`);
            setSuccess(`${store.name} published successfully.`);
            await loadStores();
        } catch (requestError: any) {
            setError(getErrorMessage(requestError));
        } finally {
            setPublishingId(null);
        }
    };

    const getStoreUrl = (store: OnlineStore) => {
        if (store.domain) {
            return `https://${store.domain}`;
        }

        return `https://${store.slug}.nexabiz.com`;
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700">
                            <Store size={18} />
                            E-commerce
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Online Stores
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            Create and manage your online storefronts from one place.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => void loadStores()}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        >
                            <RefreshCw
                                size={17}
                                className={loading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>

                        <button
                            type="button"
                            onClick={openCreateForm}
                            disabled={!businessId}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                        >
                            <Plus size={18} />
                            Create Online Store
                        </button>
                    </div>
                </div>

                {!businessId && (
                    <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        Select a business from the business dashboard before creating an online store.
                    </div>
                )}

                {error && (
                    <div
                        role="alert"
                        className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        <AlertCircle size={19} className="mt-0.5 shrink-0" />
                        <span className="flex-1">{error}</span>
                        <button
                            type="button"
                            onClick={() => setError("")}
                            aria-label="Dismiss error"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}

                {success && (
                    <div
                        role="status"
                        className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
                    >
                        <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                        <span className="flex-1">{success}</span>
                        <button
                            type="button"
                            onClick={() => setSuccess("")}
                            aria-label="Dismiss message"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <SummaryCard
                        title="Total Stores"
                        value={loading ? "—" : stores.length}
                        description="All stores in this business"
                    />
                    <SummaryCard
                        title="Published"
                        value={
                            loading
                                ? "—"
                                : stores.filter(
                                      (store) => store.status === "published",
                                  ).length
                        }
                        description="Stores marked as published"
                    />
                    <SummaryCard
                        title="Drafts"
                        value={
                            loading
                                ? "—"
                                : stores.filter(
                                      (store) => store.status === "draft",
                                  ).length
                        }
                        description="Stores waiting to be published"
                    />
                </div>

                <section>
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-slate-900">
                            Your Stores
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage your store details, domain and publication status.
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                                >
                                    <div className="mb-4 h-12 w-12 rounded-xl bg-slate-100" />
                                    <div className="mb-3 h-4 w-2/3 rounded bg-slate-100" />
                                    <div className="mb-6 h-3 w-full rounded bg-slate-100" />
                                    <div className="h-10 rounded-lg bg-slate-100" />
                                </div>
                            ))}
                        </div>
                    ) : stores.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                                <Store size={30} />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900">
                                Create your first online store
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Set up a storefront for your business and give your customers a dedicated online shopping address.
                            </p>

                            <button
                                type="button"
                                onClick={openCreateForm}
                                disabled={!businessId}
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                            >
                                <Plus size={18} />
                                Create Online Store
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {stores.map((store) => {
                                const published = store.status === "published";
                                const storeUrl = getStoreUrl(store);

                                return (
                                    <article
                                        key={store.id}
                                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
                                    >
                                        <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50 to-white p-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                                                    <Store size={23} />
                                                </div>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                                        published
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : store.status === "draft"
                                                              ? "bg-amber-100 text-amber-700"
                                                              : "bg-slate-100 text-slate-600"
                                                    }`}
                                                >
                                                    {store.status}
                                                </span>
                                            </div>

                                            <h3 className="mt-5 truncate text-lg font-bold text-slate-900">
                                                {store.name}
                                            </h3>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Store ID: {store.id}
                                            </p>
                                        </div>

                                        <div className="space-y-4 p-5">
                                            <div>
                                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    Store address
                                                </p>

                                                <a
                                                    href={storeUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-2 break-all text-sm font-medium text-blue-700 hover:text-blue-900"
                                                >
                                                    <Globe size={16} className="shrink-0" />
                                                    <span>{storeUrl}</span>
                                                    <ExternalLink
                                                        size={14}
                                                        className="shrink-0"
                                                    />
                                                </a>
                                            </div>

                                            <div>
                                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    Description
                                                </p>
                                                <p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">
                                                    {store.description || "No description added."}
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditForm(store)}
                                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                                >
                                                    <Pencil size={16} />
                                                    Edit Store
                                                </button>

                                                {!published && (
                                                    <button
                                                        type="button"
                                                        onClick={() => void handlePublish(store)}
                                                        disabled={publishingId === store.id}
                                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                                                    >
                                                        {publishingId === store.id ? (
                                                            <RefreshCw size={16} className="animate-spin" />
                                                        ) : (
                                                            <Send size={16} />
                                                        )}
                                                        Publish Store
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {showForm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeForm();
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="online-store-form-title"
                        className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                    >
                        <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
                            <div>
                                <h2
                                    id="online-store-form-title"
                                    className="text-lg font-bold text-slate-900"
                                >
                                    {editingStore ? "Edit Online Store" : "Create Online Store"}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Configure your storefront name and address.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={saving}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                                aria-label="Close form"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-5 p-5 sm:p-6">
                                <div>
                                    <label
                                        htmlFor="store-name"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Store Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="store-name"
                                        type="text"
                                        value={form.name}
                                        onChange={(event) =>
                                            updateForm("name", event.target.value)
                                        }
                                        className={inputClass}
                                        placeholder="Shawon Store"
                                        maxLength={150}
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="store-slug"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Store Address <span className="text-red-500">*</span>
                                    </label>

                                    <div className="flex min-w-0 items-stretch">
                                        <input
                                            id="store-slug"
                                            type="text"
                                            value={form.slug}
                                            onChange={(event) =>
                                                updateForm(
                                                    "slug",
                                                    event.target.value
                                                        .toLowerCase()
                                                        .replace(/[^a-z0-9-]/g, ""),
                                                )
                                            }
                                            className={`${inputClass} min-w-0 rounded-r-none`}
                                            placeholder="shawonstore"
                                            maxLength={100}
                                            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                                            required
                                        />
                                        <span className="flex shrink-0 items-center rounded-r-xl border border-l-0 border-slate-200 bg-slate-50 px-3 text-xs text-slate-500">
                                            .nexabiz.com
                                        </span>
                                    </div>

                                    <p className="mt-2 break-all text-xs text-slate-500">
                                        Preview: https://{form.slug || "your-store"}.nexabiz.com
                                    </p>

                                    {editingStore && editingStore.status === "published" && (
                                        <p className="mt-2 text-xs leading-5 text-amber-700">
                                            A published store's address cannot be changed.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="store-description"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Description
                                    </label>
                                    <textarea
                                        id="store-description"
                                        value={form.description}
                                        onChange={(event) =>
                                            updateForm("description", event.target.value)
                                        }
                                        className={`${inputClass} min-h-24 resize-y`}
                                        placeholder="Tell customers about your store."
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={saving}
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                                >
                                    {saving && <RefreshCw size={16} className="animate-spin" />}
                                    {saving
                                        ? "Saving..."
                                        : editingStore
                                          ? "Save Changes"
                                          : "Create Store"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function SummaryCard({
    title,
    value,
    description,
}: {
    title: string;
    value: string | number;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                {value}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
        </div>
    );
}
