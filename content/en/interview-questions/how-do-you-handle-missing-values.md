---
title: How do you handle missing values?
description: First by deciding whether the blank means 'none' or 'unknown', because every fill is a claim — zero asserts none, the average asserts typical. If I fill,…
type: behavioral
topic: data-preparation
level: junior
source: academy
---

First by deciding whether the blank means 'none' or 'unknown', because every fill is a claim — zero asserts none, the average asserts typical. If I fill, I keep a flag column saying I did, so anybody can exclude imputed rows later and can tell which numbers were real. And I never analyse an imputed value against the thing it was imputed from, because I would find the pattern I put there. Sometimes the missingness is the signal: our blank economic-buyer field predicts losing, not because it causes anything but because a disengaged rep does not fill fields in — genuinely predictive and completely unactionable.
