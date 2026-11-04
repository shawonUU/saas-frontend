import axios from "axios";

import { getTenantContext } from "./domain";

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
    baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8001/api",
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