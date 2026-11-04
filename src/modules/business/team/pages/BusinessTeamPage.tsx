
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
    AlertCircle, Check, ChevronDown, ChevronRight, Loader2,
    LockKeyhole, Plus, RefreshCw, Save, Search,
    ShieldCheck, UserRound, Users, X
} from "lucide-react";
import { teamApi } from "../api";
import type {
    Language, TeamData, TeamMember, PermissionData,
    PermissionFlags, PermissionAction
} from "../types";

type Props = {
    businessId: number;
    language: Language;
    onBack?: () => void;
};

const actions: PermissionAction[] = ["can_view", "can_create", "can_update", "can_delete"];
const emptyFlags = (): PermissionFlags => ({
    can_view: false, can_create: false, can_update: false, can_delete: false
});

function errorText(error: unknown): string {
    const e = error as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
    };
    return Object.values(e?.response?.data?.errors ?? {}).flat()[0]
        ?? e?.response?.data?.message
        ?? "Something went wrong.";
}

export default function BusinessTeamPage({ businessId, language, onBack }: Props) {
    const t = (en: string, bn: string) => language === "bn" ? (bn || en) : en;
    const [team, setTeam] = useState<TeamData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [addMode, setAddMode] = useState<"new" | "existing">("new");
    const [form, setForm] = useState({
        name: "", email: "", password: "",
        password_confirmation: "", role: "Staff"
    });
    const [selected, setSelected] = useState<TeamMember | null>(null);
    const [permissionData, setPermissionData] = useState<PermissionData | null>(null);
    const [permissionLoading, setPermissionLoading] = useState(false);
    const [permissionSaving, setPermissionSaving] = useState(false);
    const [expandedModules, setExpandedModules] = useState<number[]>([]);
    const [expandedMenus, setExpandedMenus] = useState<number[]>([]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setTeam(await teamApi.list(businessId));
        } catch (e) {
            setError(errorText(e));
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    useEffect(() => { void load(); }, [load]);

    const resetForm = () => setForm({
        name: "", email: "", password: "",
        password_confirmation: "", role: "Staff"
    });

    const addUser = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        if (addMode === "new" && form.password !== form.password_confirmation) {
            setError(t("Passwords do not match.", "পাসওয়ার্ড মিলছে না।"));
            return;
        }
        setSaving(true);
        try {
            if (addMode === "new") {
                await teamApi.createUser(businessId, form);
            } else {
                await teamApi.add(businessId, {
                    email: form.email.trim(),
                    role: form.role
                });
            }
            await load();
            setShowAdd(false);
            resetForm();
            setSuccess(t("User added successfully.", "ইউজার সফলভাবে যোগ করা হয়েছে।"));
        } catch (e) {
            setError(errorText(e));
        } finally {
            setSaving(false);
        }
    };

    const updateMember = async (
        member: TeamMember, role: string, status: string
    ) => {
        setError("");
        setSuccess("");
        setSaving(true);
        try {
            await teamApi.update(businessId, member.id, { role, status });
            await load();
            setSuccess(t("Member updated.", "সদস্য আপডেট হয়েছে।"));
        } catch (e) {
            setError(errorText(e));
        } finally {
            setSaving(false);
        }
    };

    const disableMember = async (member: TeamMember) => {
        if (!window.confirm(t(
            `Disable ${member.name}'s access?`,
            `${member.name}-এর অ্যাক্সেস বন্ধ করবেন?`
        ))) return;
        setSaving(true);
        setError("");
        try {
            await teamApi.disable(businessId, member.id);
            await load();
            setSuccess(t("Access disabled.", "অ্যাক্সেস বন্ধ হয়েছে।"));
        } catch (e) {
            setError(errorText(e));
        } finally {
            setSaving(false);
        }
    };

    const openPermissions = async (member: TeamMember) => {
        setError("");
        setSelected(member);
        setPermissionData(null);
        setPermissionLoading(true);
        setExpandedModules([]);
        setExpandedMenus([]);
        try {
            const result = await teamApi.permissions(businessId, member.id);
            setPermissionData(result);
        } catch (e) {
            setError(errorText(e));
            setSelected(null);
        } finally {
            setPermissionLoading(false);
        }
    };

    const toggleModule = (id: number) => setExpandedModules(previous =>
        previous.includes(id) ? previous.filter(x => x !== id) : [...previous, id]
    );
    const toggleMenu = (id: number) => setExpandedMenus(previous =>
        previous.includes(id) ? previous.filter(x => x !== id) : [...previous, id]
    );

    const changePermission = (
        moduleId: number,
        menuId: number | null,
        childId: number | null,
        action: PermissionAction,
        checked: boolean
    ) => {
        setPermissionData(previous => {
            if (!previous) return previous;
            const apply = (flags: PermissionFlags): PermissionFlags => {
                const next = { ...flags, [action]: checked };
                if (action === "can_view" && !checked) return emptyFlags();
                if (action !== "can_view" && checked) next.can_view = true;
                return next;
            };

            const modules = previous.modules.map(original => {
                if (original.id !== moduleId) return original;
                const module = structuredClone(original);

                if (menuId === null) {
                    module.permissions = apply(module.permissions);
                    module.menus = module.menus.map(menu => ({
                        ...menu,
                        permissions: apply(menu.permissions),
                        children: menu.children.map(child => ({
                            ...child, permissions: apply(child.permissions)
                        }))
                    }));
                    return module;
                }

                module.menus = module.menus.map(menu => {
                    if (menu.id !== menuId) return menu;
                    if (childId === null) {
                        if (checked) module.permissions = apply(module.permissions);
                        return {
                            ...menu,
                            permissions: apply(menu.permissions),
                            children: menu.children.map(child => ({
                                ...child, permissions: apply(child.permissions)
                            }))
                        };
                    }
                    return {
                        ...menu,
                        permissions: checked ? apply(menu.permissions) : menu.permissions,
                        children: menu.children.map(child => {
                            if (child.id !== childId) return child;
                            if (checked) module.permissions = apply(module.permissions);
                            return { ...child, permissions: apply(child.permissions) };
                        })
                    };
                });
                return module;
            });
            return { ...previous, modules };
        });
    };

    const savePermissions = async () => {
        if (!selected || !permissionData) return;
        setPermissionSaving(true);
        setError("");
        setSuccess("");
        try {
            await teamApi.savePermissions(
                businessId, selected.id, permissionData.modules
            );
            setPermissionData(await teamApi.permissions(businessId, selected.id));
            setSuccess(t("Permissions saved.", "পারমিশন সেভ হয়েছে।"));
        } catch (e) {
            setError(errorText(e));
        } finally {
            setPermissionSaving(false);
        }
    };

    const filtered = (team?.members ?? []).filter(member =>
        [member.name, member.email, member.role]
            .some(value => value.toLowerCase().includes(search.toLowerCase()))
    );

    const counts = [
        { title: t("Total Users", "মোট ইউজার"), value: team?.members.length ?? 0 },
        { title: t("Active Users", "সক্রিয় ইউজার"), value: team?.members.filter(x => x.status === "Active").length ?? 0 },
        { title: t("Administrators", "অ্যাডমিন"), value: team?.members.filter(x => ["Owner", "Admin"].includes(x.role)).length ?? 0 }
    ];

    const permissionCells = (
        flags: PermissionFlags, moduleId: number,
        menuId: number | null, childId: number | null
    ) => (
        <div className="grid grid-cols-4 gap-1">
            {actions.map(action => (
                <label key={action} className="flex justify-center rounded-lg py-1.5 hover:bg-slate-100">
                    <input
                        type="checkbox"
                        checked={flags[action]}
                        onChange={e => changePermission(
                            moduleId, menuId, childId, action, e.target.checked
                        )}
                        aria-label={`${action} permission`}
                        className="h-4 w-4 cursor-pointer accent-blue-600"
                    />
                </label>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6">
            <div className="mx-auto max-w-7xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold text-blue-600">
                            {team?.business.name ?? t("Business", "ব্যবসা")}
                        </p>
                        <h1 className="mt-1 text-2xl font-bold">
                            {t("Users & Permissions", "ইউজার ও পারমিশন")}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {t(
                                "Create users and manage shop-specific access.",
                                "ইউজার তৈরি করুন ও শপের পারমিশন পরিচালনা করুন।"
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {onBack && (
                            <button type="button" onClick={onBack} className="rounded-xl border bg-white px-3 py-2 text-sm">
                                {t("Back", "ফিরে যান")}
                            </button>
                        )}
                        <button type="button" onClick={() => void load()} aria-label={t("Refresh", "রিফ্রেশ")}
                            className="rounded-xl border bg-white p-2.5 hover:bg-slate-50">
                            <RefreshCw size={17} />
                        </button>
                        <button
                            type="button"
                            onClick={() => { setError(""); setShowAdd(true); }}
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            <Plus size={17} />
                            {t("Add User", "ইউজার যোগ করুন")}
                        </button>
                    </div>
                </div>

                {error && (
                    <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        <AlertCircle size={17} /><span className="flex-1">{error}</span>
                        <button type="button" onClick={() => setError("")}><X size={15} /></button>
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                        <Check size={17} /><span className="flex-1">{success}</span>
                        <button type="button" onClick={() => setSuccess("")}><X size={15} /></button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {counts.map(item => (
                        <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Users size={16} />{item.title}
                            </div>
                            <p className="mt-3 text-3xl font-bold">{item.value}</p>
                        </div>
                    ))}
                </div>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
                        <h2 className="font-bold">{t("Shop Members", "শপের সদস্যরা")}</h2>
                        <div className="relative w-full sm:w-64">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder={t("Search users...", "ইউজার খুঁজুন...")}
                                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
                            <Loader2 size={18} className="animate-spin" />
                            {t("Loading users...", "ইউজার লোড হচ্ছে...")}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[680px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">{t("User", "ইউজার")}</th>
                                        <th className="px-4 py-3">{t("Role", "রোল")}</th>
                                        <th className="px-4 py-3">{t("Status", "স্ট্যাটাস")}</th>
                                        <th className="px-4 py-3 text-right">{t("Actions", "অ্যাকশন")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map(member => (
                                        <tr key={member.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="rounded-full bg-blue-50 p-2 text-blue-600">
                                                        <UserRound size={17} />
                                                    </span>
                                                    <div>
                                                        <p className="font-semibold">{member.name}</p>
                                                        <p className="text-xs text-slate-500">{member.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {member.can_manage ? (
                                                    <select
                                                        disabled={saving}
                                                        value={member.role}
                                                        onChange={e => void updateMember(
                                                            member, e.target.value, member.status
                                                        )}
                                                        className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs"
                                                    >
                                                        {team?.roles.map(role => (
                                                            <option key={role} value={role}>{role}</option>
                                                        ))}
                                                    </select>
                                                ) : member.role}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                    member.status === "Active"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-slate-100 text-slate-500"
                                                }`}>
                                                    {member.status === "Active"
                                                        ? t("Active", "সক্রিয়")
                                                        : t("Inactive", "নিষ্ক্রিয়")}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {member.can_manage && (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => void openPermissions(member)}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-2 text-xs text-blue-700 hover:bg-blue-50"
                                                        >
                                                            <ShieldCheck size={15} />
                                                            {t("Permissions", "পারমিশন")}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={saving}
                                                            onClick={() => member.status === "Active"
                                                                ? void disableMember(member)
                                                                : void updateMember(member, member.role, "Active")}
                                                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs hover:bg-slate-50"
                                                        >
                                                            {member.status === "Active"
                                                                ? t("Disable", "বন্ধ করুন")
                                                                : t("Activate", "চালু করুন")}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {!filtered.length && (
                                <p className="p-10 text-center text-sm text-slate-500">
                                    {t("No users found.", "কোনো ইউজার পাওয়া যায়নি।")}
                                </p>
                            )}
                        </div>
                    )}
                </section>
            </div>

            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">
                                {t("Add Shop User", "শপে ইউজার যোগ করুন")}
                            </h2>
                            <button type="button" onClick={() => setShowAdd(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                            <button
                                type="button"
                                onClick={() => { setAddMode("new"); setError(""); }}
                                className={`rounded-lg py-2 text-xs font-semibold ${
                                    addMode === "new" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"
                                }`}
                            >
                                {t("Create New User", "নতুন ইউজার তৈরি")}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setAddMode("existing"); setError(""); }}
                                className={`rounded-lg py-2 text-xs font-semibold ${
                                    addMode === "existing" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"
                                }`}
                            >
                                {t("Add Existing User", "আগের ইউজার যোগ")}
                            </button>
                        </div>

                        {error && (
                            <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                                {error}
                            </p>
                        )}
                        <form onSubmit={addUser} className="mt-5 space-y-3">
                            {addMode === "new" && (
                                <div>
                                    <label className="mb-1 block text-xs font-medium">
                                        {t("Full Name", "পুরো নাম")}
                                    </label>
                                    <input
                                        required
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="mb-1 block text-xs font-medium">
                                    {t("Email Address", "ইমেইল অ্যাড্রেস")}
                                </label>
                                <input
                                    required
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                            </div>
                            {addMode === "new" && (
                                <>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium">
                                            {t("Password", "পাসওয়ার্ড")}
                                        </label>
                                        <input
                                            required
                                            minLength={8}
                                            type="password"
                                            autoComplete="new-password"
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium">
                                            {t("Confirm Password", "পাসওয়ার্ড নিশ্চিত করুন")}
                                        </label>
                                        <input
                                            required
                                            type="password"
                                            autoComplete="new-password"
                                            value={form.password_confirmation}
                                            onChange={e => setForm({
                                                ...form, password_confirmation: e.target.value
                                            })}
                                            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="mb-1 block text-xs font-medium">
                                    {t("Assign Role", "রোল নির্বাচন করুন")}
                                </label>
                                <select
                                    value={form.role}
                                    onChange={e => setForm({ ...form, role: e.target.value })}
                                    className="w-full rounded-xl border px-3 py-2.5 text-sm"
                                >
                                    {team?.roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={saving || !team}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving && <Loader2 size={16} className="animate-spin" />}
                                {addMode === "new"
                                    ? t("Create User", "ইউজার তৈরি করুন")
                                    : t("Add to Shop", "শপে যোগ করুন")}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-2 sm:p-5">
                    <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b p-4">
                            <div>
                                <h2 className="flex items-center gap-2 font-bold">
                                    <LockKeyhole size={18} className="text-blue-600" />
                                    {t("Manage Permissions", "পারমিশন পরিচালনা")}
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    {selected.name} — {selected.email}
                                </p>
                            </div>
                            <button type="button" onClick={() => {
                                setSelected(null);
                                setPermissionData(null);
                            }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-4">
                            {permissionLoading ? (
                                <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
                                    <Loader2 className="animate-spin" size={20} />
                                    {t("Loading permissions...", "পারমিশন লোড হচ্ছে...")}
                                </div>
                            ) : permissionData && (
                                <div className="min-w-[480px]">
                                    <div className="mb-2 grid grid-cols-[minmax(0,1fr)_224px] items-center gap-2 border-b pb-2 text-xs font-semibold text-slate-500">
                                        <span>{t("Module / Menu", "মডিউল / মেনু")}</span>
                                        <div className="grid grid-cols-4 text-center">
                                            <span>{t("View", "দেখুন")}</span>
                                            <span>{t("Create", "তৈরি")}</span>
                                            <span>{t("Update", "আপডেট")}</span>
                                            <span>{t("Delete", "ডিলিট")}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {permissionData.modules.map(module => {
                                            const moduleExpanded = expandedModules.includes(module.id);
                                            return (
                                                <div key={module.id} className="rounded-xl border border-slate-200">
                                                    <div className="grid grid-cols-[minmax(0,1fr)_224px] items-center gap-2 bg-slate-50 px-3 py-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleModule(module.id)}
                                                            className="flex min-w-0 items-center gap-2 text-left text-xs font-bold"
                                                        >
                                                            {moduleExpanded
                                                                ? <ChevronDown size={15} />
                                                                : <ChevronRight size={15} />}
                                                            <span className="truncate">{module.name}</span>
                                                        </button>
                                                        {permissionCells(module.permissions, module.id, null, null)}
                                                    </div>

                                                    {moduleExpanded && (
                                                        <div className="p-2">
                                                            {module.menus.map(menu => {
                                                                const menuExpanded = expandedMenus.includes(menu.id);
                                                                return (
                                                                    <div key={menu.id}>
                                                                        <div className="grid grid-cols-[minmax(0,1fr)_224px] items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-50">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => toggleMenu(menu.id)}
                                                                                className="flex min-w-0 items-center gap-2 pl-2 text-left text-xs font-medium"
                                                                            >
                                                                                {menuExpanded
                                                                                    ? <ChevronDown size={14} />
                                                                                    : <ChevronRight size={14} />}
                                                                                <span className="truncate">{menu.name}</span>
                                                                            </button>
                                                                            {permissionCells(menu.permissions, module.id, menu.id, null)}
                                                                        </div>

                                                                        {menuExpanded && menu.children.map(child => (
                                                                            <div key={child.id} className="grid grid-cols-[minmax(0,1fr)_224px] items-center gap-2 rounded-lg px-2 py-2 hover:bg-blue-50/50">
                                                                                <span className="truncate pl-10 text-[11px] text-slate-500">
                                                                                    {child.name}
                                                                                </span>
                                                                                {permissionCells(child.permissions, module.id, menu.id, child.id)}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end border-t p-4">
                            <button
                                type="button"
                                disabled={!permissionData || permissionSaving}
                                onClick={() => void savePermissions()}
                                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {permissionSaving
                                    ? <Loader2 className="animate-spin" size={17} />
                                    : <Save size={17} />}
                                {t("Save Permissions", "পারমিশন সেভ করুন")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
