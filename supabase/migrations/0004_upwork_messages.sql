-- Lifework — Upwork: the last message, and whether it is waiting on you.
--
-- The room list already carries the text of the most recent message and who
-- wrote it. `needs_reply` is generated rather than stored so it can never
-- drift from that: if they wrote last, it is yours to answer.
-- Safe to re-run.

alter table upwork_leads add column if not exists last_message           text;
alter table upwork_leads add column if not exists last_message_at        timestamptz;
alter table upwork_leads add column if not exists last_message_from_self boolean;

alter table upwork_leads drop column if exists needs_reply;
alter table upwork_leads
  add column needs_reply boolean
  generated always as (last_message_from_self is false) stored;

create index if not exists upwork_leads_needs_reply_idx
  on upwork_leads (needs_reply, last_activity_at desc);

drop view if exists upwork_leads_api;
create view upwork_leads_api with (security_invoker = true) as
  select
    id, account_id as "accountId", name, status::text, client_company_id as "clientCompanyId",
    room_url as "roomUrl", room_type as "roomType",
    first_contact_at::text as "firstContactAt", last_activity_at::text as "lastActivityAt",
    awaiting_reply as "awaitingReply", unread,
    last_message as "lastMessage", last_message_at::text as "lastMessageAt",
    last_message_from_self as "lastMessageFromSelf", needs_reply as "needsReply",
    had_appointment as "hadAppointment", notes,
    proposal_sent as "proposalSent", proposal_id as "proposalId", proposal_url as "proposalUrl",
    proposal_text as "proposalText", job_title as "jobTitle", job_url as "jobUrl",
    rate, rate_currency as "rateCurrency",
    contract_id as "contractId", contract_status as "contractStatus", contract_title as "contractTitle",
    billed_total as "billedTotal", earned_total as "earnedTotal",
    synced_at::text as "syncedAt", updated_at::text as "updatedAt"
  from upwork_leads;

grant select on upwork_leads_api to anon, authenticated;
