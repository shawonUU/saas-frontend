
import { Route } from "react-router-dom";
import BusinessModuleRoute from "./BusinessModuleRoute";
import type { Language } from "./team/types";

type Props = {
    language: Language;
};

export default function BusinessRoutes({ language }: Props) {
    return (
        <>
            <Route
                path="/b/:businessSlug/:moduleSlug/:menuSlug/:childSlug"
                element={<BusinessModuleRoute language={language} />}
            />
            <Route
                path="/b/:businessSlug/:moduleSlug/:menuSlug"
                element={<BusinessModuleRoute language={language} />}
            />
            <Route
                path="/b/:businessSlug/:moduleSlug"
                element={<BusinessModuleRoute language={language} />}
            />
        </>
    );
}
