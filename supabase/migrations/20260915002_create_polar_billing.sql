-- ============================================================================
-- Polar Billing: Subscriptions & Orders schema
-- ============================================================================

-- 1. Subscriptions table (Abonnements récurrents)
create table if not exists public.subscriptions (
  id text primary key, -- Polar Subscription ID (sub_xxx)
  user_id uuid references auth.users(id) on delete cascade,
  polar_customer_id text,
  status text not null, -- 'active', 'canceled', 'past_due', 'trialing', 'unpaid'
  product_id text,
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- Policies: Users can view their own subscriptions
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);

-- 2. Orders table (Achats uniques à prix fixe : Templates, Kits, etc.)
create table if not exists public.orders (
  id text primary key, -- Polar Order ID
  user_id uuid references auth.users(id) on delete set null,
  product_id text,
  amount integer, -- Amount in cents
  currency text default 'usd',
  status text default 'paid',
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.orders enable row level security;

-- Policies: Users can view their own orders
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders
  for select
  using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_product_id_idx on public.orders (product_id);

-- 3. Automatic updated_at timestamp trigger for subscriptions
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute function public.handle_updated_at();

-- 4. License keys table (CLI / Bearer-token access to Pro registry downloads)
-- Verified server-side with the Supabase service role (see verifyProAuthorization in
-- src/lib/pro-auth-edge.ts) — a CLI request carries no cookie session, so RLS `auth.uid()`
-- would never match here. The select-own policy below only serves an authenticated user
-- listing their own keys (e.g. an account-settings page), not the verification path itself.
create table if not exists public.license_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  key text not null unique, -- signed token from generateSignedLicenseToken() in src/lib/token-security.ts
  plan text, -- 'pro_lifetime' | 'pro_annual' | 'pro_monthly'
  status text not null default 'active', -- 'active', 'revoked'
  created_at timestamptz default now(),
  last_used_at timestamptz
);

alter table public.license_keys enable row level security;

drop policy if exists "license_keys_select_own" on public.license_keys;
create policy "license_keys_select_own"
  on public.license_keys
  for select
  using (auth.uid() = user_id);

create index if not exists license_keys_user_id_idx on public.license_keys (user_id);
create index if not exists license_keys_key_idx on public.license_keys (key);
