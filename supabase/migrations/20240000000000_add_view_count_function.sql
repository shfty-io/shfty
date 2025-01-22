-- Create function to increment view count
create or replace function increment_view_count(product_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update products
  set view_count = view_count + 1
  where id = product_id;
end;
$$;

-- Create likes table
create table if not exists likes (
  product_id uuid references products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (product_id, user_id)
);

-- Enable RLS
alter table likes enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view any likes" on likes;
drop policy if exists "Users can toggle their own likes" on likes;

-- Create policies
create policy "Users can view any likes"
  on likes for select
  to authenticated
  using (true);

create policy "Users can toggle their own likes"
  on likes for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Drop existing function before recreating
drop function if exists toggle_like(uuid, uuid);

-- Create function to toggle like
create or replace function toggle_like(
  _product_id uuid,
  _user_id uuid
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  liked boolean;
begin
  -- Verify user is toggling their own like
  if _user_id != auth.uid() then
    raise exception 'Not authorized';
  end if;

  -- Try to delete existing like
  with deleted_like as (
    delete from likes
    where product_id = _product_id 
    and user_id = _user_id
    returning true
  )
  select exists (select 1 from deleted_like) into liked;

  if liked then
    -- Like was deleted, decrement counter
    update products
    set likes_count = likes_count - 1
    where id = _product_id;
    return false;
  else
    -- No like existed, insert new one
    insert into likes (product_id, user_id)
    values (_product_id, _user_id);
    
    -- Increment counter
    update products
    set likes_count = likes_count + 1
    where id = _product_id;
    return true;
  end if;
end;
$$; 