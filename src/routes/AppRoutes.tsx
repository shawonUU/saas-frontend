import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import type { Language, Page } from "../types";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import BusinessDashboardPage from "../pages/BusinessDashboardPage";
import OnlineStorePage from "../pages/OnlineStorePage";


function hasAuthToken() {
    return Boolean(
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token"),
    );
}

export default function AppRoutes() {
    const navigate = useNavigate();
    const [language, setLanguage] = useState<Language>(() =>
        localStorage.getItem("nexabiz-language") === "bn" ? "bn" : "en",
    );

    const changeLanguage = (nextLanguage: Language) => {
        setLanguage(nextLanguage);
        localStorage.setItem("nexabiz-language", nextLanguage);
    };

    const goToPage = (page: Page) => {
        const routes: Record<Page, string> = {
            home: "/",
            login: "/login",
            register: "/register",
            dashboard: "/dashboard",
            "business-dashboard": "/business-dashboard",
        };
        navigate(routes[page]);
        window.scrollTo({ top: 0, behavior: "instant" });
    };

    const pageProps = {
        navigate: goToPage,
        language,
        onLanguageChange: changeLanguage,
    };

    return (
        <Routes>
            <Route path="/" element={<LandingPage {...pageProps} />} />
            <Route path="/login" element={<LoginPage {...pageProps} />} />
            <Route path="/register" element={<RegisterPage {...pageProps} />} />
            <Route
                path="/dashboard"
                element={hasAuthToken() ? <DashboardPage {...pageProps} /> : <Navigate to="/login" replace />}
            />
            <Route
                path="*"
                element={<Navigate to={hasAuthToken() ? "/dashboard" : "/"} replace />}
            />

            <Route
                path="/business-dashboard"
                element={
                    <BusinessDashboardPage
                        onBack={() => goToPage("dashboard")}
                        language={language}
                        onLanguageChange={setLanguage}
                    />
                }
            />

            <Route
                path="/online-stores"
                element={
                    hasAuthToken() ? (
                        <OnlineStorePage />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
        </Routes>
    );
}
