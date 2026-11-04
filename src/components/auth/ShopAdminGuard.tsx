import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import api, { TOKEN_KEY, USER_KEY } from "../../api/axios";
import { useLanguage } from "../../locales/LanguageContext";

type Status = "checking" | "allowed" | "denied";
export default function ShopAdminGuard({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const [status, setStatus] = useState<Status>("checking");
  useEffect(() => {
    let active = true;
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    if (!token) { setStatus("denied"); return; }
    // The backend's tenant-aware shop-admin dashboard is the authorization authority.
    api.get("/shop-admin/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { if (active) setStatus("allowed"); })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY); sessionStorage.removeItem(USER_KEY);
        setStatus("denied");
      });
    return () => { active = false; };
  }, []);
  if (status === "denied") return <Navigate to="/login" replace />;
  if (status === "checking") return <div role="status" className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-600">{language === "bn" ? "শপ অ্যাডমিন অনুমতি যাচাই হচ্ছে..." : "Verifying shop admin access..."}</div>;
  return <>{children}</>;
}
