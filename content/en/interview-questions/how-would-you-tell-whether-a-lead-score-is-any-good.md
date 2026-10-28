---
title: How would you tell whether a lead score is any good?
description: Plot conversion rate by score band and check it increases monotonically — A above B above C above D. That's the whole test, and a surprising number of…
type: conceptual
topic: pipeline-analytics
level: mid
source: academy
---

Plot conversion rate by score band and check it increases monotonically — A above B above C above D. That's the whole test, and a surprising number of production scores fail it. I'd put lead volume next to each bar, because a band with thirty leads and a high rate is noise. Then I'd quantify the lift as the A-band rate over the overall rate; under about 1.3x it isn't worth reps' attention. Two confounds to control for, both of which inflate the score's apparent value: reps work high-scoring leads harder, so I'd facet by touch count, and low bands may never be routed at all, so their rate reflects neglect rather than quality. Then the useful part — test individual fields against conversion and compare. In most companies a single behavioural field outperforms the whole demographic model, because it's evidence of intent rather than a guess about it. At the Academy it went the other way: persona beat both the score and the course-started flag, because the learner who studies is rarely the manager who buys — which is exactly why you run the test instead of assuming the answer.
