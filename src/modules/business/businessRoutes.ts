
export const validBusinessSlug = (value: string): boolean =>
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

export function businessPath(
    businessSlug: string,
    moduleSlug: string = "dashboard",
    menuSlug?: string,
    childSlug?: string
): string {
    const parts = [businessSlug, moduleSlug, menuSlug, childSlug].filter(
        (value): value is string => Boolean(value)
    );

    if (!parts.every(validBusinessSlug)) {
        throw new Error("Invalid business or navigation slug.");
    }

    if (childSlug && !menuSlug) {
        throw new Error("Child menu requires a parent menu.");
    }

    return `/b/${parts.join("/")}`;
}

export const businessDashboardPath = (businessSlug: string): string =>
    businessPath(businessSlug, "dashboard");

export function getSelectedBusinessId(): number | null {
    const value = Number(localStorage.getItem("selected_business_id"));
    return Number.isSafeInteger(value) && value > 0 ? value : null;
}

export function setSelectedBusiness(
    business: { id: number; slug: string }
): void {
    if (
        !Number.isSafeInteger(business.id) ||
        business.id <= 0 ||
        !validBusinessSlug(business.slug)
    ) {
        throw new Error("Invalid business.");
    }

    localStorage.setItem("selected_business_id", String(business.id));
    localStorage.setItem("selected_business_slug", business.slug);
}

export function clearSelectedBusiness(): void {
    localStorage.removeItem("selected_business_id");
    localStorage.removeItem("selected_business_slug");
}
