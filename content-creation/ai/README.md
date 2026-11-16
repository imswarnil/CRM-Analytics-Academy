# AI lesson videos — HyperFrames + HeyGen

Illustrated lesson videos in the Academy's design, presented by your HeyGen
avatar (digital twin) in your cloned voice. Runs on this machine only.

```bash
pnpm video content/en/01.foundations/01.what-a-dataset-is.md            # project, no presenter (free)
pnpm video content/en/01.foundations/01.what-a-dataset-is.md --avatar   # + HeyGen avatar per scene (spends credits)
npx hyperframes preview content-creation/ai/projects/what-a-dataset-is  # look, tweak
pnpm video content-creation/ai/projects/what-a-dataset-is/script.json --avatar --render   # → .mp4
```

1. **Script.** Each `##` of the lesson is a scene: its heading, up to four bullet
   points on screen, its prose as narration. `script.json` is written into the
   project; edit the narration there and pass it back in.
2. **Avatar.** `--avatar` renders one HeyGen clip per scene (`heygen.mjs`, green
   background) and times each scene to your real speaking length. Clips already
   downloaded are reused, so re-running is free.
3. **Project.** A HyperFrames project: `index.html` + `compositions/scene-N.html`,
   Blueprint colours, the avatar as a round picture-in-picture bottom-right.
4. **Publish.** Upload the MP4 to YouTube (@crmanalyticsacademy), then put
   `video: { id }` on the English lesson. Mark it `access: youtube` to make the
   lesson a subscriber lesson on the site.

Setup, once: in HeyGen create your Instant Avatar and voice clone, then put
`HEYGEN_API_KEY`, `HEYGEN_AVATAR_ID`, `HEYGEN_VOICE_ID` in `.env`. Install
ffmpeg (`brew install ffmpeg`) so scenes are timed from the real clip length.

Recorded lessons (you on camera) still go through OBS + `pnpm session` + Final
Cut Pro — see `../README.md`. This pipeline is for the generated ones.
