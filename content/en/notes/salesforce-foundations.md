---
title: "Salesforce Foundations — notes"
description: "Objects, fields, relationships and lead conversion on one page: the data model every CRM Analytics dashboard is built on."
section: salesforce-foundations
lessons: 1
---

## 1 · Objects are tables

**Object** = a table · **record** = a row · **field** = a column.

- Standard objects ship with Salesforce: Lead, Account, Contact, Opportunity, Campaign, Case
- Custom objects end in `__c` (e.g. `Subscription__c`)

| Object | One record is… |
|---|---|
| Lead | a person, not yet qualified |
| Account | a company |
| Contact | a person at an account |
| Opportunity | a deal, with amount + stage |

## 2 · Field types decide what a chart can do

- **Dimensions** — text, picklists → group and filter
- **Measures** — numbers, currency → sum, average, count
- **Dates** — put on a time axis, compare periods

> Watch out: a "revenue" field stored as text cannot be summed. Check the type first!

## 3 · Relationships

- **Lookup** — loose. Child can live alone, has its own sharing. *Opportunity → Campaign*
- **Master-detail** — tight. Child dies with the parent, inherits sharing, parent gets roll-up summaries
- **Many-to-many** — needs a junction object. *Opportunity ↔ Contact* through **Opportunity Contact Role**

## 4 · Lead conversion

::hand-chart{type="flow" title="One Lead, three records"}
---
labels: ["Lead", "Account", "Contact", "Opportunity"]
---
::

The converted Lead keeps `ConvertedAccountId`, `ConvertedContactId`, `ConvertedOpportunityId` → this is what makes **funnel analytics** possible.

## 5 · Ids, never names

- 15 characters (case-sensitive) or **18** (case-insensitive)
- First 3 = the object: `001` Account · `003` Contact · `006` Opportunity · `00Q` Lead
- Every recipe join matches on an **Id** — names repeat and change

## 6 · How CRM Analytics reads it

::hand-chart{type="flow" title="Objects to dashboard"}
---
labels: ["Objects", "Data Sync", "Recipe", "Dataset", "Dashboard"]
---
::

Dashboards query **datasets**, never objects directly. Choose the **grain** first: one row per opportunity, per account, or per lead.
