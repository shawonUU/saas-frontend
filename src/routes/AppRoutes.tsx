
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from "../locales/LanguageContext";
import {
    Navigate,
    Route,
    Routes,
    useNavigate,
    useParams
} from "react-router-dom";
import type { ReactNode } from "react";

import { TOKEN_KEY, appMode } from "../api/axios";
import type { Language, Page } from "../types";

import LoginPage from "../pages/LoginPage";
import ShopAdminLoginPage from "../pages/ShopAdminLoginPage";
import CustomerLoginPage from "../pages/CustomerLoginPage";
import RegisterPage from "../pages/RegisterPage";
import CustomerRegisterPage from "../pages/CustomerRegisterPage";
import ShopAdminRegisterPage from "../pages/ShopAdminRegisterPage";
import DashboardPage from "../pages/DashboardPage";
import BusinessDashboardPage from "../pages/BusinessDashboardPage";
import OnlineStorePage from "../pages/OnlineStorePage";
import StorefrontHome from "../pages/StorefrontHome";
import ShopAdminHome from "../pages/ShopAdminHome";

import BusinessRoutes from "../modules/business/routes";

import {
    businessDashboardPath,
    validBusinessSlug
} from "../modules/business/businessRoutes";
import LandingPage from "../pages/LandingPage";


function hasAuthToken(): boolean {
    return Boolean(
        localStorage.getItem(TOKEN_KEY) ||
        sessionStorage.getItem(TOKEN_KEY)
    );
}


function ProtectedRoute({ children }: { children: ReactNode }) {
    if (!hasAuthToken()) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}


function BusinessDashboardRoute({
    language,
    onLanguageChange
}: {
    language: Language;
    onLanguageChange: (language: Language) => void;
}) {
    const navigate = useNavigate();

    const { businessSlug } = useParams<{
        businessSlug: string;
    }>();

    if (!businessSlug || !validBusinessSlug(businessSlug)) {
        return <Navigate to="/dashboard" replace />;
    }

    const storedSlug = localStorage.getItem("selected_business_slug");

    // Avoid showing a previously selected business under another URL.
    if (storedSlug && storedSlug !== businessSlug) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <BusinessDashboardPage
            onBack={() => navigate("/dashboard")}
            language={language}
            onLanguageChange={onLanguageChange}
        />
    );
}


export default function AppRoutes() {
    const navigate = useNavigate();

    const { language, changeLanguage } = useLanguage();

    const goToPage = (page: Page) => {
        const selectedBusinessSlug =
            localStorage.getItem("selected_business_slug");

        const routes: Record<Page, string> = {
            home: "/",
            login: "/login",
            register: "/register",
            dashboard: "/dashboard",

            "business-dashboard":
                selectedBusinessSlug &&
                validBusinessSlug(selectedBusinessSlug)
                    ? businessDashboardPath(selectedBusinessSlug)
                    : "/dashboard"
        };

        navigate(routes[page]);

        window.scrollTo({
            top: 0,
            behavior: "instant"
        });
    };


    const pageProps = {
        navigate: goToPage,
        language,
        onLanguageChange: changeLanguage
    };


    // Business Admin and Storefront Application Routes
    if (appMode !== "main") {

        const LoginComponent =
            appMode === "business_admin"
                ? ShopAdminLoginPage
                : CustomerLoginPage;

        return (
            <Routes>

                {/* Mode Specific Login */}
                <Route
                    path="/login"
                    element={<LoginComponent {...pageProps} />}
                />


                {/* Storefront Registration */}
                <Route
                    path="/register"
                    element={
                        appMode === "storefront"
                            ? <CustomerRegisterPage {...pageProps} />
                            : <ShopAdminRegisterPage {...pageProps} />
                    }
                />


                {/* Storefront Home */}
                <Route
                    path="/"
                    element={
                        appMode === "storefront"
                            ? <><StorefrontHome language={language} /><FloatingLanguageSwitch language={language} onChange={changeLanguage} /></>
                            : <Navigate to="/dashboard" replace />
                    }
                />


                {/* Mode Specific Dashboard */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            {appMode === "business_admin" ? (
                                <><ShopAdminHome language={language} /><FloatingLanguageSwitch language={language} onChange={changeLanguage} /></>
                            ) : (
                                <div className="min-h-screen bg-slate-50 p-8"><h1 className="text-xl font-bold">{language === "bn" ? "আমার অ্যাকাউন্ট" : "My Account"}</h1><FloatingLanguageSwitch language={language} onChange={changeLanguage} /></div>
                            )}
                        </ProtectedRoute>
                    }
                />


                {/* Unknown Route */}
                <Route
                    path="*"
                    element={
                        <Navigate
                            to={
                                hasAuthToken()
                                    ? "/dashboard"
                                    : "/login"
                            }
                            replace
                        />
                    }
                />

            </Routes>
        );
    }


    // Main SaaS Application Routes
    return (
        <Routes>

            {/* Public Routes */}
            <Route
                path="/"
                element={<LandingPage {...pageProps} />}
            />

            {/* SaaS Owner Login */}
            <Route
                path="/login"
                element={<LoginPage {...pageProps} />}
            />

            <Route
                path="/register"
                element={<RegisterPage {...pageProps} />}
            />


            {/* Main SaaS Dashboard */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage {...pageProps} />
                    </ProtectedRoute>
                }
            />


            {/* Business Dashboard with Business Slug */}
            <Route
                path="/b/:businessSlug/dashboard"
                element={
                    <ProtectedRoute>
                        <BusinessDashboardRoute
                            language={language}
                            onLanguageChange={changeLanguage}
                        />
                    </ProtectedRoute>
                }
            />


            {/* Legacy Business Dashboard Redirect */}
            <Route
                path="/business-dashboard"
                element={
                    <ProtectedRoute>
                        <LegacyBusinessDashboardRedirect />
                    </ProtectedRoute>
                }
            />


            {/* Business Module / Menu / Child Menu Routes */}
            {BusinessRoutes({ language })}


            {/* Online Store */}
            <Route
                path="/online-stores"
                element={
                    <ProtectedRoute>
                        <><OnlineStorePage /><FloatingLanguageSwitch language={language} onChange={changeLanguage} /></>
                    </ProtectedRoute>
                }
            />


            {/* Unknown Route */}
            <Route
                path="*"
                element={
                    <Navigate
                        to={hasAuthToken() ? "/dashboard" : "/"}
                        replace
                    />
                }
            />

        </Routes>
    );
}


function LegacyBusinessDashboardRedirect() {
    const slug = localStorage.getItem("selected_business_slug");

    if (!slug || !validBusinessSlug(slug)) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <Navigate
            to={businessDashboardPath(slug)}
            replace
        />
    );
}

function FloatingLanguageSwitch({ language, onChange }: { language: Language; onChange: (next: Language) => void }) {
    return <div className="fixed bottom-20 right-4 z-[90] rounded-xl border border-slate-200 bg-white p-1 shadow-lg sm:bottom-5" role="group" aria-label="Language settings"><LanguageSwitcher language={language} onChange={onChange} /></div>;
}
