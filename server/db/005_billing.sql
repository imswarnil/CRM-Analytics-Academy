-- Billing detail on the entitlement row, for Dodo Payments.
--
-- app.entitlement already carries pro / source / dodo_payment_id. A
-- subscription needs more: the customer (to open the billing portal), the
-- subscription (so a cancellation or failed renewal revokes the right row),
-- the plan, and when the current period ends (so a cancelled subscription
-- keeps access until the end of what was paid for).
alter table app.entitlement add column if not exists plan text;
alter table app.entitlement add column if not exists dodo_customer_id text;
alter table app.entitlement add column if not exists dodo_subscription_id text;
alter table app.entitlement add column if not exists current_period_end timestamptz;

create index if not exists entitlement_subscription_idx on app.entitlement (dodo_subscription_id);
create index if not exists entitlement_customer_idx on app.entitlement (dodo_customer_id);
