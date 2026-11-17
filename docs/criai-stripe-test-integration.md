# CRIAÍ — Stripe international payments (test-only staging)

## Scope
- CRIAÍ original PDF guide: **USD 9.90 exactly** via Stripe-hosted Checkout in **test mode**.
- Portuguese production purchase remains **BRL 49.90** via the existing Mercado Pago gateway.
- Isolated database table and Stripe Edge Function; no XRMOVI subscription/payment integration changes.
- Existing full paid PDFs remain private in Supabase Storage. Signed downloads require session ownership token and a fresh provider API verification; **webhook/return URL alone never unlocks**.
- Both 67-page editions can be selected for download after a confirmed purchase.

## Why not live yet
1. The connected Stripe account is **XRmovi test mode**, not a dedicated CRIAÍ production account. This branch deliberately refuses live Stripe credentials.
2. Before creating live Checkout Sessions or products, establish whether the business collects sales tax/VAT/GST, whether Stripe Tax must be enabled, and confirm applicable tax registrations. Do **not** assume tax_exempt or a product tax code.
3. In the Supabase project add `CRIAI_STRIPE_TEST_SECRET_KEY` (`sk_test_`), `CRIAI_STRIPE_TEST_WEBHOOK_SECRET` (`whsec_`). Never put API keys in GitHub/HTML. Stripe OAuth connection to ChatGPT does **not** automatically provision these secrets to Supabase.
4. Apply the reviewed `supabase/stripe/001_criai_stripe_ebook_orders.sql` migration, then deploy `criai-stripe-ebook-test` with JWT verification disabled (server validates origin, opaque tokens, provider state, and Stripe webhook signature). Point a Stripe test webhook at `https://ztqtcbzjesrkuaijmylm.supabase.co/functions/v1/criai-stripe-ebook-test/webhook` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
5. Test the staging `/en/stripe-test.html` and success return `/en/stripe-test-return.html`, plus signature rejection, incomplete session, cancelled payment, foreign test card, duplicate requests, price/currency mismatch, refund and download authorization.
6. The current email recovery endpoint only knows Mercado Pago orders; integrate Stripe orders into the same passwordless recovery verification **before public rollout**.
7. After successful tests and tax compliance review, create a separately approved live CRIAÍ Stripe environment, add isolated live secrets, update the public English CTA and webhook, and retest once in live mode.

**Status:** Source files staged in a draft PR. **Not deployed; no Stripe charge or test checkout executed; no live customer-facing changes.** No guarantee of foreign card approvals until card network, issuing country and compliance are validated.
