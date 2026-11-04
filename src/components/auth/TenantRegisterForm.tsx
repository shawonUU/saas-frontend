import { useState, type FormEvent } from "react";
import axios from "axios";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, ShoppingBag, Store, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import api, { tenantSlug } from "../../api/axios";
import type { Language } from "../../types";
import LanguageSwitcher from "../LanguageSwitcher";

type Props = { kind: "customer" | "business_admin"; language: Language; onLanguageChange: (next: Language) => void };
type RegisterResponse = { message?: string; errors?: Record<string, string[]> };

export default function TenantRegisterForm({ kind, language, onLanguageChange }: Props) {
    const admin = kind === "business_admin";
    const t = (en: string, bn: string) => language === "bn" ? (bn || en) : en;
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [invitationCode, setInvitationCode] = useState("");
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (loading) return;
        setError(""); setSuccess("");
        if (password.length < 8) { setError(t("Password must be at least 8 characters.", "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।")); return; }
        if (password !== confirmation) { setError(t("Passwords do not match.", "পাসওয়ার্ড দুটি মেলেনি।")); return; }
        if (admin && !invitationCode.trim()) { setError(t("An invitation code is required.", "ইনভাইটেশন কোড প্রয়োজন।")); return; }
        setLoading(true);
        try {
            // Business-admin registration requires a dedicated server-side invitation validator.
            // The frontend does not assign roles or grant privileged access.
            const endpoint = admin ? "/auth/invitations/register" : "/auth/register";
            const { data } = await api.post<RegisterResponse>(endpoint, {
                name: name.trim(), email: email.trim(), password, password_confirmation: confirmation,
                ...(admin ? { invitation_code: invitationCode.trim(), tenant_slug: tenantSlug } : {}),
            });
            setSuccess(data.message || t("Registration successful. Sign in to continue.", "নিবন্ধন সফল হয়েছে। লগইন করে এগিয়ে যান।"));
            setPassword(""); setConfirmation(""); setInvitationCode("");
        } catch (err: unknown) {
            if (axios.isAxiosError<RegisterResponse>(err)) {
                const data = err.response?.data;
                const validation = Object.values(data?.errors ?? {}).flat().join(" ");
                setError(validation || data?.message || (err.response?.status === 404
                    ? t("Registration endpoint is not configured on the server.", "সার্ভারে নিবন্ধন API এখনো কনফিগার করা হয়নি।")
                    : t("Unable to register. Please try again.", "নিবন্ধন করা যায়নি। আবার চেষ্টা করুন।")));
            } else setError(t("Could not connect to the server.", "সার্ভারে সংযোগ করা যায়নি।"));
        } finally { setLoading(false); }
    };

    const fieldClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";
    return <div className="min-h-screen bg-slate-50 text-slate-900 lg:grid lg:grid-cols-[minmax(320px,42%)_1fr]">
        <aside className={`hidden min-h-screen flex-col justify-between p-10 text-white lg:flex xl:p-16 ${admin ? "bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800" : "bg-gradient-to-br from-blue-950 via-blue-800 to-sky-600"}`}>
            <Link to="/" className="flex items-center gap-3 text-xl font-bold"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15">{admin ? <Store /> : <ShoppingBag />}</span>{admin ? t("Shop Administration", "শপ অ্যাডমিন") : t("Your Store", "আপনার শপ")}</Link>
            <div className="max-w-lg"><span className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">{admin ? t("Invitation only", "শুধু আমন্ত্রণপ্রাপ্তদের জন্য") : t("Join our community", "আমাদের সঙ্গে যুক্ত হোন")}</span><h1 className="text-4xl font-bold leading-tight">{admin ? t("Manage your store with confidence.", "আত্মবিশ্বাসের সঙ্গে আপনার শপ পরিচালনা করুন।") : t("A better shopping experience starts here.", "আরও সুন্দর কেনাকাটার অভিজ্ঞতা শুরু হোক এখানে।")}</h1><p className="mt-5 text-base leading-7 text-white/75">{admin ? t("Ask your business owner for an invitation before creating a shop administrator account.", "শপ অ্যাডমিন অ্যাকাউন্ট তৈরির আগে ব্যবসার মালিকের কাছ থেকে আমন্ত্রণ নিন।") : t("Create your personal customer account to shop and manage your orders.", "কেনাকাটা ও অর্ডার পরিচালনার জন্য আপনার কাস্টমার অ্যাকাউন্ট তৈরি করুন।")}</p></div>
            <p className="flex items-center gap-2 text-sm text-white/70"><ShieldCheck size={18}/>{t("Secure account registration", "নিরাপদ অ্যাকাউন্ট নিবন্ধন")}</p>
        </aside>
        <main className="flex min-h-screen flex-col px-5 py-6 sm:px-10"><header className="flex items-center justify-between gap-4"><Link to="/login" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700"><ArrowLeft size={17}/>{t("Back to login", "লগইনে ফিরে যান")}</Link><LanguageSwitcher language={language} onChange={onLanguageChange}/></header>
            <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center py-10"><div className="mb-7 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">{admin ? <Store size={26}/> : <UserRound size={26}/>}</div><h1 className="text-3xl font-extrabold tracking-tight">{admin ? t("Shop admin registration", "শপ অ্যাডমিন নিবন্ধন") : t("Create customer account", "কাস্টমার অ্যাকাউন্ট তৈরি করুন")}</h1><p className="mt-3 text-sm leading-6 text-slate-500">{admin ? t("Register using an invitation from your business owner.", "ব্যবসার মালিকের পাঠানো আমন্ত্রণ দিয়ে নিবন্ধন করুন।") : t("Fill in your details to get started.", "শুরু করতে আপনার তথ্য পূরণ করুন।")}</p>
                <form onSubmit={submit} className="mt-8 space-y-4">
                    <label className="block text-sm font-semibold text-slate-700">{t("Full name", "সম্পূর্ণ নাম")}<div className="relative"><UserRound className="pointer-events-none absolute right-4 top-5 text-slate-400" size={18}/><input className={fieldClass} autoComplete="name" required maxLength={150} value={name} onChange={e=>setName(e.target.value)} placeholder={t("Enter your name", "আপনার নাম লিখুন")}/></div></label>
                    <label className="block text-sm font-semibold text-slate-700">{t("Email address", "ইমেইল ঠিকানা")}<div className="relative"><Mail className="pointer-events-none absolute right-4 top-5 text-slate-400" size={18}/><input className={fieldClass} type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></div></label>
                    {admin && <label className="block text-sm font-semibold text-slate-700">{t("Invitation code", "ইনভাইটেশন কোড")}<input className={fieldClass} autoComplete="off" required value={invitationCode} onChange={e=>setInvitationCode(e.target.value)} placeholder={t("Enter your invitation code", "আমন্ত্রণ কোড লিখুন")}/></label>}
                    <label className="block text-sm font-semibold text-slate-700">{t("Password", "পাসওয়ার্ড")}<div className="relative"><LockKeyhole className="pointer-events-none absolute left-4 top-5 text-slate-400" size={17}/><input className={`${fieldClass} pl-11 pr-12`} type={visible?"text":"password"} autoComplete="new-password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} placeholder={t("At least 8 characters", "কমপক্ষে ৮ অক্ষর")}/><button type="button" className="absolute right-3 top-4 rounded-lg p-1 text-slate-500" aria-label={visible?t("Hide password","পাসওয়ার্ড লুকান"):t("Show password","পাসওয়ার্ড দেখান")} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
                    <label className="block text-sm font-semibold text-slate-700">{t("Confirm password", "পাসওয়ার্ড নিশ্চিত করুন")}<input className={fieldClass} type={visible?"text":"password"} autoComplete="new-password" required minLength={8} value={confirmation} onChange={e=>setConfirmation(e.target.value)} placeholder={t("Repeat password", "পাসওয়ার্ড আবার লিখুন")}/></label>
                    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
                    {success && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success} <Link className="font-bold underline" to="/login">{t("Log in", "লগইন")}</Link></div>}
                    <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-4 focus-visible:outline-indigo-200 disabled:opacity-50">{loading ? t("Creating account...", "অ্যাকাউন্ট তৈরি হচ্ছে...") : t("Create account", "অ্যাকাউন্ট তৈরি করুন")}<ArrowRight size={17}/></button>
                </form><p className="mt-6 text-center text-sm text-slate-500">{t("Already have an account?", "আগে থেকেই অ্যাকাউন্ট আছে?")} <Link to="/login" className="font-bold text-indigo-700 hover:underline">{t("Log in", "লগইন")}</Link></p>
            </div>
        </main>
    </div>;
}
