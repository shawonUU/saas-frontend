import { useState } from "react";
import { ArrowRight, ArrowUpRight, BarChart3, Boxes, Building2, Check, CheckCircle2, ChevronRight, Globe2, ShieldCheck, ShoppingCart, Sparkles, Users, Menu, X, Zap } from "lucide-react";
import type { Language, Page } from "../types";
import { translate } from "../locales/translations";
import Brand from "../components/Brand";
import Button from "../components/Button";
import LanguageSwitcher from "../components/LanguageSwitcher";

const features = [
    {
        icon: Building2,
        title: "Business Management",
        description:
            "Manage your businesses, branches, employees and daily operations from one central platform.",
    },
    {
        icon: ShoppingCart,
        title: "Sales & Inventory",
        description:
            "Track stock, manage sales and purchases, and keep your product information organized.",
    },
    {
        icon: BarChart3,
        title: "Reports & Analytics",
        description:
            "Turn business data into useful insights and make smarter decisions with clear reports.",
    },
    {
        icon: Users,
        title: "Team Management",
        description:
            "Organize your team with role-based access and manage employee responsibilities.",
    },
    {
        icon: ShieldCheck,
        title: "Secure Access",
        description:
            "Keep business operations organized with authentication and permission-based access.",
    },
    {
        icon: Globe2,
        title: "Multi-Branch Support",
        description:
            "Manage multiple branches and keep your business operations connected as you grow.",
    },
];

const benefits = [
    "Manage multiple businesses in one place",
    "Organize products, sales and purchases",
    "Monitor branches and employees",
    "Access reports from a central dashboard",
];


export default function LandingPage({
    navigate,
    language,
    onLanguageChange,
}: {
    navigate: (page: Page) => void;
    language: Language;
    onLanguageChange: (language: Language) => void;
}) {
    const [menuOpen, setMenuOpen] = useState(false);

    const goTo = (id: string) => {
        setMenuOpen(false);
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
        });
    };

    const text = (value: string) => translate(value, language);

    return (
        <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
            <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
                <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
                    <Brand onClick={() => goTo("home")} />

                    <nav className="hidden items-center gap-8 lg:flex">
                        {[
                            ["Home", "home"],
                            ["Features", "features"],
                            ["Why NexaBiz", "about"],
                            ["Pricing", "pricing"],
                        ].map(([label, id]) => (
                            <button
                                key={id}
                                onClick={() => goTo(id)}
                                className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
                            >
                                {text(label)}
                            </button>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 lg:flex">
                        <LanguageSwitcher
                            language={language}
                            onChange={onLanguageChange}
                        />
                        <Button
                            variant="secondary"
                            onClick={() => navigate("login")}
                        >
                            {text("Log in")}
                        </Button>
                        <Button onClick={() => navigate("register")}>
                            {text("Get Started")} <ArrowRight size={16} />
                        </Button>
                    </div>

                    <button
                        type="button"
                        aria-label="Toggle navigation"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
                    >
                        {menuOpen ? <X size={23} /> : <Menu size={23} />}
                    </button>
                </div>

                {menuOpen && (
                    <div className="border-t border-slate-100 bg-white p-5 lg:hidden">
                        <nav className="mx-auto flex max-w-7xl flex-col gap-2">
                            <LanguageSwitcher
                                language={language}
                                onChange={onLanguageChange}
                            />
                            {[
                                ["Home", "home"],
                                ["Features", "features"],
                                ["Why NexaBiz", "about"],
                                ["Pricing", "pricing"],
                            ].map(([label, id]) => (
                                <button
                                    key={id}
                                    onClick={() => goTo(id)}
                                    className="rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                                >
                                    {text(label)}
                                </button>
                            ))}
                            <div className="mt-2 grid grid-cols-2 gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate("login")}
                                >
                                    {text("Log in")}
                                </Button>
                                <Button onClick={() => navigate("register")}>
                                    {text("Get Started")}
                                </Button>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            <main>
                <section
                    id="home"
                    className="relative isolate scroll-mt-24 overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-white"
                >
                    <div className="pointer-events-none absolute -right-32 -top-20 -z-10 h-[480px] w-[480px] rounded-full bg-blue-200/30 blur-3xl" />
                    <div className="pointer-events-none absolute -left-40 top-60 -z-10 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />

                    <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-12 lg:py-28">
                        <div>
                            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 shadow-sm">
                                <Sparkles size={15} className="text-blue-600" />
                                <span className="text-xs font-semibold text-blue-700 sm:text-sm">
                                    {text("One platform. Your entire business.")}
                                </span>
                            </div>

                            <h1 className="max-w-2xl text-4xl leading-[1.13] font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-[60px]">
                                {language === "bn" ? (
                                    <>
                                        বুদ্ধিমত্তার সঙ্গে ব্যবসা পরিচালনা করুন,
                                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                            {" "}দ্রুত উন্নতি করুন।
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        Run your business{" "}
                                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                            smarter,
                                        </span>{" "}
                                        grow it faster.
                                    </>
                                )}
                            </h1>

                            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                                {text("Simplify your business operations with one powerful platform for sales, inventory, employees and multiple branches. Spend less time managing and more time growing.")}
                            </p>

                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Button
                                    onClick={() => navigate("register")}
                                    className="min-h-12 px-6"
                                >
                                    {text("Create Your Account")}
                                    <ArrowRight size={17} />
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => goTo("features")}
                                    className="min-h-12 px-6"
                                >
                                    {text("Explore Features")}
                                    <ChevronRight size={17} />
                                </Button>
                            </div>

                            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                                {["Easy to get started", "Built to scale"].map((item) => (
                                    <span key={item} className="flex items-center gap-2">
                                        <CheckCircle2 size={17} className="text-blue-600" />
                                        {text(item)}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="relative mx-auto w-full max-w-xl">
                            <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-blue-200/60 via-indigo-100/40 to-transparent blur-xl" />

                            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-blue-950/10">
                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">
                                            {text("Business Overview")}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {text("Your operations at a glance")}
                                        </p>
                                    </div>
                                    <span className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                        {text("Dashboard")}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 p-4 sm:gap-4 sm:p-6">
                                    {[
                                        { label: "Businesses", value: "12", icon: Building2, color: "bg-blue-50 text-blue-600" },
                                        { label: "Branches", value: "28", icon: Globe2, color: "bg-violet-50 text-violet-600" },
                                        { label: "Team Members", value: "156", icon: Users, color: "bg-cyan-50 text-cyan-700" },
                                        { label: "Products", value: "2,450", icon: Boxes, color: "bg-indigo-50 text-indigo-600" },
                                    ].map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={item.label} className="rounded-xl border border-slate-100 p-4 sm:p-5">
                                                <div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}>
                                                    <Icon size={20} />
                                                </div>
                                                <p className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                                    {item.value}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                                    {text(item.label)}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mx-4 mb-4 rounded-xl bg-slate-50 p-4 sm:mx-6 sm:mb-6 sm:p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">
                                                {text("Everything connected")}
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                {text("Sales, stock and teams in one place.")}
                                            </p>
                                        </div>
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                                            <Zap size={22} />
                                        </div>
                                    </div>
                                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-100">
                                        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-xl sm:flex lg:-left-8">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                    <ShieldCheck size={22} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">
                                        {text("Centralized management")}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {text("One place for your operations")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-y border-slate-100 bg-white">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-7 sm:px-8 md:flex-row">
                        <p className="max-w-xs text-center text-sm font-medium leading-6 text-slate-500 md:text-left">
                            {text("Everything you need to manage a modern business")}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-4 text-sm font-semibold text-slate-400 sm:gap-x-10">
                            <span className="flex items-center gap-2"><Building2 size={19} />{text("Business")}</span>
                            <span className="flex items-center gap-2"><ShoppingCart size={19} />{text("Sales")}</span>
                            <span className="flex items-center gap-2"><Boxes size={19} />{text("Inventory")}</span>
                            <span className="flex items-center gap-2"><Users size={19} />{text("Team")}</span>
                        </div>
                    </div>
                </section>

                <section id="features" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="mx-auto max-w-2xl text-center">
                            <span className="text-sm font-bold tracking-widest text-blue-600 uppercase">
                                {text("Powerful Features")}
                            </span>
                            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                                {text("Everything your business needs")}
                            </h2>
                            <p className="mt-5 text-base leading-7 text-slate-600">
                                {text("Bring your essential business operations together with tools designed to make your everyday work simpler.")}
                            </p>
                        </div>

                        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={feature.title} className="group rounded-2xl border border-slate-200/80 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                            <Icon size={24} />
                                        </div>
                                        <h3 className="mt-6 text-lg font-bold text-slate-900">
                                            {text(feature.title)}
                                        </h3>
                                        <p className="mt-3 text-sm leading-7 text-slate-600">
                                            {text(feature.description)}
                                        </p>
                                        <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-blue-600">
                                            {text("Built for your workflow")}
                                            <ArrowUpRight size={16} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section id="about" className="scroll-mt-24 bg-slate-50 px-5 py-20 sm:px-8 sm:py-24">
                    <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
                        <div>
                            <span className="text-sm font-bold tracking-widest text-blue-600 uppercase">
                                {text("Made for growing businesses")}
                            </span>
                            <h2 className="mt-4 text-3xl leading-tight font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                                {text("Less complexity.")}
                                <br />
                                {text("More control.")}
                            </h2>
                            <p className="mt-5 text-base leading-8 text-slate-600">
                                {text("Stop switching between disconnected tools. NexaBiz brings your business information into one organized workspace so you can manage daily work with greater clarity.")}
                            </p>

                            <div className="mt-8 space-y-4">
                                {benefits.map((benefit) => (
                                    <div key={benefit} className="flex items-start gap-3">
                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                            <Check size={13} />
                                        </span>
                                        <span className="text-sm leading-6 font-medium text-slate-700">
                                            {text(benefit)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button onClick={() => navigate("register")} className="mt-9">
                                {text("Start Managing Your Business")}
                                <ArrowRight size={17} />
                            </Button>
                        </div>

                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-7 text-white sm:p-10">
                            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" />
                            <div className="absolute -right-5 -top-5 h-44 w-44 rounded-full border border-white/10" />

                            <div className="relative">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                                    <BarChart3 size={25} />
                                </div>
                                <h3 className="mt-7 text-2xl font-bold">
                                    {text("One workspace.")}
                                    <br />
                                    {text("Countless possibilities.")}
                                </h3>
                                <p className="mt-4 max-w-sm text-sm leading-7 text-blue-100">
                                    {text("Start with the essentials and build a business management workflow that fits the way you work.")}
                                </p>

                                <div className="mt-8 space-y-3">
                                    {[
                                        "Business and branch organization",
                                        "Product and inventory management",
                                        "Team access and permissions",
                                    ].map((item) => (
                                        <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3.5">
                                            <CheckCircle2 size={19} className="shrink-0 text-blue-200" />
                                            <span className="text-sm font-medium text-white">{text(item)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="pricing" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="text-sm font-bold tracking-widest text-blue-600 uppercase">
                            {text("Simple to get started")}
                        </span>
                        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                            {text("A better way to manage your business")}
                        </h2>
                        <p className="mt-5 leading-7 text-slate-600">
                            {text("Create your account and explore the platform. Choose a suitable plan as your business needs grow.")}
                        </p>

                        <div className="mx-auto mt-9 max-w-md rounded-2xl border border-blue-200 bg-white p-7 text-left shadow-xl shadow-blue-950/5 sm:p-9">
                            <div className="flex items-center justify-between">
                                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                                    {text("GET STARTED")}
                                </span>
                                <Sparkles size={21} className="text-blue-600" />
                            </div>
                            <h3 className="mt-5 text-2xl font-bold text-slate-900">
                                {text("Your business workspace")}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                {text("Register to begin setting up your business management account.")}
                            </p>

                            <div className="my-6 border-t border-slate-100" />

                            <div className="space-y-3">
                                {[
                                    "Business profile setup",
                                    "Organized management dashboard",
                                    "Product and branch management tools",
                                    "Access to available platform features",
                                ].map((item) => (
                                    <div key={item} className="flex items-start gap-3 text-sm text-slate-700">
                                        <Check size={17} className="mt-0.5 shrink-0 text-blue-600" />
                                        {text(item)}
                                    </div>
                                ))}
                            </div>

                            <Button onClick={() => navigate("register")} className="mt-8 w-full">
                                {text("Create Your Account")}
                                <ArrowRight size={17} />
                            </Button>
                            <p className="mt-4 text-center text-xs text-slate-500">
                                {text("Available plans and pricing can be configured for your business model.")}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="px-5 pb-20 sm:px-8 sm:pb-24">
                    <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-12 text-center sm:px-12 sm:py-16">
                        <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border border-white/10" />
                        <div className="absolute -bottom-36 -left-10 h-72 w-72 rounded-full border border-white/10" />

                        <div className="relative">
                            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                {text("Ready to simplify your business?")}
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                                {text("Bring your operations together and take the next step toward more organized business management.")}
                            </p>
                            <Button variant="white" onClick={() => navigate("register")} className="mt-8">
                                {text("Get Started Today")}
                                <ArrowRight size={17} />
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
                    <Brand onClick={() => goTo("home")} />
                    <p className="text-sm text-slate-500">
                        {text("Business management, made simpler.")}
                    </p>
                    <div className="flex flex-wrap gap-5 text-sm text-slate-500">
                        <button onClick={() => goTo("features")} className="hover:text-blue-600">{text("Features")}</button>
                        <button onClick={() => goTo("pricing")} className="hover:text-blue-600">{text("Pricing")}</button>
                        <button onClick={() => navigate("login")} className="hover:text-blue-600">{text("Log in")}</button>
                    </div>
                </div>
                <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} NexaBiz. {text("All rights reserved.")}
                </div>
            </footer>
        </div>
    );
}

