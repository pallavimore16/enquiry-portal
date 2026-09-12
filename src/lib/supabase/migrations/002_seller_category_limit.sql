-- Run this in Supabase SQL Editor. Safe to re-run.

-- Make sure a (seller, category) pair can't be inserted twice.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'seller_categories_pkey'
  ) then
    alter table public.seller_categories
      add constraint seller_categories_pkey primary key (seller_id, category_id);
  end if;
end $$;

-- Enforce: at most 5 sellers per category.
create or replace function public.enforce_seller_category_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
begin
  select count(*) into current_count
  from public.seller_categories
  where category_id = new.category_id;

  if current_count >= 5 then
    raise exception 'Category % already has the maximum of 5 sellers assigned', new.category_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_seller_category_limit on public.seller_categories;
create trigger trg_seller_category_limit
  before insert on public.seller_categories
  for each row execute function public.enforce_seller_category_limit();

-- Let admins manage assignments (only a read-own policy existed before).
drop policy if exists "seller_links_admin_write" on public.seller_categories;
create policy "seller_links_admin_write"
  on public.seller_categories for all
  to authenticated
  using (public.my_role() = 'ADMIN')
  with check (public.my_role() = 'ADMIN');