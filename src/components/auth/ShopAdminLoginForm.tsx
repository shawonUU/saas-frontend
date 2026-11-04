
import { useState, type FormEvent } from "react";
import axios from "axios";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Store,
} from "lucide-react";

import type { Language, Page } from "../../types";
import { translate } from "../../locales/translations";
import Brand from "../Brand";
import Button from "../Button";
import LanguageSwitcher from "../LanguageSwitcher";
import api, { TOKEN_KEY, USER_KEY } from "../../api/axios";

interface Props {
    navigate: (page: Page) => void;
    language: Language;
    onLanguageChange: (language: Language) => void;
}

interface AuthResponse {
    message?: string;
    token?: string;
    user?: {
        id: number;
        name: string;
        email: string;
        [key: string]: unknown;
    };
    errors?: Record<string, string[]>;
}

export default function ShopAdminLoginForm({
    navigate,
    language,
    onLanguageChange,
}: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const text = (value: string) => translate(value, language);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (loading) return;

        setLoading(true);

        try {
            const response = await api.post<AuthResponse>("auth/login", {
                email: email.trim(),
                password,
            });

            const data = response.data;

            if (!data.token) {
                throw new Error("Login response did not include an API token.");
            }

            // Do not create a shop-admin session for a customer or a SaaS-only account.
            // This protected endpoint must check tenant membership and admin privileges server-side.
            try {
                await api.get("/shop-admin/dashboard", {
                    headers: { Authorization: `Bearer ${data.token}` },
                });
            } catch {
                throw new Error(language === "bn"
                    ? "এই শপের অ্যাডমিন অনুমতি নেই অথবা অ্যাকাউন্টটি সঠিক নয়।"
                    : "This account does not have access to this shop's admin dashboard.");
            }

            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            sessionStorage.removeItem(TOKEN_KEY);
            sessionStorage.removeItem(USER_KEY);

            const storage = remember ? localStorage : sessionStorage;

            storage.setItem(TOKEN_KEY, data.token);

            if (data.user) {
                storage.setItem(USER_KEY, JSON.stringify(data.user));
            }

            navigate("dashboard");
        } catch (requestError: unknown) {
            if (axios.isAxiosError<AuthResponse>(requestError)) {
                const responseData = requestError.response?.data;

                const validationMessage = responseData?.errors
                    ? Object.values(responseData.errors).flat().join(" ")
                    : "";

                setError(
                    validationMessage ||
                    responseData?.message ||
                    "Shop admin login failed. Please check your credentials."
                );
            } else {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : "Something went wrong. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

    return (
        <div className="flex min-h-screen bg-slate-50">
            <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 p-10 text-white lg:flex xl:p-14">
                <div className="relative">
                    <Brand onClick={() => navigate("home")} />

                    <div className="mt-24 max-w-lg">
                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                            <Store size={29} />
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight xl:text-5xl">
                            {text("Your shop, your control.")}
                        </h1>

                        <p className="mt-6 text-base leading-8 text-blue-100">
                            {text("Manage products, orders, inventory, customers and your daily shop operations from one place.")}
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
                    <div className="flex items-start gap-3">
                        <ShieldCheck size={22} className="mt-0.5 shrink-0 text-blue-200" />
                        <div>
                            <p className="font-semibold">{text("Shop administration")}</p>
                            <p className="mt-1 text-sm leading-6 text-blue-100">
                                {text("A dedicated workspace for your shop team.")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex min-h-screen flex-1 flex-col">
                <div className="flex items-center justify-between px-5 py-5 sm:px-10">
                    <div className="lg:hidden">
                        <Brand onClick={() => navigate("home")} />
                    </div>

                    <div className="ml-auto">
                        <LanguageSwitcher language={language} onChange={onLanguageChange} />
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-10">
                    <div className="w-full max-w-md">
                        <div className="mb-8">
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Store size={24} />
                            </div>

                            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
                                {text("Shop Admin Login")}
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                {text("Sign in to manage your shop and business operations.")}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="admin-email" className="mb-2 block text-sm font-semibold text-slate-700">
                                    {text("Email address")}
                                </label>

                                <div className="relative">
                                    <Mail size={18} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="admin-email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        placeholder="admin@yourshop.com"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="admin-password" className="mb-2 block text-sm font-semibold text-slate-700">
                                    {text("Password")}
                                </label>

                                <div className="relative">
                                    <LockKeyhole size={18} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />

                                    <input
                                        id="admin-password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder={text("Enter your password")}
                                        className={inputClass}
                                    />

                                    <button
                                        type="button"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(event) => setRemember(event.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                                />
                                {text("Remember me")}
                            </label>

                            {error && (
                                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {text(error)}
                                </div>
                            )}

                            <Button type="submit" disabled={loading} className="w-full !py-3.5">
                                {text(loading ? "Logging in..." : "Log In to Shop Admin")}
                                <ArrowRight size={17} />
                            </Button>
                        </form>
                        <p className="mt-5 text-center text-sm text-slate-500">{language === "bn" ? "আমন্ত্রণ পেয়েছেন?" : "Have an invitation?"} <button type="button" onClick={() => navigate("register")} className="font-semibold text-blue-700 hover:underline">{language === "bn" ? "অ্যাডমিন নিবন্ধন" : "Register as admin"}</button></p>

                        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                            <ShieldCheck size={15} />
                            {text("Secure shop administration")}
                        </div>
                    </div>
                </div>

                <div className="px-5 py-5 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} NexaBiz. {text("All rights reserved.")}
                </div>
            </div>
        </div>
    );
}
