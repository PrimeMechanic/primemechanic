# Production blocker fixes — review and staging handoff

Branch: `fix/production-blockers`, based on `46ba1c04fc7208836cdcbbb51a6536630a3adcd4`.

These changes are prepared for review. They have not been deployed, and no production secrets or databases were changed. Do not merge to a production-connected branch until the migration and staged acceptance checks below are complete.

## What changed

- Opaque, expiring, revocable server sessions stored as SHA-256 hashes; native tokens use Expo SecureStore. Web tokens live in memory and require sign-in after a page reload. Legacy AsyncStorage user JSON is discarded. Password checks, role validation, safe user responses, normalized email input, per-process login throttling, exact CORS origins, and account-scoped access protect the API.
- Customer/vehicle/booking/address/conversation/card/document access is scoped to the authenticated identity. Message senders, booking customer and assigned mechanic are derived by the server. WebSocket registration is removed; the dashboard uses authenticated HTTP polling.
- Bookings use authoritative service prices in integer cents, approved offered services, owned vehicles, future dates, and mechanic row locks to prevent overlapping reservations. Only valid actor-specific status transitions are accepted. Replayed completion does not increment earnings. Vehicle deletion cannot destroy booking history. Default-address updates and review aggregates are transactional.
- Production browse, booking, booking detail/cancellation, messages, mechanic jobs, earnings, account and portfolio screens use persisted APIs instead of fixtures. They retain the app's theme/navigation and show loading/error states. Shop pages are informational and clearly direct users to contact the shop; shop booking is not implemented. The demo route is removed to avoid real API mutations under shared identities.
- Onboarding sends required documents, offered services, consent version and submission time together. It is transactional and can be resubmitted before approval. Submission does not approve the mechanic. Payout setup uses Stripe Connect Express; availability requires approval.
- Uploads have a consistent contract and user-specific object paths. The application verifies uploaded object existence, size, MIME and ownership before attaching it. Private objects require authenticated access; customers can view their assigned job photos. Portfolio uploads are visible to signed-in users. Web images fetch authenticated bytes before displaying them.
- The arbitrary-amount PaymentIntent endpoint returns 410. A customer explicitly pays a completed booking through hosted Stripe Checkout. The server supplies the stored booking amount, USD currency, 20% platform fee, and ready Connect destination. Existing saved Stripe customers are reused. Signed webhook processing retrieves current Stripe state and checks booking, amount, currency, fee and destination before applying a financial effect once.
- Payment attempts are persisted before Stripe calls. Existing sessions are reused; unknown outcomes beyond 23 hours and expired sessions require support reconciliation rather than risking duplicate charges. Destination charges transfer the mechanic portion through Stripe; recorded service earnings are not a claim that money reached a bank account.
- Generated iOS/Android manifests, bundles and assets are served by the production server. Android is no longer redirected to an iOS manifest. A production smoke script verifies both platform paths with Metro stopped. Demo database seeding is opt-in and forbidden in production. Expo native dependencies are aligned to SDK compatibility recommendations. Lockfile tarball URLs use the public registry with integrity checks instead of Replit-only internal URLs.

## Local validation

- `npm test`: 24 passing HTTP/database/security cases using PGlite (an isolated PostgreSQL engine), actual Drizzle operations, bcrypt sessions and Stripe signature verification. Stripe network responses and object storage are mocked. This is not a substitute for a multi-connection hosted PostgreSQL concurrency test.
- `npm run check:types`: passed.
- ESLint: zero errors; existing Reanimated and unused-code warnings remain.
- Web and server production bundles: passed.
- iOS and Android Expo delivery bundles/manifests/assets: passed.
- `npm run test:deployment`: passed for both platform manifests/bundles, root platform routing and anonymous API denial with Metro stopped.
- `expo install --check`: all installed native dependencies match the SDK's compatibility check.

The GitHub checks workflow repeats typecheck, lint, tests, web/server builds, mobile delivery build and delivery smoke test. Repository branch protection must require it; no repository protection settings were changed here.

## Migration — operator review required

1. Back up the database and rehearse a restore. Verify the actual deployed schema matches the active `shared/schema.ts` model. The unused `server/server/db/schema.tsx` is not the application schema.
2. **Existing application database:** review and apply only `migrations/0001_security.sql` in staging first. It adds sessions, payment-event deduplication, onboarding metadata, payment-attempt tracking and supporting indexes. Historical completed bookings are marked once to avoid retroactive double credits; existing balances are preserved and need separate reconciliation against Stripe before production use. The migration records its historical backfill so a rerun cannot mark new unpaid completed work as credited.
3. **Empty database only:** apply `0000_fresh_database.sql`, then `0001_security.sql`. The first is a complete schema export and must not be applied over existing tables. Seed the real service catalog through an approved administrative process. No sample business, paid bookings or verified profiles should be inserted into production.
4. Duplicate existing payment-intent or checkout-session IDs will make unique-index creation fail. Investigate and reconcile those rows rather than removing the constraint.
5. Deploy backend and client together after the additive migration. Old client builds have no session credentials and will receive 401s: arrange a coordinated update/maintenance window. Native builds must include SecureStore and matching native modules; an old custom development client cannot acquire native modules through a JS-only update.
6. Keep new financial traffic disabled until staging reconciliation is signed off. A rollback must not reopen the previous unauthenticated API. Prefer maintenance mode/forward fix while preserving audit/payment rows; use the rehearsed restore plan only with a deliberate reconciliation of any new Stripe activity.

## Environment and service setup

Use `.env.example` as a list of names; it contains no credentials. Supply real values through the deployment secret manager. `PUBLIC_APP_URL` is the canonical HTTPS return/asset origin; `EXPO_PUBLIC_DOMAIN` is embedded into the client at build time. Do not leave the placeholder domains used by tests in a release. Stripe keys continue to come from the existing Replit development/production connector; validate that connector identity and environment separation.

Register the HTTPS `/api/stripe/webhook` endpoint for **snapshot** events and put its signing secret in `STRIPE_WEBHOOK_SECRET`. Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`, `charge.dispute.created`, and `charge.dispute.closed`. This replaces the old sync-only booking behavior; the new handler performs application reconciliation directly. Verify valid/invalid signatures against Stripe test mode before enabling payments. No keys or webhook settings have been changed automatically.

Complete Connect Express onboarding for each mechanic and refresh payout status from Account. A designated operator must review submitted documents/background screening before setting `screening_status=approved` and `is_verified=true`; there is no public self-approval or new staff console. The approved mechanic can then enable availability. Consent evidence records a version and submission timestamp; the actual contractor agreement and background-check process must be approved and served by the business before launch.

Keep `PRIVATE_OBJECT_DIR` private at the bucket level. Validate uploaded-image/PDF MIME metadata against your storage/security policy, set upload quotas and malware/content scanning at the storage/ingress layer, and validate real iOS/Android PUT requests. The application rejects attached objects over 10 MB, but a generic signed PUT alone is not a hard storage-byte quota. Legacy unowned objects are denied rather than automatically made public; reupload or migrate them through a reviewed ownership mapping. Existing portfolio paths may need this ownership migration.

Set an exact browser origin allowlist and the verified `TRUST_PROXY_HOPS` for the actual ingress. Add a shared deployment rate limiter and connection/body limits: the in-process auth guard is supplementary and is not a distributed abuse-control service. `/health/ready` verifies the application database schema; it is not a claim that Stripe or storage is currently reachable.

## Payment operations and deliberate limits

The selected flow charges **after work is completed**, with explicit customer action. It does not automatically charge a saved card or authorize funds before dispatch. Confirm that policy against the business's collection/cancellation requirements before launch.

Refunds/disputes place service earnings on hold (the full booking credit is removed, including for a partial refund) and require support reconciliation. This conservative accounting does not automatically initiate a refund, reverse a destination transfer, or refund an application fee. Operators must handle the related Stripe refund/transfer/fee/dispute actions together and reconcile them before releasing held balances. Dispute outcomes and partial refund allocations must be settled through that process. No customer-facing refund endpoint or staff refund UI is introduced in this change.

Email verification/recovery, a screening administration UI, push notifications, native deep-link return from Checkout, granular partial-refund allocations, and automatic payment recovery are not implemented. Checkout return pages tell the user to return to the app; payment truth comes from signed events, not that page. The manual return path is intentional until app links are configured and device-tested.

## Staging acceptance before merge/deploy

- Use two customer accounts and two mechanics. Verify anonymous and cross-account denial on every private read/write, cards, documents and photos; confirm no response/log exposes password hashes, tokens or client secrets.
- Rehearse interrupted onboarding and retries, approval, Connect setup/refresh and availability. Verify real documents on a second authorized device and denial from unrelated accounts. Verify old unowned objects remain private.
- Create a real priced booking from each platform, test two simultaneous conflicting reservations using a hosted PostgreSQL pool, accept/decline/cancel, before/after uploads, note persistence, completion/replay and a two-device conversation.
- Pay completed work with Stripe test cards including decline/authentication-required flows. Replay and reorder webhook events, test mismatched amount/currency and timeout recovery. Verify one charge/destination transfer and one credit; rehearse refund/dispute holds and support reconciliation.
- Cold-launch updated iOS/Android builds with Metro stopped. Test sign-in restoration, expired/revoked sessions, logout/back, account switching, view switching, browser return and authenticated images. Test web as well; its in-memory session is deliberately cleared by a reload.
- Rebuild using the final public domain. Verify manifests, every launch asset URL and static file path, HTTPS/proxy headers, readiness failure, database backup/restore, monitoring and required pre-merge checks.

References used for Stripe behavior: [webhook signatures and delivery](https://docs.stripe.com/webhooks), [idempotency window](https://docs.stripe.com/api/idempotent_requests), and [destination charges and platform refund responsibilities](https://docs.stripe.com/connect/destination-charges?platform=web&ui=stripe-hosted).
