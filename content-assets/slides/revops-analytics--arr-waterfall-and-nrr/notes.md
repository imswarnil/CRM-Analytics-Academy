# Build: The ARR Waterfall and Net Retention — speaker notes

crmanalytics.imswarnil.com/revops-analytics/arr-waterfall-and-nrr · 19 slides · ~9 min

## 01 · Build: The ARR Waterfall and Net Retention (6s)

Build 14 — new, expansion, contraction and churn as a single bridge, and the one number that predicts the Academy's future better than any pipeline metric: net revenue retention.

Build 14. Most of the Academy's ARR arrives as new logos, but the base it already has grew on its own by nearly 40% in a year — teams adding seats, buying another classroom block, topping up vouchers — and in September 2026 a single churned account took $354K of it away again. This dashboard is how you see both.

## 02 · What you will learn (12s)

- Why the snapshot is the whole build
- The metrics
- The layout
- The two readings that matter
- The Academy's own reading
- The last widget is the most used

## 03 · Why the snapshot is the whole build (24s)

arrsnapshots.csv is 1,579 rows: one per account per month, eighteen months. The same account appears eighteen times, and each row states what was true that month. This is what the datasets and modelling section called a snapshot dataset, and it is the only reason this build exists — new, expansion, contraction and churn are movements between states*, and no amount of cleverness recovers them from an account record that only knows today's number.

## 04 · The two readings that matter (20s)

Those two scenarios have the same NRR and completely different futures. That is the argument for putting gross retention on the screen beside it, permanently — the most common executive-dashboard mistake in a subscription business is reporting NRR alone and congratulating a company that is losing a fifteenth of its base every period.

## 05 · The Academy's own reading (24s)

The cohort of 20 accounts that were paying in September 2025 opened at $912K of ARR. Twelve months later they had added $386K of expansion and lost $25K to contraction and churn: NRR of 139.5% and GRR of 97.2%. That is the healthy case on the left — but it rests on twenty accounts, and the company's biggest single movement of the whole period arrived in September 2026 from outside that cohort: one account churning $354K, which turned the month's net new ARR negative. A retention dashboard that only showed the cohort NRR would have reported an excellent year and missed the month that mattered.

## 06 · The last widget is the most used (24s)

The movements table — account, movement type, amount — is what turns this from a reporting screen into a working one. When the CRO asks why contraction doubled, the answer is three account names, and it is on the screen already. Sort it by absolute movement, not by signed value. The largest contraction and the largest expansion are both interesting; sorting by signed amount buries the contractions at the bottom where nobody looks, which is exactly the wrong end of the table to hide.

## 07 · Lab 1 — Understand why this file is a snapshot (50s)

Screen: Browse → arr_snapshots → lens → group by Month, count rows

One row per account per month, eighteen months, one thousand five hundred and seventy-nine rows. The same account appears eighteen times. That is not duplication — each row is a statement about that month, and it is the only reason a waterfall is possible at all. You cannot recompute last March's ARR from today's account record, because the account record only knows today.

## 08 · Lab 2 — The mistake to make once (45s)

Screen: In the lens → sum ClosingARR with no month filter

Sum Closing A-R-R across every row and you get roughly eighteen years of revenue. Nothing errors. This is the snapshot version of the fan-out from section three: every query against a snapshot must either pick a month or group by one, and forgetting produces arithmetic that is correct and information that is nonsense.

## 09 · Lab 3 — The movement columns are the waterfall (50s)

Screen: Group by Month → sum NewARR, ExpansionARR, ContractionARR, ChurnedARR

Four columns already carry the movements: new, expansion, contraction and churn. You are not deriving them — the snapshot recorded them at the time. This is exactly why the setup section warned about losing Movement Type to a permission problem: the chart would still render, the total would still be right, and all four movements would collapse into one indistinguishable net number.

## 10 · Lab 4 — Build the bridge (50s)

Screen: Waterfall or stacked column → Month on the axis, the four movements as series

Opening A-R-R, plus new, plus expansion, minus contraction, minus churn, equals closing. Check that arithmetic on one month before you trust the chart — if opening plus the movements does not equal closing, you have either filtered something out or picked up a duplicate account row.

## 11 · Lab 5 — Net revenue retention (55s)

Screen: New KPI → (opening + expansion − contraction − churn) ÷ opening, for the cohort

N-R-R measures what happened to the customers you already had, so new business is excluded deliberately — including it measures sales, not retention. Opening A-R-R plus expansion minus contraction minus churn, divided by opening. Above one hundred percent means the existing base grew on its own, which is the single most predictive number on this dashboard.

## 12 · Lab 6 — Gross retention beside it (50s)

Screen: Second KPI → (opening − contraction − churn) ÷ opening

Gross retention removes expansion too, so it can never exceed one hundred percent. Put the two side by side: the gap between them is entirely expansion, and that gap is the thing a business selling seats into teams lives on. N-R-R of a hundred and twelve with gross retention of ninety-four tells a completely different story from N-R-R of a hundred and twelve with gross of ninety-eight.

## 13 · Lab 7 — Split by segment, and look for the lie (45s)

Screen: Break NRR by Segment

Company-level N-R-R hides everything. Split it by segment and you usually find one segment carrying the number and another quietly bleeding. Self-Serve and Strategic behave nothing alike at the Academy, and a single blended figure lets a real problem hide behind a good average for two quarters.

## 14 · Lab 8 — Check against the README (35s)

Screen: README.md → ARR figures → compare closing ARR for the latest month

Compare your latest closing A-R-R with the README. If it is high, you are probably summing across months somewhere; if it is low, check whether inactive accounts are being filtered out when they should be counted as churned rather than excluded.

## 15 · Check yourself (14s)

Why does net revenue retention exclude new business?

Answer: NRR measures what happened to customers you already had — including new logos measures sales, not retention

## 16 · Check yourself (14s)

Gross retention can never exceed 100% because:

Answer: It removes expansion, leaving only contraction and churn, which can only subtract

## 17 · Check yourself (14s)

Summing ClosingARR across all 1,579 snapshot rows gives:

Answer: Roughly eighteen years of revenue — every query on a snapshot must pick or group by a month

## 18 · Recap (8s)

- Why the snapshot is the whole build: csv is 1,579 rows: one per account per month, eighteen months.
- The metrics: 
- The layout: 
- The two readings that matter: Those two scenarios have the same NRR and completely different futures.
- The Academy's own reading: The cohort of 20 accounts that were paying in September 2025 opened at $912K of ARR.
- The last widget is the most used: The movements table — account, movement type, amount — is what turns this from a reporting screen into a working one.

## 19 · Keep going (6s)

Next lesson: Build: Consumption and Commit Risk. Everything is free at crmanalytics.imswarnil.com.
