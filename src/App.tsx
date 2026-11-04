import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { LanguageProvider } from "./locales/LanguageContext";

export default function App() {
    return (
        <BrowserRouter>
            <LanguageProvider><AppRoutes /></LanguageProvider>
        </BrowserRouter>
    );
}
