# Tenant landing pages

Public entry: `/trungtamdientoan`. Add a config in `registry.ts` to publish
another tenant using the same template. Slugs have no leading `/` and must
not collide with existing app routes. Static app routes take precedence.

`organizationSlug` identifies the existing organization; it is not an access
grant and does not automatically enroll users or filter LMS data. Membership
and course authorization remain enforced by the backend. No organization API
or database changes are needed for this public landing.

Both learning buttons go to `/lms`. Existing authentication redirects guests
to the shared `/login?callbackUrl=/lms`; signed-in users enter LMS directly.

Assets served by the app live in `public/partner/logos/`. The CCE seal is copied
unchanged from the parent repository's `cce_resources/logos/cce-seal.png`.
Keep source and served copies in sync when replacing the logo. This template
uses the app font stack; partner font binaries are not distributed.

This release supports paths on the existing origin, not custom hostnames.
