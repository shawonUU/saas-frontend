import TenantRegisterForm from "../components/auth/TenantRegisterForm";
import type { Language } from "../types";
export default function ShopAdminRegisterPage({ language, onLanguageChange }: { language: Language; onLanguageChange: (next: Language) => void }) {
    return <TenantRegisterForm kind="business_admin" language={language} onLanguageChange={onLanguageChange}/>;
}
