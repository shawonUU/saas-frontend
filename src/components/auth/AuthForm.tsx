
import { useState, type FormEvent } from "react";
import axios from "axios";
import {
    ArrowRight,
    ArrowUpRight,
    Building2,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Users,
} from "lucide-react";

import type { Language, Page } from "../../types";
import { translate } from "../../locales/translations";
import Brand from "../Brand";
import Button from "../Button";
import LanguageSwitcher from "../LanguageSwitcher";
import api, { TOKEN_KEY, USER_KEY } from "../../api/axios";

interface AuthFormProps {
    mode: "login" | "register";
    navigate: (page: Page) => void;
    language: Language;
    onLanguageChange: (language: Language) => void;
    title?: string;
    description?: string;
    loginEndpoint?: string;
    redirectPage?: Page;
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

export default function AuthForm({
    mode,
    navigate,
    language,
    onLanguageChange,
}: AuthFormProps) {
    const isRegister = mode === "register";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const text = (value: string) => translate(value, language);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (loading) {
            return;
        }

        if (isRegister && password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            const payload = isRegister
                ? {
                      name: name.trim(),
                      email: email.trim(),
                      password,
                      password_confirmation: confirmPassword,
                  }
                : {
                      email: email.trim(),
                      password,
                  };

            const response = await api.post<AuthResponse>(
                `auth/${isRegister ? "register" : "login"}`,
                payload,
            );

            const data = response.data;

            if (isRegister) {
                setSuccess(
                    data.message ||
                        "Registration successful. You can now log in to your account.",
                );

                setName("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");

                return;
            }

            if (!data.token) {
                throw new Error(
                    "Login response did not include an API token.",
                );
            }

            // Clear previous authentication data for current tenant.
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);

            sessionStorage.removeItem(TOKEN_KEY);
            sessionStorage.removeItem(USER_KEY);

            // Save authentication data based on Remember me.
            const storage = remember
                ? localStorage
                : sessionStorage;

            storage.setItem(TOKEN_KEY, data.token);

            if (data.user) {
                storage.setItem(
                    USER_KEY,
                    JSON.stringify(data.user),
                );
            }

            // Open dashboard after successful login.
            navigate("dashboard");
        } catch (requestError: unknown) {
            if (axios.isAxiosError<AuthResponse>(requestError)) {
                const responseData = requestError.response?.data;

                const validationMessage = responseData?.errors
                    ? Object.values(responseData.errors)
                          .flat()
                          .join(" ")
                    : "";

                setError(
                    validationMessage ||
                        responseData?.message ||
                        (isRegister
                            ? "Registration failed. Please try again."
                            : "Login failed. Please check your credentials."),
                );
            } else {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : "Something went wrong. Please try again.",
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

    return (
        <div className="flex min-h-screen bg-white">
            <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 p-10 text-white lg:flex xl:p-14">
                <div className="absolute -right-32 top-10 h-96 w-96 rounded-full border border-white/10" />
                <div className="absolute -right-10 top-32 h-64 w-64 rounded-full border border-white/10" />
                <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

                <div className="relative">
                    <Brand onClick={() => navigate("home")} />

                    <div className="mt-20 max-w-lg xl:mt-28">
                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                            <Building2 size={29} />
                        </div>

                        <h1 className="text-4xl leading-tight font-extrabold tracking-tight xl:text-5xl">
                            {text(
                                "Everything your business needs, in one place.",
                            )}
                        </h1>

                        <p className="mt-6 max-w-md text-base leading-8 text-blue-100">
                            {text(
                                "Organize your business operations, connect your branches and keep your team working toward the same goals.",
                            )}
                        </p>
                    </div>
                </div>

                <div className="relative rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                        <ShieldCheck
                            size={22}
                            className="mt-0.5 shrink-0 text-blue-200"
                        />

                        <div>
                            <p className="font-semibold">
                                {text("Built for business management")}
                            </p>

                            <p className="mt-1 text-sm leading-6 text-blue-100">
                                {text(
                                    "One organized workspace for your daily business operations.",
                                )}
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

                    <div className="ml-auto flex items-center gap-4">
                        <LanguageSwitcher
                            language={language}
                            onChange={onLanguageChange}
                        />

                        <button
                            type="button"
                            onClick={() => navigate("home")}
                            className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
                        >
                            <span className="hidden sm:inline">
                                {text("Back to home")}
                            </span>

                            <ArrowUpRight size={17} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-10">
                    <div className="w-full max-w-md">
                        <div className="mb-8">
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                {isRegister ? (
                                    <Users size={24} />
                                ) : (
                                    <LockKeyhole size={24} />
                                )}
                            </div>

                            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
                                {text(
                                    isRegister
                                        ? "Create your account"
                                        : "Welcome back",
                                )}
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                {text(
                                    isRegister
                                        ? "Set up your account to get started with NexaBiz."
                                        : "Enter your details to access your business workspace.",
                                )}
                            </p>
                        </div>

                        <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                            <button
                                type="button"
                                onClick={() => navigate("login")}
                                className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                                    !isRegister
                                        ? "bg-white text-blue-700 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                {text("Log in")}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("register")}
                                className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                                    isRegister
                                        ? "bg-white text-blue-700 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                {text("Register")}
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            {isRegister && (
                                <div>
                                    <label
                                        htmlFor="full-name"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        {text("Full name")}
                                    </label>

                                    <div className="relative">
                                        <Users
                                            size={18}
                                            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            id="full-name"
                                            type="text"
                                            autoComplete="name"
                                            required
                                            value={name}
                                            onChange={(event) =>
                                                setName(event.target.value)
                                            }
                                            placeholder={text(
                                                "Enter your full name",
                                            )}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    {text("Email address")}
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={18}
                                        className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        placeholder="you@company.com"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-semibold text-slate-700"
                                    >
                                        {text("Password")}
                                    </label>

                                    {!isRegister && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setError("");
                                                setSuccess(
                                                    "Connect your Laravel password reset endpoint to implement password recovery.",
                                                );
                                            }}
                                            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                        >
                                            {text("Forgot password?")}
                                        </button>
                                    )}
                                </div>

                                <div className="relative">
                                    <LockKeyhole
                                        size={18}
                                        className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        autoComplete={
                                            isRegister
                                                ? "new-password"
                                                : "current-password"
                                        }
                                        required
                                        minLength={8}
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        placeholder={text(
                                            "Enter your password",
                                        )}
                                        className={inputClass}
                                    />

                                    <button
                                        type="button"
                                        aria-label={text(
                                            showPassword
                                                ? "Hide password"
                                                : "Show password",
                                        )}
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>

                                {isRegister && (
                                    <p className="mt-2 text-xs text-slate-500">
                                        {text(
                                            "Use at least 8 characters.",
                                        )}
                                    </p>
                                )}
                            </div>

                            {isRegister && (
                                <div>
                                    <label
                                        htmlFor="confirm-password"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        {text("Confirm password")}
                                    </label>

                                    <div className="relative">
                                        <LockKeyhole
                                            size={18}
                                            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            id="confirm-password"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            autoComplete="new-password"
                                            required
                                            minLength={8}
                                            value={confirmPassword}
                                            onChange={(event) =>
                                                setConfirmPassword(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder={text(
                                                "Re-enter your password",
                                            )}
                                            className={inputClass}
                                        />

                                        <button
                                            type="button"
                                            aria-label={text(
                                                showConfirmPassword
                                                    ? "Hide confirm password"
                                                    : "Show password",
                                            )}
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword,
                                                )
                                            }
                                            className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!isRegister && (
                                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(event) =>
                                            setRemember(
                                                event.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                                    />

                                    {text("Remember me")}
                                </label>
                            )}

                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                                >
                                    {text(error)}
                                </div>
                            )}

                            {success && (
                                <div
                                    role="status"
                                    className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800"
                                >
                                    {text(success)}
                                </div>
                            )}

                            <Button
                                type="submit" disabled={loading} className="w-full !py-3.5"
                            >
                                {text(
                                    loading
                                        ? isRegister
                                            ? "Creating account..."
                                            : "Logging in..."
                                        : isRegister
                                          ? "Create Account"
                                          : "Log In to Your Account",
                                )}

                                <ArrowRight size={17} />
                            </Button>
                        </form>

                        <p className="mt-7 text-center text-sm text-slate-500">
                            {text(
                                isRegister
                                    ? "Already have an account?"
                                    : "Don't have an account?",
                            )}{" "}

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        isRegister
                                            ? "login"
                                            : "register",
                                    )
                                }
                                className="font-semibold text-blue-600 hover:text-blue-700"
                            >
                                {text(
                                    isRegister
                                        ? "Log in"
                                        : "Create account",
                                )}
                            </button>
                        </p>

                        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                            <ShieldCheck size={15} />
                            {text("Secure business workspace")}
                        </div>
                    </div>
                </div>

                <div className="px-5 py-5 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} NexaBiz.{" "}
                    {text("All rights reserved.")}
                </div>
            </div>
        </div>
    );
}
