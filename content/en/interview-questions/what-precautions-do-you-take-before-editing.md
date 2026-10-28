---
title: What precautions do you take before editing?
description: Export a copy first, every time — the undo story is whatever I saved beforehand. Validate before saving, because a trailing comma produces a file that…
type: conceptual
topic: dashboard-json
level: junior
source: academy
---

Export a copy first, every time — the undo story is whatever I saved beforehand. Validate before saving, because a trailing comma produces a file that will not load and a vaguer error than a validator gives. Round-trip it: reload in the builder and confirm it still opens and still edits visually, since valid JSON the builder cannot reconstruct is the failure that matters. And check it as a restricted user, because edits to steps and filters interact with row-level security in ways an admin account cannot see.
