# SaaS frontend: login + navbar language update

## Changes
- Separate existing SaaS owner (`main`), shop admin (`business_admin`) and customer (`storefront`) login routes remain in their respective host contexts.
- Shop admin `/dashboard` checks the shop-admin API before rendering, including direct URL access.
- Shop-admin login verifies API access before persisting its scoped token.
- Language selectors moved into the shop-admin header, customer-storefront navbar, and customer-account header. Existing SaaS dashboard and business topbars already contained navbar language selectors. Online Store main page gets a sticky top language bar.
- Preserved `t("English", "বাংলা")` convention for the new labels.

## Backend requirement
`GET /api/shop-admin/dashboard` MUST validate tenant slug, logged-in membership and allowed admin/owner/manager permissions. The frontend cannot independently guarantee roles or authenticate tokens. The same applies to all write endpoints. Customer login still calls the existing `/api/auth/login` endpoint, so server-side account-type restrictions must be implemented in Laravel.

## Local verification
`npm run build` was attempted but could not run because the extracted ZIP has no node_modules (missing vite/client and @types/node). `npm ci` did not finish within available execution time. Build and browser/server integration are not verified.

## Test
1. Open admin.shawonstore.localtest.me/dashboard signed out -> /login.
2. Log in with an authorized staff account -> dashboard and header language toggle.
3. Log in with a storefront-only account -> denied if server enforces shop-admin permission.
4. Open shawonstore.localtest.me -> public storefront with header toggle.
5. Open storefront login -> customer account; verify separate customer token.
6. Open saas.com -> SaaS login/dashboard with main token.
