
import { useState, type FormEvent } from "react";
import axios from "axios";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShoppingBag,
    ShieldCheck,
    Truck,
    Headphones,
    Smartphone,
} from "lucide-react";

import type { Language, Page } from "../../types";
import { translate } from "../../locales/translations";
import LanguageSwitcher from "../LanguageSwitcher";
import api, { TOKEN_KEY, USER_KEY } from "../../api/axios";

interface Props {
    navigate: (page: Page) => void;
    language: Language;
    onLanguageChange: (language: Language) => void;
    shopName?: string;
    shopLogo?: string | null;
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

export default function CustomerLoginForm({
    navigate,
    language,
    onLanguageChange,
    shopName = "Your Store",
    shopLogo = null,
}: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
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
                    "Customer login failed. Please check your credentials."
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

    const handleSocialLogin = (provider: string) => {
        setError(
            `${provider} login is not configured yet. Please sign in with your email and password.`
        );
    };

    const handleForgotPassword = () => {
        setError(
            "Password reset is not available yet. Please contact the store support team."
        );
    };

    const inputClass =
        "h-10 w-full rounded-xl border border-[#DCE2F0] bg-[#FBFCFF] pl-11 pr-10 text-sm text-[#172B60] outline-none transition-all duration-200 placeholder:text-[#8992A8] hover:border-[#B7C8F2] focus:border-[#3265E9] focus:bg-white focus:ring-4 focus:ring-blue-500/10";

    return (
        <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-[#F3F5FC] p-0 sm:p-2 lg:p-3">

            <div className="mx-auto flex h-full w-full max-w-[1400px] overflow-hidden rounded-none shadow-[0_15px_50px_rgba(35,61,130,0.10)] sm:rounded-2xl lg:rounded-[24px]">

                {/* LEFT PROMOTIONAL PANEL */}

                <aside className="relative hidden h-full w-[53%] shrink-0 flex-col overflow-hidden bg-gradient-to-br from-[#EAF0FF] via-[#E5EBFF] to-[#F2F4FF] lg:flex">

                    {/* Background Decorations */}

                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -right-20 -top-36 h-[400px] w-[400px] rounded-full bg-[#C7D4FF]/60" />

                        <div className="absolute -right-20 top-12 h-[320px] w-[320px] rounded-full border-[50px] border-white/35" />

                        <div className="absolute -bottom-36 -left-24 h-[350px] w-[350px] rounded-full bg-white/50 blur-3xl" />

                        <div className="absolute bottom-0 left-0 h-40 w-full bg-gradient-to-t from-white/40 to-transparent" />
                    </div>

                    {/* Brand */}

                    <div className="relative z-20 flex shrink-0 items-center gap-3 px-7 pt-5 xl:px-9 xl:pt-6">

                        {shopLogo ? (
                            <img
                                src={shopLogo}
                                alt={shopName}
                                className="h-11 w-11 rounded-xl bg-white object-contain p-1.5 shadow-md"
                            />
                        ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#3976F6] to-[#2251DF] text-white shadow-lg shadow-blue-500/25">
                                <ShoppingBag size={24} strokeWidth={1.8} />
                            </div>
                        )}

                        <div>
                            <h1 className="text-xl font-extrabold leading-tight tracking-tight text-[#10275F] xl:text-2xl">
                                {shopName}
                            </h1>

                            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#63759E]">
                                Online Shop
                            </p>
                        </div>
                    </div>

                    {/* Main Content */}

                    <div className="relative z-10 mt-7 px-7 xl:mt-9 xl:px-9">

                        <p className="mb-2 text-base font-medium tracking-tight text-[#2860E8] xl:text-lg">
                            {text("Welcome Back!")}
                        </p>

                        <h2 className="max-w-[460px] text-[36px] font-extrabold leading-[1.12] tracking-[-1.2px] text-[#10275F] xl:text-[44px]">
                            {text("Sign in to your")}
                            <span className="block">
                                {text("account")}
                            </span>
                        </h2>

                        <p className="mt-3 max-w-[370px] text-[13px] leading-6 text-[#465A84] xl:text-sm">
                            {text("Discover amazing products, track your orders, and enjoy a seamless shopping experience.")}
                        </p>

                        {/* Features */}

                        <div className="mt-5 flex max-w-[340px] items-start gap-5 xl:gap-8">

                            <div className="flex w-[82px] flex-col items-center text-center">
                                <div className="mb-1.5 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#2455CF] shadow-[0_8px_25px_rgba(40,78,160,0.08)]">
                                    <Truck size={23} />
                                </div>
                                <p className="text-[11px] font-semibold leading-4 text-[#142B61]">
                                    {text("Fast Delivery")}
                                </p>
                            </div>

                            <div className="flex w-[82px] flex-col items-center text-center">
                                <div className="mb-1.5 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#2455CF] shadow-[0_8px_25px_rgba(40,78,160,0.08)]">
                                    <ShieldCheck size={24} />
                                </div>
                                <p className="text-[11px] font-semibold leading-4 text-[#142B61]">
                                    {text("Secure Shopping")}
                                </p>
                            </div>

                            <div className="flex w-[82px] flex-col items-center text-center">
                                <div className="mb-1.5 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#2455CF] shadow-[0_8px_25px_rgba(40,78,160,0.08)]">
                                    <Headphones size={24} />
                                </div>
                                <p className="text-[11px] font-semibold leading-4 text-[#142B61]">
                                    {text("24/7 Support")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Female Model */}

                    <div className="pointer-events-none absolute bottom-[115px] right-[-10px] z-[5] flex h-[53%] w-[47%] items-end justify-center xl:bottom-[125px] xl:h-[59%]">

                        <img
                            src="/images/customer-shopping-woman.png"
                            alt="Customer enjoying a shopping experience"
                            className="h-full w-full object-contain object-bottom drop-shadow-[0_15px_20px_rgba(30,55,110,0.12)]"
                        />
                    </div>

                    {/* Create Account Banner */}

                    <div className="absolute bottom-[43px] left-5 right-5 z-20 xl:left-7 xl:right-7">

                        <div className="relative flex min-h-[85px] items-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#11285F] via-[#1B3475] to-[#263F85] px-4 py-2.5 shadow-[0_12px_30px_rgba(19,40,94,0.20)] xl:min-h-[95px] xl:px-5">

                            <div className="absolute -right-10 -top-20 h-40 w-40 rounded-full border-[22px] border-white/[0.05]" />

                            {/* Gift Illustration */}

                            <div className="relative z-10 hidden h-[65px] w-[85px] shrink-0 items-center justify-center sm:flex">
                                <div className="relative flex h-[48px] w-[58px] items-center justify-center rounded-lg border-2 border-white/50 bg-gradient-to-b from-white to-[#D9E5FF] shadow-xl">
                                    <div className="absolute -top-2.5 h-4 w-[66px] rounded-md border-2 border-white/70 bg-[#3D79F2]" />
                                    <div className="absolute left-1/2 top-0 h-[48px] w-2.5 -translate-x-1/2 bg-[#2D63DF]" />
                                    <div className="absolute -top-5 left-1/2 flex -translate-x-1/2">
                                        <div className="h-5 w-5 -rotate-45 rounded-full border-[4px] border-[#75A1FF]" />
                                        <div className="-ml-2 h-5 w-5 rotate-45 rounded-full border-[4px] border-[#75A1FF]" />
                                    </div>
                                </div>
                            </div>

                            {/* Text */}

                            <div className="relative z-10 min-w-0 flex-1">
                                <h3 className="text-sm font-extrabold text-white xl:text-base">
                                    {text("New Here?")}
                                </h3>

                                <p className="mt-0.5 max-w-[190px] text-[10px] leading-4 text-blue-100 xl:text-xs">
                                    {text("Create an account and unlock exclusive offers!")}
                                </p>
                            </div>

                            {/* Button */}

                            <button
                                type="button"
                                onClick={() => navigate("register")}
                                className="relative z-10 ml-2 flex shrink-0 items-center gap-1 rounded-full bg-white px-3.5 py-2.5 text-[10px] font-bold text-[#142B65] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-50 xl:px-4 xl:text-xs"
                            >
                                {text("Create Account")}
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Footer */}

                    <div className="absolute bottom-2 left-7 right-7 z-20 flex items-center justify-between text-[9px] text-[#687795] xl:left-9 xl:right-9">

                        <p>
                            © {new Date().getFullYear()} {shopName}.{" "}
                            {text("All rights reserved.")}
                        </p>

                        <div className="flex items-center gap-3 text-[#10275F]">

                            <a href="#" aria-label="Facebook" onClick={(e) => e.preventDefault()}>
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.093 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.975h-1.513c-1.49 0-1.953.93-1.953 1.885v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.093 24 18.1 24 12.073Z" />
                                </svg>
                            </a>

                            <a href="#" aria-label="Instagram" onClick={(e) => e.preventDefault()}>
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="5" />
                                    <circle cx="12" cy="12" r="4" />
                                    <circle cx="18" cy="6" r="1" fill="currentColor" />
                                </svg>
                            </a>

                            <a href="#" aria-label="Twitter" onClick={(e) => e.preventDefault()}>
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                                    <path d="M22 5.92a8.2 8.2 0 0 1-2.36.65 4.12 4.12 0 0 0 1.8-2.27 8.22 8.22 0 0 1-2.6.99 4.1 4.1 0 0 0-7 3.74A11.64 11.64 0 0 1 3.39 4.76a4.1 4.1 0 0 0 1.27 5.48 4.08 4.08 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.29 4.02 4.1 4.1 0 0 1-1.85.07 4.11 4.11 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 18.42a11.6 11.6 0 0 0 6.29 1.84c7.55 0 11.68-6.25 11.68-11.68l-.01-.53A8.35 8.35 0 0 0 22 5.92Z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </aside>

                {/* RIGHT LOGIN PANEL */}

                <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-white">

                    {/* Header */}

                    <header className="flex h-[54px] shrink-0 items-center justify-between px-4 sm:px-6 lg:justify-end lg:px-7">

                        <div className="flex items-center gap-2 lg:hidden">
                            {shopLogo ? (
                                <img
                                    src={shopLogo}
                                    alt={shopName}
                                    className="h-8 w-8 rounded-lg object-contain"
                                />
                            ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2058E8] text-white">
                                    <ShoppingBag size={17} />
                                </div>
                            )}

                            <span className="text-sm font-bold text-[#142B61]">
                                {shopName}
                            </span>
                        </div>

                        <LanguageSwitcher
                            language={language}
                            onChange={onLanguageChange}
                        />
                    </header>

                    {/* Login Content */}

                    <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-1 sm:px-7 lg:px-8">

                        <div className="w-full max-w-[390px]">

                            {/* Login Heading */}

                            <div className="mb-3 text-center">

                                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#D7E4FF] to-[#EFF3FF] text-[#163C9B] shadow-[0_6px_20px_rgba(45,93,190,0.08)]">
                                    <ShoppingBag size={29} strokeWidth={1.7} />
                                </div>

                                <h2 className="text-2xl font-extrabold tracking-tight text-[#10275F] sm:text-[28px]">
                                    {text("Customer Login")}
                                </h2>

                                <p className="mt-1 text-xs text-[#64708C]">
                                    {text("Enter your details to continue")}
                                </p>
                            </div>

                            {/* Login Form */}

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-2.5"
                            >

                                {/* Email */}

                                <div className="relative">
                                    <Mail
                                        size={18}
                                        strokeWidth={1.8}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#515B72]"
                                    />

                                    <input
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        placeholder={text("Email address")}
                                        className={inputClass}
                                    />
                                </div>

                                {/* Password */}

                                <div className="relative">
                                    <LockKeyhole
                                        size={18}
                                        strokeWidth={1.8}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#515B72]"
                                    />

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder={text("Password")}
                                        className={inputClass}
                                    />

                                    <button
                                        type="button"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        onClick={() => setShowPassword((current) => !current)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#515B72] transition hover:text-[#2058E8]"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>

                                {/* Remember Me */}

                                <div className="flex items-center justify-between gap-3 py-0.5">

                                    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[#172B60]">
                                        <input
                                            type="checkbox"
                                            checked={remember}
                                            onChange={(event) => setRemember(event.target.checked)}
                                            className="h-4 w-4 rounded border-[#9BAACB] accent-[#2058E8]"
                                        />
                                        {text("Remember me")}
                                    </label>

                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        className="text-xs font-semibold text-[#1559EF] transition hover:text-[#103EB2]"
                                    >
                                        {text("Forgot password?")}
                                    </button>
                                </div>

                                {/* Error */}

                                {error && (
                                    <div
                                        role="alert"
                                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
                                    >
                                        {text(error)}
                                    </div>
                                )}

                                {/* Sign In Button */}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group flex h-11 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#102963] to-[#142E72] text-sm font-bold text-white shadow-[0_6px_16px_rgba(20,46,114,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {text(loading ? "Logging in..." : "Sign In")}

                                    <ArrowRight
                                        size={18}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                </button>
                            </form>

                            {/* Divider */}

                            <div className="my-3 flex items-center gap-3">
                                <div className="h-px flex-1 bg-[#DCE1EC]" />

                                <span className="whitespace-nowrap text-xs font-medium text-[#64708C]">
                                    {text("or continue with")}
                                </span>

                                <div className="h-px flex-1 bg-[#DCE1EC]" />
                            </div>

                            {/* Social Login */}

                            <div className="flex items-center justify-center gap-3">

                                {/* Google */}

                                <button
                                    type="button"
                                    onClick={() => handleSocialLogin("Google")}
                                    aria-label="Continue with Google"
                                    className="flex h-10 w-[58px] items-center justify-center rounded-xl border border-[#E8ECF5] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                                >
                                    <svg viewBox="0 0 48 48" className="h-6 w-6">
                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
                                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.64 5.93c4.46-4.12 7.13-10.2 7.13-17.58Z" />
                                        <path fill="#FBBC05" d="M10.54 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.55 2.56 10.78l7.98-6.19Z" />
                                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.87l-7.64-5.93c-2.12 1.43-4.84 2.28-8.26 2.28-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
                                    </svg>
                                </button>

                                {/* Facebook */}

                                <button
                                    type="button"
                                    onClick={() => handleSocialLogin("Facebook")}
                                    aria-label="Continue with Facebook"
                                    className="flex h-10 w-[58px] items-center justify-center rounded-xl border border-[#E8ECF5] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                                >
                                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#1877F2">
                                        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.093 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.975h-1.513c-1.49 0-1.953.93-1.953 1.885v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.093 24 18.1 24 12.073Z" />
                                    </svg>
                                </button>

                                {/* Apple */}

                                <button
                                    type="button"
                                    onClick={() => handleSocialLogin("Apple")}
                                    aria-label="Continue with Apple"
                                    className="flex h-10 w-[58px] items-center justify-center rounded-xl border border-[#E8ECF5] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                                >
                                    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="currentColor">
                                        <path d="M16.365 1.43c0 1.14-.416 2.2-1.14 3.05-.774.91-2.033 1.61-3.15 1.52-.14-1.09.42-2.26 1.14-3.05.79-.87 2.16-1.52 3.15-1.52ZM20.53 17.3c-.57 1.3-.84 1.88-1.57 3.03-1.02 1.6-2.46 3.6-4.25 3.62-1.59.02-2-.98-4.16-.97-2.16.01-2.61.99-4.2.97-1.79-.02-3.15-1.82-4.17-3.42-2.85-4.46-3.15-9.7-1.39-12.48 1.25-1.97 3.23-3.12 5.1-3.12 1.9 0 3.1 1.01 4.67 1.01 1.52 0 2.45-1.01 4.65-1.01 1.67 0 3.44.91 4.69 2.48-4.12 2.26-3.45 8.14.63 9.89Z" />
                                    </svg>
                                </button>

                                {/* Mobile */}

                                <button
                                    type="button"
                                    onClick={() => handleSocialLogin("Mobile")}
                                    aria-label="Continue with Mobile"
                                    className="flex h-10 w-[58px] items-center justify-center rounded-xl border border-[#E8ECF5] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                                >
                                    <Smartphone size={22} strokeWidth={2.2} className="text-[#152B5D]" />
                                </button>
                            </div>

                            {/* Register Link */}

                            <p className="mt-3 text-center text-xs text-[#172B60] sm:text-sm">
                                {text("Don't have an account?")}{" "}

                                <button
                                    type="button"
                                    onClick={() => navigate("register")}
                                    className="font-bold text-[#1559EF] transition hover:text-[#103EB2]"
                                >
                                    {text("Create account")}
                                </button>
                            </p>

                            {/* Security */}

                            <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-[#8290A8]">
                                <ShieldCheck size={13} className="text-emerald-500" />
                                {text("Your account information is protected.")}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Footer */}

                    <footer className="flex h-7 shrink-0 items-center justify-center px-3 text-center text-[9px] text-[#8994AA] lg:hidden">
                        © {new Date().getFullYear()} {shopName}.{" "}
                        {text("All rights reserved.")}
                    </footer>
                </main>
            </div>
        </div>
    );
}
