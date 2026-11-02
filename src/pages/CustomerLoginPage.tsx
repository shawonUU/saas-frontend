import CustomerLoginForm from "../components/auth/CustomerLoginForm";
import type { Language, Page } from "../types";

type Props = {
    navigate: (page: Page) => void;
    language: Language;
    onLanguageChange: (language: Language) => void;
};

export default function CustomerLoginPage(props: Props) {
    return <CustomerLoginForm {...props} />;
}