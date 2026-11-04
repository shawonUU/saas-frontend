import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Language } from "../types";

const STORAGE_KEY = "nexabiz-language";
type LanguageContextValue = { language: Language; changeLanguage: (next: Language) => void };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>(() => localStorage.getItem(STORAGE_KEY) === "bn" ? "bn" : "en");
    const changeLanguage = (next: Language) => {
        setLanguage(next);
        localStorage.setItem(STORAGE_KEY, next);
    };
    useEffect(() => {
        document.documentElement.lang = language;
        const sync = (event: StorageEvent) => {
            if (event.key === STORAGE_KEY) setLanguage(event.newValue === "bn" ? "bn" : "en");
        };
        window.addEventListener("storage", sync);
        return () => window.removeEventListener("storage", sync);
    }, [language]);
    const value = useMemo(() => ({ language, changeLanguage }), [language]);
    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error("useLanguage requires LanguageProvider");
    return context;
}
