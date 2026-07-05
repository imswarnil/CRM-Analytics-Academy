-- Optional LinkedIn profile URL, shown next to a member's name wherever they're
-- credited as an author (resources, feedback, guestbook) so readers can connect.
alter table public.profiles add column if not exists linkedin_url text;
