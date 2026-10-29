# SPEC — CRM Analytics Academy, 30 s

GOAL:    a viewer who uses Salesforce knows there is a free place to learn CRM Analytics, practise the exam and prep the interview — and remembers the URL.
OUTPUT:  HyperFrames, 1920 × 1080, 30 fps
TIME:    30 s × 30 = 900 frames. Music 120 BPM: a beat every 15 frames from frame 8 (0.255 s); a bar every 60 frames. Cuts on bars.

LOOK (the site's own Blueprint system — brand material, so its paper and mono labels are allowed):
- paper #F4F7FB with a 40 px grid at rgba(47,91,234,.07) and an 8 px grid at .032; no grain, no vignette
- ink #0C1B33 for every read word and every structural line; ink2 #4A5B78 for quiet lines
- accent signal #2F5BEA: one word or one shape per shot (SAQL, the timer, the payoff numbers, the mark's tallest bar)
- frames: 1.5 px ink borders, square corners, hard offset shadow 10 px 10 px 0 #0C1B33 (no blur)
- display: Schibsted Grotesk 800, 120–150 px for hero lines (−4% tracking); 64 px for verb titles
- labels: IBM Plex Mono 500, 22 px, +14% tracking, uppercase, signal blue — the site's own eyebrow
- product UI: real screenshots of crmanalytics.imswarnil.com at 1920 × 1080 (2× DPR), never redrawn

OBJECTS: the real question (its words are the site's H1); the site's pages (Q&A, curriculum, lesson in EN/FR/JA/AR, practice exam running, dashboard, /pro); the mark (ink square, three bars frost/tide/signal).

MOTION:
- arrivals expo.out 0.5–0.7 s; camera power2.inOut 0.6–0.9 s; exits power3.in, 40–50% shorter
- words: light grey → ink, 0.08 s apart, no translate
- carries: the outgoing object scales and moves into its place in the next screen with 6 px blur at the fastest frame
- landed titles hold dead still

SHOTS:
- 0.0–3.0  HOOK. "How does SAQL differ from SQL?" inks in word by word on the grid; eyebrow "INTERVIEW QUESTION". SAQL turns signal on the downbeat.
- 3.0–5.5  REVEAL. The question line scales down into the H1 of the real Q&A page, which builds around it; push to the model answer. Whoosh.
- 5.5–9.0  LEARN. Iris from the "Practice exam"/curriculum link into the curriculum page; camera pans down its sections. Title "Learn it".
- 9.0–12.0 IN YOUR LANGUAGE. The same lesson cut on beats: EN → FR → JA → AR; the locale label rolls. Title "in 12 languages".
- 12.0–15.5 PRACTISE. Practice exam running: punch-in on the timer; click sound on a question. Title "Practise the exam".
- 15.5–19.0 TRACK. Dashboard: push to progress. Title "Track every step".
- 19.0–24.5 PAYOFF. Pull back: the screens land on one sheet as a contact grid; the real numbers land on beats with pops: 19 sections · 150 interview questions · 5 practice exams · 12 languages.
- 24.5–27.0 CLAIM. "Learn CRM Analytics the way it's used at work." (site copy, verbatim but for "Salesforce").
- 27.0–30.0 END CARD. The mark draws (square strokes in, bars rise frost → tide → signal on beats), wordmark wipes in, URL crmanalytics.imswarnil.com; quiet line "Free · Nuxt · Neon · Cloudflare · LibreTranslate · Salesforce". Riser into logo hit.

BANNED: dark navy void; glow, particles; gradients; everything centred; fade-and-slide-up on every element; titles drifting after landing; three cards in a row; the logo docked in a corner; invented UI or numbers; crossfades between worlds.

QA: f0 (thumbnail: the question on the grid, readable), f120 (Q&A page carrying the same question), f330 (FR lesson), f420 (exam timer readable), f630 (all screens on one sheet, numbers readable), f780 (claim), f880 (end card: mark, name, URL).
