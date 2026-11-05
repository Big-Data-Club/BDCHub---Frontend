# Tenant UI routing

Public entry: `/trungtamdientoan`. Any active organization uses the same
template at `/<organization-slug>`, with name, description and `logo_url`
loaded from Auth's existing public `GET /api/organizations/slug/{slug}`.
No code registration or rebuild is required. Slugs have no leading `/` and
must not collide with existing app routes. Static app routes take precedence.
Inactive or missing organizations return 404. Backend failures remain errors,
not false 404s. Requests use server-side `BACKEND_URL` with no persistent cache.

`organizationSlug` identifies the existing organization; it is not an access
grant and does not automatically enroll users or filter LMS data. Membership
and course authorization remain enforced by the backend. No organization API
or database changes are needed for this public landing.

Learning buttons open `/<slug>/login` and return to `/<slug>/lms`.
The shared login page reads the same organization to display its name and logo.
The ordinary `/login` retains BDC branding. A session is shared across all paths.

`/<slug>/{lms,knowledge-farm,chat,labs}/...` rewrites to existing UI pages;
browser URLs retain the organization prefix. Nested paths, queries, role
selection, login callbacks and logout retain it as well. Middleware removes
spoofed tenant headers, validates that the org is active and checks authenticated
membership through Auth `/api/organizations/my` before protected UI rewrites.
Non-members receive 403; failed permission lookups fail closed with 503.
Normal service role/resource authorization still runs after the rewrite.

Use `@/lib/tenant/Link` and `@/lib/tenant/navigation` in UI code. Their Link,
push/replace/prefetch preserve tenant prefixes; `usePathname` returns the
canonical path so existing active-nav/role comparisons continue to work.
Server redirects use `tenantRedirect` from `@/lib/tenant/server`.
New service roots need one entry in `tenantRouteRoots` in `paths.ts`; register
non-tenant public paths in `reservedRoots` to avoid slug collisions.

APIs, uploads, assets and WebSocket URLs remain at the origin root. URL branding
does not grant backend access or restrict API datasets to a tenant. Backend
membership, role and resource checks remain authoritative. Organization settings
currently have no service-entitlement field; this implementation does not invent
one or bypass existing service authorization.

The shared logo/sidebar/mobile/footer/LMS entry use tenant context, refreshed
when navigating between tenant paths, without a global tenant cookie.

Logo URLs come from the organization record (HTTP(S) or a same-origin path).
Without a logo, the template displays the organization's name. The bundled CCE
seal remains available at `/partner/logos/cce-seal.png` if set as `logo_url`.
This template uses the app font stack; partner font binaries are not distributed.

This release supports paths on the existing origin, not custom hostnames.

Auth's creation DTO accepts `logoUrl` while its update DTO accepts `logo_url`.
The frontend create adapter maps the field accordingly. If an older create
request silently omitted the logo, edit that organization and save its logo URL.

Organization create/edit forms support PNG/JPEG/WebP logo files up to 2 MB,
with preview and removal. Files upload only on Save through the existing
authenticated LMS `/files/upload` image flow; its returned `/files/...` URL is
stored in Auth's `logo_url`. No frontend-local storage or backend changes are
needed. Tenant context refreshes on navigation to pick up updated branding.

Checks: `node --test tests/tenant-routing.test.cjs`, `pnpm exec tsc --noEmit`,
`pnpm run build`.
