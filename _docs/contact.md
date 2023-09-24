---
title: Contact form (via FormSpree)
tags:
- setup
subtitle: This document covers the setup and options of theme feature described in
  the doc title
author: sara
---

Submit the form and confirm your email address at [FormSpree](https://formspree.io/). Then add the following include to a page, replacing the email address:

{% raw %}
```yaml
{% include formspree.html email="my_name@gmail.com" redirect="/thanks/" name="true" subject="true" %}
```
{% endraw %}

