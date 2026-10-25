import type { Language } from "../types";

export default function LanguageSwitcher({
    language,
    onChange,
}: {
    language: Language;
    onChange: (language: Language) => void;
}) {
    return (
        <select
            aria-label="Select Language"
            value={language}
            onChange={(event) => onChange(event.target.value as Language)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500"
        >
            <option value="en">English</option>
            <option value="bn">বাংলা</option>
        </select>
    );
}

