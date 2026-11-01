import axios from "axios";

const hostname = window.location.hostname.toLowerCase();

const BASE_DOMAIN = "saas.com";
const LOCAL_DOMAIN = "localtest.me";

type AppMode = "main" | "business_admin" | "storefront";

function getTenantContext() {
    let subdomain = "";

    if (hostname.endsWith(`.${LOCAL_DOMAIN}`)) {
        subdomain = hostname.slice(0, -(LOCAL_DOMAIN.length + 1));
    } else if (hostname.endsWith(`.${BASE_DOMAIN}`)) {
        subdomain = hostname.slice(0, -(BASE_DOMAIN.length + 1));
    }

    if (!subdomain || hostname === "localhost" || hostname === "127.0.0.1") {
        return {
            tenantSlug: "main",
            appMode: "main" as AppMode,
        };
    }

    const parts = subdomain.split(".");

    if (parts.length === 2 && parts[0] === "admin") {
        return {
            tenantSlug: parts[1],
            appMode: "business_admin" as AppMode,
        };
    }

    if (parts.length === 1) {
        return {
            tenantSlug: parts[0],
            appMode: "storefront" as AppMode,
        };
    }

    return {
        tenantSlug: "main",
        appMode: "main" as AppMode,
    };
}

const context = getTenantContext();

export const tenantSlug = context.tenantSlug;
export const appMode = context.appMode;

export const TOKEN_KEY =
    appMode === "main"
        ? "access_token_main"
        : appMode === "business_admin"
          ? `access_token_business_${tenantSlug}`
          : `access_token_customer_${tenantSlug}`;

export const USER_KEY =
    appMode === "main"
        ? "user_main"
        : appMode === "business_admin"
          ? `user_business_${tenantSlug}`
          : `user_customer_${tenantSlug}`;

const api = axios.create({
    baseURL: "http://127.0.0.1:8001/api",
});

api.interceptors.request.use((config) => {
    const token =
        localStorage.getItem(TOKEN_KEY) ||
        sessionStorage.getItem(TOKEN_KEY);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["X-Tenant-Slug"] = tenantSlug;

    return config;
});

export default api;