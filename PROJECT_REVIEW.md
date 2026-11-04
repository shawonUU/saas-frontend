# SaaS Frontend – Frontend Review and Updates

## Current three tenant experiences

| Host | Login | Registration | Dashboard |
|---|---|---|---|
| `saas.com` or root `localtest.me` | `/login` via `AuthForm` | `/register` via `AuthForm` | `/dashboard` |
| `admin.<shop>.saas.com` or `admin.<shop>.localtest.me` | `/login` via `ShopAdminLoginForm` | `/register` via `ShopAdminRegisterPage` | `/dashboard` |
| `<shop>.saas.com` or `<shop>.localtest.me` | `/login` via `CustomerLoginForm` | `/register` via `CustomerRegisterPage` | `/dashboard` |

The frontend **does not** create privileged users by changing user roles in browser code. Shop administration registration calls `POST /api/auth/invitations/register` with `name`, `email`, `password`, `password_confirmation`, `invitation_code` and `tenant_slug`. **Backend must implement and enforce** invitation validation and permissions. It is not supplied in this frontend ZIP. Customer and main registrations continue using the existing `POST /api/auth/register` endpoint; backend must verify tenant/account types, authorization and roles for all three modes.

## Language

- Shared English/Bangla setting is persisted as `nexabiz-language` in localStorage.
- `LanguageProvider` updates document `lang`, propagates language changes immediately through React, and syncs updates from other browser tabs.
- Existing `t("English", "বাংলা")` usage continues; empty BN values fall back to English.
- Existing dictionary-based legacy `text("English")` remains compatible. Missing strings must be added to `src/locales/translations.ts`.
- ShopLayout now changes language without hard page reload; storefront, shop-admin dashboard, and online-store management have a floating toggle in addition to existing page-level toggles.

## Current limitations

- This archive contains **only the React frontend**, not the Laravel routes/controllers/database or tests. End-to-end registration, login and permissions are **not verified**.
- Customer dashboard is a simple placeholder in the original archive; full account/order functionality needs backend design and implementation.
- Some legacy pages use literal English labels or API-provided text. Those need further localization auditing; no claim of 100% translated copy is made.
- Dependency installation and full `npm run build` verification were blocked because required packages were not available in offline cache.
- TypeScript/TSX **syntax parse** was checked across all source files; this is not equivalent to a production build or runtime QA.

## Deployment checklist

1. Confirm backend route and authorization rules for each tenant, especially invitation-only shop-admin registration.
2. Install package dependencies with `npm ci` in an environment with npm registry access, then run `npm run build` and `npm run lint`.
3. Test all three hosts, login/register/logout, owner vs admin vs customer permissions, both languages and mobile views.
4. Review route-specific backend errors, dynamic content language fields and accessibility on supported devices.
