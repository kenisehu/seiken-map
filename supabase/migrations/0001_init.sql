-- 精検実施機関マップ 初期スキーマ
-- 適用: Supabase ダッシュボード → SQL Editor に貼り付けて実行
--   （または supabase CLI: supabase db push）

create extension if not exists "pgcrypto";

-- ============================================================
-- facilities（医療機関）
-- ============================================================
create table if not exists public.facilities (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  municipality       text not null,            -- 那須市 / 所沢市 / 久喜市 / 武蔵野市
  address            text not null,
  lat                float8,
  lng                float8,
  phone              text,
  website            text,
  nearest_station    text,
  walk_minutes       int,
  has_female_doctor  boolean,                  -- null = 未確認
  has_sedation       boolean,
  weekend            boolean,
  quick_reservation  boolean,
  parking            boolean,
  online_reservation boolean,
  in_clinic_prep     boolean,
  barrier_free       boolean,
  credit_card        boolean,
  ct_colonography    boolean,
  exam_types         text[],                   -- 例: {大腸内視鏡,便潜血再検}
  form_note          text,                     -- Googleフォームで施設から回収した補足
  source_url         text,                     -- 出典（自治体リストのURL）
  verified           boolean not null default false,  -- 人間チェック済み
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists facilities_municipality_idx on public.facilities (municipality);

-- ============================================================
-- reviews（選択式・自由記述なし・承認制）
-- ============================================================
create table if not exists public.reviews (
  id               uuid primary key default gen_random_uuid(),
  facility_id      uuid not null references public.facilities (id) on delete cascade,
  sedation_comfort int check (sedation_comfort between 1 and 5),
  staff_kindness   int check (staff_kindness between 1 and 5),
  wait_time        int check (wait_time between 1 and 5),
  approved         boolean not null default false,
  created_at       timestamptz not null default now()
);

create index if not exists reviews_facility_approved_idx
  on public.reviews (facility_id, approved);

-- ============================================================
-- events（計測）
-- ============================================================
create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  event_type   text not null,                  -- 'qr_access' / 'phone_tap' / 'detail_view'
  facility_id  uuid references public.facilities (id) on delete set null,
  municipality text,
  created_at   timestamptz not null default now()
);

create index if not exists events_type_idx on public.events (event_type);
create index if not exists events_facility_idx on public.events (facility_id);

-- ============================================================
-- updated_at 自動更新トリガ
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists facilities_set_updated_at on public.facilities;
create trigger facilities_set_updated_at
  before update on public.facilities
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
--   facilities : 誰でも閲覧可（書き込みは管理者=サービスロールのみ）
--   reviews    : 承認済みのみ閲覧可 / 匿名投稿は approved=false 固定
--   events     : 匿名で記録可（読み取りは不可 → 集計は管理画面/サービスロール）
-- ============================================================
alter table public.facilities enable row level security;
alter table public.reviews    enable row level security;
alter table public.events     enable row level security;

drop policy if exists facilities_select on public.facilities;
create policy facilities_select on public.facilities
  for select using (true);

drop policy if exists reviews_select_approved on public.reviews;
create policy reviews_select_approved on public.reviews
  for select using (approved = true);

drop policy if exists reviews_insert_anon on public.reviews;
create policy reviews_insert_anon on public.reviews
  for insert with check (approved = false);

drop policy if exists events_insert_anon on public.events;
create policy events_insert_anon on public.events
  for insert with check (true);
