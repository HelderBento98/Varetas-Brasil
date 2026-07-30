-- Schema para o sistema de gestão (Fase 1: fundação multi-empresa).
-- Rode este script inteiro no SQL Editor do seu projeto Supabase
-- (https://app.supabase.com/project/_/sql/new), uma única vez.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  cnpj text default '',
  phone text default '',
  email text default '',
  logo_url text,
  pix_key text default '',
  plano_ativo text check (plano_ativo in ('mensal', 'anual')),
  invite_code text unique not null default upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6)),
  created_at timestamptz not null default now()
);

create table if not exists company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  numero text not null,
  cliente text not null default '',
  servico text not null default '',
  preco numeric(12,2) not null default 0,
  forma_pagamento text default '',
  contato text default '',
  data_orcamento text not null,
  validade_orcamento text,
  status text not null default 'AGUARDANDO INICIO' check (status in ('PAGO', 'PENDENTES', 'AGUARDANDO INICIO')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  descricao text not null default '',
  data text not null,
  horario text not null,
  celular text,
  notificado boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists orders_company_id_idx on orders(company_id);
create index if not exists reminders_company_id_idx on reminders(company_id);
create index if not exists company_members_user_id_idx on company_members(user_id);

-- ---------------------------------------------------------------------
-- updated_at automático em orders
-- ---------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- Helpers de autorização (security definer para evitar recursão de RLS)
-- ---------------------------------------------------------------------

create or replace function is_company_member(target_company_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from company_members
    where company_id = target_company_id and user_id = auth.uid()
  );
$$;

create or replace function is_company_owner(target_company_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from company_members
    where company_id = target_company_id and user_id = auth.uid() and role = 'owner'
  );
$$;

-- ---------------------------------------------------------------------
-- RPCs para criar empresa (vira owner) e entrar via código de convite
-- (evitam expor um INSERT direto em company_members com role arbitrário)
-- ---------------------------------------------------------------------

create or replace function create_company(company_name text)
returns companies
language plpgsql
security definer
set search_path = public
as $$
declare
  new_company companies;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  insert into companies (name) values (coalesce(nullif(trim(company_name), ''), 'Minha Empresa'))
  returning * into new_company;

  insert into company_members (company_id, user_id, role, email)
  values (new_company.id, auth.uid(), 'owner', auth.jwt() ->> 'email');

  return new_company;
end;
$$;

create or replace function join_company(code text)
returns companies
language plpgsql
security definer
set search_path = public
as $$
declare
  target companies;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into target from companies where invite_code = upper(trim(code));

  if target.id is null then
    raise exception 'invite code not found';
  end if;

  insert into company_members (company_id, user_id, role, email)
  values (target.id, auth.uid(), 'member', auth.jwt() ->> 'email')
  on conflict (company_id, user_id) do nothing;

  return target;
end;
$$;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table companies enable row level security;
alter table company_members enable row level security;
alter table orders enable row level security;
alter table reminders enable row level security;

create policy "members can view their company" on companies
  for select using (is_company_member(id));

create policy "members can update their company" on companies
  for update using (is_company_member(id));

create policy "members can view teammates" on company_members
  for select using (is_company_member(company_id));

create policy "owners or self can remove membership" on company_members
  for delete using (is_company_owner(company_id) or user_id = auth.uid());

create policy "members can view company orders" on orders
  for select using (is_company_member(company_id));
create policy "members can insert company orders" on orders
  for insert with check (is_company_member(company_id));
create policy "members can update company orders" on orders
  for update using (is_company_member(company_id));
create policy "members can delete company orders" on orders
  for delete using (is_company_member(company_id));

create policy "members can view company reminders" on reminders
  for select using (is_company_member(company_id));
create policy "members can insert company reminders" on reminders
  for insert with check (is_company_member(company_id));
create policy "members can update company reminders" on reminders
  for update using (is_company_member(company_id));
create policy "members can delete company reminders" on reminders
  for delete using (is_company_member(company_id));
