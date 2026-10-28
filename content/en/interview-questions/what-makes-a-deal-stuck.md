---
title: What makes a deal 'stuck'?
description: Not a fixed number of days, because needs assessment legitimately takes longer than discovery and a single global threshold flags every healthy enterprise…
type: conceptual
topic: pipeline-analytics
level: mid
source: academy
---

Not a fixed number of days, because needs assessment legitimately takes longer than discovery and a single global threshold flags every healthy enterprise deal. I'd compute each stage's median days from closed historical deals, per segment, and flag deals exceeding roughly twice their own stage median. Then I'd add the signals that are specific to selling AI infrastructure: a late-stage deal with no completed pilot, an enterprise deal where the vendor review hasn't started, a deal over a quarter of a million with only one contact engaged, and any deal past its own close date. I'd combine those into one composite boolean in the recipe so the action list is sortable rather than six separate columns nobody cross-references. And a blank next step on a large late-stage deal is itself a finding worth surfacing.
