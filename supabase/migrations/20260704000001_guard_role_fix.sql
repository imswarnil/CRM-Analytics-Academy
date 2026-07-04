-- Allow backend/service-role updates (auth.uid() is null) to change a profile's
-- role — needed to bootstrap the first admin — while still preventing an
-- authenticated non-admin user from escalating their own role.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    new.role = old.role;
  end if;
  return new;
end;
$$;
