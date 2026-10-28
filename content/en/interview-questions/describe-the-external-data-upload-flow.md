---
title: Describe the external data upload flow.
description: Three steps. Declare a job with the dataset name, the operation and the field metadata; upload the rows as numbered parts; then signal completion, which…
type: conceptual
topic: apis-and-automation
level: junior
source: academy
---

Three steps. Declare a job with the dataset name, the operation and the field metadata; upload the rows as numbered parts; then signal completion, which is when processing actually begins. The failure everyone hits once is forgetting the third step — every part uploads successfully, nothing errors, and no dataset appears, because an un-signalled job is indistinguishable from one still in progress.
