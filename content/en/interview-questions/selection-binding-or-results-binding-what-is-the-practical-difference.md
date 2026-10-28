---
title: Selection binding or results binding — what is the practical difference?
description: A selection binding reads what somebody clicked, so the input is visible on screen and it is debuggable by looking. A results binding reads a value…
type: technical
topic: bindings
level: junior
source: academy
---

A selection binding reads what somebody clicked, so the input is visible on screen and it is debuggable by looking. A results binding reads a value another query returned — a company average, a max, a top category — which is more powerful and much harder to debug, because the input is invisible. It also creates an execution order: the dependent widget cannot start until the source returns, so two parallel queries become two sequential ones.
