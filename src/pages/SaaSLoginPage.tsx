import SaaSLoginForm from "../components/auth/SaaSLoginForm";
import type { Language, Page } from "../types";

type Props = {
    navigate: (page: Page) => void;
    language: Language;
    onLanguageChange: (language: Language) => void;
};

export default function SaaSLoginPage(props: Props) {
    return <SaaSLoginForm {...props} />;
}