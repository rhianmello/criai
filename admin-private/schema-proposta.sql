-- CRIAÍ | SCHEMA PROPOSTO PARA UM PROJETO SUPABASE EXCLUSIVO (NÃO APLICADO)
-- NÃO EXECUTAR NO SUPABASE DO XRMOVI.
-- Revisar com o proprietário e auditar no ambiente separado antes do deploy.

begin;

create schema if not exists criai_private;
revoke all on schema criai_private from public, anon, authenticated;

create table if not exists criai_private.owner_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true,
  granted_at timestamptz not null default now(),
  note text
);
comment on table criai_private.owner_access is
'Allowlist aprovada manualmente por administrador confiável. Nunca inserir a partir do navegador.';

create table if not exists criai_private.sync_status (
  source text primary key check (source in ('ga4','google_ads','hotmart')),
  last_success_at timestamptz,
  last_attempt_at timestamptz,
  last_error text
);
create table if not exists criai_private.analytics_daily (
  day date not null,
  channel text not null,
  page_path text not null,
  device_category text not null,
  sessions integer not null default 0 check (sessions>=0),
  active_users integer not null default 0 check (active_users>=0),
  page_views integer not null default 0 check (page_views>=0),
  affiliate_clicks integer not null default 0 check (affiliate_clicks>=0),
  source_updated_at timestamptz not null,
  primary key(day,channel,page_path,device_category)
);
create table if not exists criai_private.ads_daily (
  day date not null,
  campaign_id text not null,
  campaign_name text not null,
  spend_brl numeric(14,2) not null check(spend_brl>=0),
  clicks integer not null default 0 check(clicks>=0),
  source_updated_at timestamptz not null,
  primary key(day,campaign_id)
);
create table if not exists criai_private.hotmart_commissions (
  external_transaction_id text primary key,
  product_id text not null,
  transacted_at timestamptz not null,
  status text not null check (status in ('pending','approved','refunded','chargeback','cancelled','unknown')),
  gross_commission_brl numeric(14,2),
  received_commission_brl numeric(14,2),
  last_verified_at timestamptz not null,
  source_record_hash text,
  check (gross_commission_brl is null or gross_commission_brl>=0),
  check (received_commission_brl is null or received_commission_brl>=0)
);

-- Defesa em profundidade: nenhuma política permite o acesso de anon/authenticated.
-- Operações futuras somente por backend autenticado e segredo guardado no servidor.
alter table criai_private.owner_access enable row level security;
alter table criai_private.owner_access force row level security;
alter table criai_private.sync_status enable row level security;
alter table criai_private.sync_status force row level security;
alter table criai_private.analytics_daily enable row level security;
alter table criai_private.analytics_daily force row level security;
alter table criai_private.ads_daily enable row level security;
alter table criai_private.ads_daily force row level security;
alter table criai_private.hotmart_commissions enable row level security;
alter table criai_private.hotmart_commissions force row level security;

revoke all on all tables in schema criai_private from public, anon, authenticated;
revoke all on all sequences in schema criai_private from public, anon, authenticated;

-- Intencionalmente NÃO cria usuário, permissões de proprietário, API pública nem dados fictícios.
-- A integração precisa validar token e MFA no servidor ANTES de qualquer consulta privilegiada.

commit;
