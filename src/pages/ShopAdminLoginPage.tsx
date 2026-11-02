import ShopAdminLoginForm from "../components/auth/ShopAdminLoginForm";
import type { Language, Page } from "../types";

type Props = {
    navigate: (page: Page) => void;
    language: Language;
    onLanguageChange: (language: Language) => void;
};

export default function ShopAdminLoginPage(props: Props) {
    return <ShopAdminLoginForm {...props} />;
}