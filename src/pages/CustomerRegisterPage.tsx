import TenantRegisterForm from "../components/auth/TenantRegisterForm";
import type { Language } from "../types";
export default function CustomerRegisterPage({ language, onLanguageChange }: { language: Language; onLanguageChange: (next: Language) => void }) {
    return <TenantRegisterForm kind="customer" language={language} onLanguageChange={onLanguageChange}/>;
}
