-- CRIAÍ Stripe TEST ONLY: separate email-verification recovery, never mixed with live Mercado Pago orders.
create table if not exists criai_private.stripe_ebook_recovery_challenges (
  id uuid primary key default gen_random_uuid(),
  email_key text not null check (length(email_key)=64),
  requester_key text not null check (length(requester_key)=64),
  buyer_email text,
  code_digest text not null check (length(code_digest)=64),
  eligible boolean not null default false,
  attempts int not null default 0 check (attempts >= 0),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now()+interval '10 minutes'),
  sent_at timestamptz,
  verified_at timestamptz
);
create index if not exists stripe_recovery_email_recent_idx on criai_private.stripe_ebook_recovery_challenges(email_key,created_at desc);
create index if not exists stripe_recovery_ip_recent_idx on criai_private.stripe_ebook_recovery_challenges(requester_key,created_at desc);
create table if not exists criai_private.stripe_ebook_recovery_sessions (
  id uuid primary key default gen_random_uuid(),
  buyer_email text not null,
  token_digest text not null unique check (length(token_digest)=64),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now()+interval '1 hour'),
  revoked_at timestamptz
);
create index if not exists stripe_recovery_session_email_idx on criai_private.stripe_ebook_recovery_sessions(buyer_email);
alter table criai_private.stripe_ebook_recovery_challenges enable row level security;
alter table criai_private.stripe_ebook_recovery_sessions enable row level security;
alter table criai_private.stripe_ebook_recovery_challenges force row level security;
alter table criai_private.stripe_ebook_recovery_sessions force row level security;
revoke all on criai_private.stripe_ebook_recovery_challenges from public, anon, authenticated;
revoke all on criai_private.stripe_ebook_recovery_sessions from public, anon, authenticated;
