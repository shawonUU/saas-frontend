import AuthForm from "../components/auth/AuthForm";
import type { Language, Page } from "../types";

type Props = { navigate: (page: Page) => void; language: Language; onLanguageChange: (language: Language) => void };

export default function RegisterPage(props: Props) {
    return <AuthForm mode="register" {...props} />;
}
