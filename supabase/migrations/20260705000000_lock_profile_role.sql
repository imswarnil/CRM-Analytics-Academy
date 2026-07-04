-- Hard lock on profile.role escalation (defense-in-depth alongside the guard
-- trigger). Replace the blanket UPDATE grant with column-level grants that
-- exclude `role`, so anon/authenticated can update their editable fields but
-- can NEVER change their role. Only the service role (used for deliberate admin
-- bootstrap) can — it bypasses column grants.
revoke update on public.profiles from authenticated;
revoke update on public.profiles from anon;
grant update (username, full_name, avatar_url, bio) on public.profiles to authenticated;
