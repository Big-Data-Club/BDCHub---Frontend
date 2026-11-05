# Tenant landing pages

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

Both learning buttons go to `/login?tenant=<slug>&callbackUrl=/lms`.
The shared login page reads the same organization to display its name and logo.
The ordinary `/login` retains BDC branding. Signed-in users enter LMS directly.
The tenant parameter is display context only, never a membership or role grant.

Logo URLs come from the organization record (HTTP(S) or a same-origin path).
Without a logo, the template displays the organization's name. The bundled CCE
seal remains available at `/partner/logos/cce-seal.png` if set as `logo_url`.
This template uses the app font stack; partner font binaries are not distributed.

This release supports paths on the existing origin, not custom hostnames.
