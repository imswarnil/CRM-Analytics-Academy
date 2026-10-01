# Grouping and Windowing — speaker notes

crmanalytics.imswarnil.com/saql/grouping-and-windowing · 11 slides · ~3 min

## 01 · Grouping and Windowing (6s)

Grouping by all, share of total, running totals, moving averages and rank within a group — the family of calculations that need a row compared against its neighbours.

Everything here answers a question of the form "this row, compared with the others" — which is exactly what plain aggregation cannot do, because aggregation collapses the others away.

## 02 · What you will learn (10s)

- Group by all
- Windowing
- Partitioning is the part people get wrong
- When a window is the wrong tool

## 03 · Group by all (24s)

The simplest two-level calculation. group q by all produces one bucket containing everything, which gives you a company total to compare individual groups against. The two streams are then combined so each segment row can see the total. This is the shape behind every "percentage of revenue" widget, and it is the most common reason anyone opens the query editor at all. Share of total is the canonical two-level query. Once you can write it, the rest of the family — index against the average, contribution to growth, concentration of the top N — is the same manoeuvre with different arithmetic.

## 04 · Windowing (24s)

A window function computes across a set of neighbouring rows without collapsing them. Three uses cover almost everything: A window without an explicit order is a bug that does not announce itself. Running totals, period-over-period and rank all depend on the row order, and if you do not specify it the engine uses whatever order it produced — stable today, different after the next data refresh. The numbers change and nothing in the query looks wrong.

## 05 · Partitioning is the part people get wrong (24s)

Ranking reps within each region means the window resets per region. Ranking all reps globally and then filtering to one region gives you ranks 14, 27 and 31 rather than 1, 2 and 3 — arithmetically correct and wrong for the question. Say the partition out loud before writing it: "the best three reps in each region". The phrase "in each" is the partition. If the sentence has no "in each", you probably do not need a window at all — a plain group and an order will do.

## 06 · Example — Group by all (12s)

SAQL example from "Group by all":

```saql
-- revenue per segment, and each segment's share of the company total
q = load "Academy_Opportunities";
q = filter q by 'StageName' == "Closed Won";
total = group q by all;
total = foreach total generate sum('Amount') as 'Total';
seg = group q by 'Segment';
seg = foreach seg generate 'Segment' as 'Segment', sum('Amount') as 'Revenue';
```

## 07 · Check yourself (14s)

To compute each segment's share of company revenue you need:

Answer: Each group's value compared against an aggregate of ALL rows — two levels of aggregation

## 08 · Check yourself (14s)

A windowed running total differs from a plain sum because:

Answer: It accumulates across the ordered rows rather than collapsing them to one value

## 09 · Check yourself (14s)

Ranking reps within each region requires the window to be:

Answer: Partitioned by region, so each region ranks from 1 independently

## 10 · Recap (8s)

- Group by all: The simplest two-level calculation.
- Windowing: A window function computes across a set of neighbouring rows without collapsing them.
- Partitioning is the part people get wrong: Ranking reps within each region means the window resets per region.
- When a window is the wrong tool: 

## 11 · Keep going (6s)

Next lesson: Working Across Datasets. Everything is free at crmanalytics.imswarnil.com.
