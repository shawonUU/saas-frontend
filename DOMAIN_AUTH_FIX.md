# SaaS domain routing fix

## Expected hosts
- `saas.com` -> SaaS public landing and SaaS login `/login`
- `admin.shawonstore.saas.com` -> shop administrator login `/login`; `/dashboard` requires token + backend authorization
- `shawonstore.saas.com` -> shop public storefront and customer login `/login`
- `localtest.me` -> SaaS development portal
- `admin.shawonstore.localtest.me` -> shop admin development
- `shawonstore.localtest.me` -> shop storefront development

## Changes
- Extracted host classification and tenant URL generation to `src/api/domain.ts`.
- SaaS apex host explicitly classified as main app mode.
- Shop admin navigation no longer uses `localtest.me` default in production or forces `:5173`.
- Shop admin storefront link uses current environment host type.
- Existing shop guard and auth storage remain unchanged.

## Deployment configuration
Build with `VITE_SAAS_DOMAIN=saas.com` and `VITE_SAAS_LOCAL_DOMAIN=localtest.me`. Vite env variables are embedded at build time; deploy a fresh build after changing them.
Ensure hosting/web-server routes `saas.com`, `*.saas.com`, and local dev hostnames to correct SPA without redirecting apex `saas.com` to `admin.*`.
Run `curl.exe -I https://saas.com/` from Windows to inspect HTTP `Location:` redirects; if the server issues a 301/302 to admin, fix hosting/Nginx/Apache/Cloudflare rule rather than React.
Clear browser cache and test in private browsing after deployment.

## Security note
Shop Admin guard calls `/shop-admin/dashboard`. Laravel backend MUST authorize tenant membership, role and account class independently. Client-side routing alone is not security isolation.

## Validation limitation
Full `npm run build` could not finish because installed npm dependencies are incomplete (`vite/client` and `@types/node` missing); offline npm install failed because package cache is incomplete. Run `npm ci && npm run build` in a network-connected environment.
