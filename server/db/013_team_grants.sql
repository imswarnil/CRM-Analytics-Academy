-- Teams granted by an admin rather than bought.
--
-- A company asks for Pro for its people (by email, by invoice, as a
-- partnership); an admin creates or edits its team in /admin → Teams with a
-- seat count and an end date. Members get Pro exactly as on a paid team —
-- hasPro() reads app.team the same way — so there is one mechanism, not two.
--
--   source        'dodo' for self-serve seats, 'admin' for a grant.
--   contact_email the company's contact. A granted team may have no owner
--                 account yet; whoever signs up with this address becomes the
--                 owner when they join.
--   auto_join     anyone signing in with a VERIFIED email on the team's
--                 domains joins automatically while seats remain — no invite
--                 links to hand out.
--   note          free text for the admin (PO number, who asked, terms).
--
-- Additive. Apply by hand against Neon, after 012.
alter table app.team alter column owner_user_id drop not null;
alter table app.team add column if not exists source text not null default 'dodo';
alter table app.team add column if not exists contact_email text;
alter table app.team add column if not exists auto_join boolean not null default false;
alter table app.team add column if not exists note text;
alter table app.team add column if not exists granted_by text;

do $$ begin
  alter table app.team add constraint team_source_chk check (source in ('dodo', 'admin'));
exception when duplicate_object then null; end $$;

-- An admin grant always ends: a forgotten "forever" grant is a leak.
do $$ begin
  alter table app.team add constraint team_admin_grant_ends_chk check (source <> 'admin' or current_period_end is not null);
exception when duplicate_object then null; end $$;

create index if not exists team_auto_join_idx on app.team (domain) where auto_join;
