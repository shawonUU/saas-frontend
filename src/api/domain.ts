export type AppMode = "main" | "business_admin" | "storefront";

const normalize = (domain: string) => domain.trim().toLowerCase().replace(/^\.+|\.+$/g, "");
const configuredDomain = normalize(import.meta.env.VITE_SAAS_DOMAIN || "saas.com");
const localDomain = normalize(import.meta.env.VITE_SAAS_LOCAL_DOMAIN || "localtest.me");

export function getTenantContext(hostname = window.location.hostname): { tenantSlug: string; appMode: AppMode } {
    const host = normalize(hostname);
    // Apex SaaS domains must never be interpreted as a store or a shop admin.
    if (["saas.com", configuredDomain, localDomain, "localhost", "127.0.0.1"].includes(host)) {
        return { tenantSlug: "main", appMode: "main" };
    }
    const domains = [...new Set([configuredDomain, localDomain])].sort((a, b) => b.length - a.length);
    for (const domain of domains) {
        if (!host.endsWith(`.${domain}`)) continue;
        const prefix = host.slice(0, -(domain.length + 1));
        const parts = prefix.split(".");
        if (parts.length === 2 && parts[0] === "admin" && validTenantSlug(parts[1])) {
            return { tenantSlug: parts[1], appMode: "business_admin" };
        }
        if (parts.length === 1 && validTenantSlug(parts[0]) && !["www", "api"].includes(parts[0])) {
            return { tenantSlug: parts[0], appMode: "storefront" };
        }
    }
    // Unknown host is not allowed to silently impersonate a shop tenant.
    return { tenantSlug: "main", appMode: "main" };
}

export function validTenantSlug(slug: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function tenantUrl(slug: string, admin = false): string {
    if (!validTenantSlug(slug)) throw new Error("Invalid business slug");
    const host = normalize(window.location.hostname);
    const dev = host === localDomain || host.endsWith(`.${localDomain}`) || host === "localhost" || host === "127.0.0.1";
    const domain = dev ? localDomain : configuredDomain;
    const prefix = `${admin ? "admin." : ""}${slug}`;
    const port = window.location.port ? `:${window.location.port}` : "";
    return `${window.location.protocol}//${prefix}.${domain}${port}`;
}
