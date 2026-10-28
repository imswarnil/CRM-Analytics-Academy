---
title: How do you handle a dashboard that mixes datasets?
description: Either wire the selection across with a binding, when the two genuinely share a key like AccountId, or separate them visually and say they are separate.…
type: behavioral
topic: interactions
level: junior
source: academy
---

Either wire the selection across with a binding, when the two genuinely share a key like AccountId, or separate them visually and say they are separate. What I avoid is the middle ground where some widgets respond and some do not without any signal. For data with no shared key — platform health against accounts — separating them is the honest choice, because wiring it would imply a link that does not exist.
