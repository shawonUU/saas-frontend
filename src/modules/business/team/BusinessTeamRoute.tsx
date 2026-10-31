
import { useNavigate, useParams } from "react-router-dom";
import BusinessTeamPage from "./pages/BusinessTeamPage";
import type { Language } from "./types";

type Props = {
    language: Language;
};

export default function BusinessTeamRoute({ language }: Props) {
    const navigate = useNavigate();
    const { businessId } = useParams<{ businessId: string }>();
    const id = Number(businessId);
    const t = (en: string, bn: string) => language === "bn" ? bn : en;

    if (!Number.isSafeInteger(id) || id <= 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="rounded-xl border bg-white p-6 text-center">
                    <p className="text-sm text-red-600">
                        {t("Invalid business ID.", "ভুল ব্যবসার আইডি।")}
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
                    >
                        {t("Back to Dashboard", "ড্যাশবোর্ডে ফিরুন")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <BusinessTeamPage
            businessId={id}
            language={language}
            onBack={() => navigate(`/businesses/${id}/dashboard`)}
        />
    );
}
