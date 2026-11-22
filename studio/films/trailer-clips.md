# Channel trailer: your photo, your details, your clip

The trailer (`trailer.json`) runs fine without these: each slot shows a placeholder.
Record them, drop them in, rebuild, and they replace the placeholders. The music ducks
under your voice, and a scene grows to fit a longer clip (to whole bars, so the cuts stay on the beat).

```
studio/workspace/01-camera/trailer/photo.jpg               (.png works too)
studio/workspace/01-camera/trailer/clip-02-subscribe.mov   (.mp4 / .m4v work too)
node studio/build-film.mjs trailer
```

## The about-me scene (photo | who you are)

**Photo:** a portrait, at least 1200 × 1500 px, face in the upper half; it is cropped to a
tall card (640 × 780) on the left. Plain or blurred background reads best on navy.

**Your details:** fill these in `studio/films/trailer.json`, scene `about` → `props`. Anything
left empty shows as a dashed placeholder.

```json
"role": "CRM Analytics consultant",         one short line
"years": 6,                                  counts up to "6+  years of experience"
"companies": ["Company A", "Company B"],     chips under WORKED WITH (2 to 4 read best)
"stats": [ … ]                               optional: replace the two numbers, e.g.
  [{ "value": 6, "suffix": "+", "label": "years of experience" },
   { "value": 5, "label": "Salesforce certifications" }]
```

Use only company names you are free to mention publicly.

## The clip: setup

- Landscape 16:9, 1080p or 4K, any frame rate. Phone is fine: back camera, locked exposure.
- Eye level, lens at your eyes, you in the centre.
- Soft light from the front (a window in front of you works). Tidy background, your desk is fine.
- Clip-on or USB mic close to you. Room quiet, **no music** in the recording.
- Start recording, wait one second, talk, hold one second, stop. Trimming is automatic.

## Clip: subscribe (≈ 4 to 6 s), just before the end screen

> "Subscribe, open lesson one, and build it with me. See you inside."

Point toward the right of the frame on "subscribe": the end screen's subscribe button
appears on the right. End on a smile and hold.

## Optional

- A B-roll clip of your hands on the keyboard, or of a real CRM Analytics dashboard on your
  screen (no customer data), can replace any scene later: ask for it and the slot is added.
