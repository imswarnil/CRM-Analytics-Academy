---
title: Does the API bypass the security model?
description: No. Requests authenticate as a user and that user's permissions, sharing and row-level security apply exactly as in the interface. It is worth saying…
type: technical
topic: apis-and-automation
level: junior
source: academy
---

No. Requests authenticate as a user and that user's permissions, sharing and row-level security apply exactly as in the interface. It is worth saying plainly because 'use the API' occasionally gets offered as a workaround for an access problem, and it is not one. It is also the first thing I check when a script's number differs from a dashboard's: usually they are running as different users and both numbers are right.
