import { Boxes } from "lucide-react";

export default function Brand({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex shrink-0 items-center gap-2.5"
        >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <Boxes size={23} />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Nexa<span className="text-blue-600">Biz</span>
            </span>
        </button>
    );
}

