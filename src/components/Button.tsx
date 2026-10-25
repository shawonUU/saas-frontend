import type { ReactNode } from "react";

export default function Button({
    children,
    onClick,
    variant = "primary",
    type = "button",
    className = "",
}: {
    children: ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "white";
    type?: "button" | "submit";
    className?: string;
}) {
    const styles = {
        primary:
            "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700",
        secondary:
            "border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700",
        white: "bg-white text-blue-700 hover:bg-blue-50",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${styles[variant]} ${className}`}
        >
            {children}
        </button>
    );
}

