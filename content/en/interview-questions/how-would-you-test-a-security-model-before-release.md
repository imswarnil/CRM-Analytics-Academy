---
title: How would you test a security model before release?
description: "As three people, never as myself: someone who should see a slice, their manager, and someone who should see nothing. I check that the restricted total is…"
type: conceptual
topic: setup
level: junior
source: academy
---

As three people, never as myself: someone who should see a slice, their manager, and someone who should see nothing. I check that the restricted total is lower than the unrestricted one by exactly the amount I expect, rather than just checking that something appears — 'not empty' is not the same as 'correct'. And I deliberately blank a predicate field once, so I have seen what a null does and recognise the symptom when it is reported.
