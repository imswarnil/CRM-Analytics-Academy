---
title: A scheduled job fails overnight. What matters most in how you built it?
description: Whether anybody sees it. A job that fails into a log directory nobody opens is a job that is not running, and you find out weeks later from a dashboard.…
type: scenario
topic: apis-and-automation
level: junior
source: academy
---

Whether anybody sees it. A job that fails into a log directory nobody opens is a job that is not running, and you find out weeks later from a dashboard. So: non-zero exit so the scheduler knows, an alert into a channel the team already watches, retry with backoff for transient errors, and resumability for long loads so a failure at part 40 of 60 costs minutes rather than the whole run.
