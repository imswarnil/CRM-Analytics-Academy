---
title: "Service, SLA & Deflection"
description: "Support as a revenue metric: SLA attainment joined to ARR, whether a case spike was the platform's fault, and AI deflection measured net of reopens."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Service"
difficulty: "Intermediate"
publishedAt: "2026-09-27"
datasets:
  - "cases.csv"
  - "csat_surveys.csv"
  - "platform_health_daily.csv"
  - "accounts.csv"
kpis:
  - name: "ARR Behind Breaches"
    formula: "sum(distinct account ARR) over accounts with at least one breach"
    note: "Distinct at account level. An account with nine breaches would otherwise contribute its ARR nine times — fan-out arriving in a service dashboard where nobody expects it."
  - name: "AI Deflection Rate (net)"
    formula: "count(DeflectedByAI AND not Reopened) / count(all cases)"
    note: "Net of reopens. A deflected case that came back was delayed, not deflected, and it cost the customer an extra round trip. Gross and net ship side by side."
  - name: "CSAT with response rate"
    formula: "avg(CSAT) shown beside count(surveys) / count(closed cases)"
    note: "666 surveys against ~1,777 cases. A satisfaction score without its response rate is an advertisement rather than a measurement."
recipe:
  - step: "Verify the SLA flag against the raw hours"
    detail: "Resolution hours against target hours, on a handful of rows. A precomputed status field is somebody else's definition."
  - step: "Join cases to accounts for the ARR view"
    detail: "Turns an operations number into a revenue conversation — and it is the join that gets support headcount funded."
  - step: "Overlay case volume on platform incident days"
    detail: "platform_health_daily has no account key by design; it answers 'was it us', not 'what did this customer see'."
  - step: "Report deflection gross and net together"
    detail: "Showing only gross is the flattering version, and it is the one that gets an AI investment renewed on a false premise."
techniques:
  - "Distinct aggregation"
  - "Date joins"
  - "Response-rate reporting"
  - "Honest metrics"
---

Built step by step in the course: **[Build: Service, SLA and Deflection](/revops-analytics/service-sla-and-deflection)**. Every number below has a
written definition, and the dataset README states the true totals so you can check your own
build against something independently true.
