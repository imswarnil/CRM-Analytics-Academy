-- Let submitters pick an icon for their resource (shown on /resources).
alter table public.resources add column if not exists icon text;
