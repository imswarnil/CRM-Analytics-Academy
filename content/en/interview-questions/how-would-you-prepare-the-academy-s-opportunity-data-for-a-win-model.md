---
title: How would you prepare the Academy's opportunity data for a win model?
description: One row per opportunity, because that is what I want to score — joining line items triples multi-product deals and biases the training silently. Filter to…
type: conceptual
topic: einstein-discovery
level: junior
source: academy
---

One row per opportunity, because that is what I want to score — joining line items triples multi-product deals and biases the training silently. Filter to new business, because renewals win 88% of the time and including them teaches the model that the best predictor of winning is already being a customer: true, useless, and it reports excellent accuracy while doing it. Then remove leaked fields, check the class balance, and train on earlier data evaluated on later data so it mirrors predicting forward.
