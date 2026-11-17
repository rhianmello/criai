-- Isolated Stripe *test-mode* orders for the CRIAÍ digital guide.
-- This file is a proposed migration; do not apply until test Stripe secrets
-- and the production deployment strategy have been reviewed.
create table if not exists criai_private.stripe_ebook_orders (
  id uuid primary key,
  buyer_email text not null check (length(buyer_email) between 5 and 254),
  edition text not null check (edition in ('pt','en')),
  amount_cents integer not null default 990 check (amount_cents = 990),
  currency text not null default 'usd' check (currency = 'usd'),
  access_token_sha256 text not null unique check (length(access_token_sha256) = 64),
  stripe_session_id text unique check (stripe_session_id is null or stripe_session_id ~ '^cs_test_'),
  stripe_payment_intent_id text,
  status text not null default 'created' check (status in ('created','pending','paid','failed','refunded','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);
alter table criai_private.stripe_ebook_orders enable row level security;
alter table criai_private.stripe_ebook_orders force row level security;
revoke all on criai_private.stripe_ebook_orders from public, anon, authenticated;
create index if not exists stripe_ebook_orders_email_idx on criai_private.stripe_ebook_orders (buyer_email) where status='paid';
