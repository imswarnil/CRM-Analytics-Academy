# Lesson videos

One video per lesson, in Swarnil's voice, in English. Every other language gets
the **same video** with captions and a transcript — never a separate recording.

```
lesson.md ─► script ─► voice ─► avatar ─► motion ─► edit ─► (Premiere) ─► upload ─► captions
             beats     your     HeyGen    HyperFrames  edit.json          Mux        Mux EN captions
                       clone    or none   project      PREMIERE.md        mux: id    → content-transcripts/en
                                                                                     → translate.yml (11 langs)
                                                                                     → deploy (player + transcript)
```

Everything here is **owner-run and local**. The site build never calls it, and
no cloud model or service is called unless you select it: HeyGen runs only
when it is the chosen provider (in `video/video.config.json` or with
`--provider=heygen`). There is **no default text-to-speech** — the voice stage
refuses to run until you pick your own voice.

## The commands

```bash
pnpm video script   /saql/functions                 # narration beats from the lesson
pnpm video script   /saql/functions --with-claude   # + prompt.md to polish it in Claude Code
pnpm video voice    /saql/functions --provider=heygen          # your HeyGen voice clone
pnpm video voice    /saql/functions --provider=local-clone     # your local clone (command in config)
pnpm video voice    /saql/functions --provider=file --file=~/Narration/saql.wav
pnpm video avatar   /saql/functions --provider=heygen|none
pnpm video motion   /saql/functions                 # HyperFrames project (not rendered)
pnpm video edit     /saql/functions                 # edit.json + captions.srt + PREMIERE.md
pnpm video upload   /saql/functions [--test]        # final.mp4 → Mux, writes `mux:` in the English lesson
pnpm video captions /saql/functions                 # Mux English captions → content-transcripts/en/
pnpm video status   /saql/functions                 # which stage files exist
pnpm video all      /saql/functions --voice=heygen --avatar=none   # script → … → edit in one go
pnpm video test                                      # offline checks (VTT round trip, ::pro blocks)
```

`pnpm mux:lesson <route> <video.mp4>` still works; it is `pnpm video upload --file=…`.

## Where things go

Each lesson has a work directory, `.data/video/<route with -- for />/` (gitignored):

| Stage | Writes | Notes |
|---|---|---|
| script | `script.json`, `script.md`, `prompt.md` | Deterministic. A `walkthrough` lesson uses its shots; otherwise `##` sections, paragraphs merged to `maxBeatWords`, code blocks as on-screen beats. A free lesson's `::pro` blocks are left out. Edit `script.json` by hand or with Claude Code — later stages read it. |
| voice | `voice/beat-NNN.wav`, `voice.wav`, `voice.json` | Per-beat audio, so the edit knows exactly where each beat starts. Silent beats (code) are padded. With `file`, beat timing is estimated over your one recording. |
| avatar | `avatar.mp4`, `avatar.json` | HeyGen lip-syncs to your `voice.wav` (`useVoiceStage: true`) or speaks the script itself. `--resume=<video_id>` picks up an interrupted render. |
| motion | `motion/` | A HyperFrames composition: title card, chapter cards, on-screen bullets, code panels, lower third, end card, timed to the beats, in the Blueprint brand kit from `content-assets/`. Open the folder in Claude Code and follow its `CLAUDE.md` (`/hyperframes`, `npx hyperframes check`, preview, then render to `motion.mp4`). |
| edit | `edit.json`, `captions.srt`, `PREMIERE.md` | Tracks: V1 motion, V2 screen recordings (`recordings/beat-NNN.mov` pins one to a beat), V3 avatar picture-in-picture, V4 brand overlays, A1 narration; one marker per beat. Paste `PREMIERE.md` into Claude Code with the Premiere Pro MCP connected; it assembles, shows you the timeline, and exports `final.mp4` after your OK. |
| upload | `upload.json`, `mux:` in `content/en/…md` | Free lesson → public playback; `access: pro` → signed. Requests Mux auto-generated English captions. `--no-write --policy=signed` for a video inside a `::pro` block (prints `:::lesson-video{mux="…"}`). |
| captions | `content-transcripts/en/<route>.vtt`, `content-transcripts/videos.json` | Committed. Read-only against Mux. |

## Captions and transcripts — automatic after upload

1. Mux generates English captions for the asset (a few minutes after upload).
2. `pnpm video captions <route>` — or the **Refresh captions from Mux** workflow
   (daily, or Actions → Run workflow) — writes `content-transcripts/en/<route>.vtt`.
   Fix a caption in the Mux dashboard and the next run picks it up.
3. `translate.yml` translates the cue text into the 11 locales
   (`content-transcripts/<locale>/…vtt`). Only cue text is translated; timings,
   cue ids and headers are copied byte for byte.
4. The build (`scripts/gate-content.mjs`) publishes a free lesson's transcripts
   to `/transcripts/<locale>/<route>.vtt`; a Pro lesson's stay in the Worker and
   are served by `/api/transcript/…` only to Pro readers.
5. The player turns on the reader's language as captions (English and every
   other language selectable) and shows the transcript under the video —
   click a line to seek, search, copy. Free lessons also put the transcript in
   their `VideoObject` JSON-LD.

## Configuration and secrets

`video/video.config.json` holds choices and ids (no secrets). Secrets come from
the environment — put them in `.env` (gitignored):

| Variable | Used by | Where to get it |
|---|---|---|
| `HEYGEN_API_KEY` | voice/avatar `heygen` | app.heygen.com → Settings → API |
| `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET` | upload, captions (else the `mux` CLI login) | dashboard.mux.com → Settings → Access Tokens; also as repository secrets for the captions workflow |
| `MUX_SIGNING_KEY_ID`, `MUX_SIGNING_KEY_SECRET` | captions of signed (Pro) videos; the Worker | `mux signing-keys create`; the same values as on the Worker |

Ids in the config: `voice.heygen.voiceId` (your cloned voice; `mode: "clone"`
uses HeyGen's professional-clone endpoint), `avatar.heygen.avatarId`,
`voice.localClone.command` (e.g. `python3 ~/voice-clone/speak.py --text-file {textFile} --out {out}`).

Tools: `ffmpeg`/`ffprobe` (`brew install ffmpeg`) for audio; the Mux CLI
(`mux login`) if you do not use API tokens; Premiere Pro with its MCP server for
the edit; Node + `npx hyperframes` for motion.

## A video inside a Pro block

```md
::pro
## The worked example
Paragraphs…

:::lesson-video{mux="PLAYBACK_ID"}
:::
::
```

Upload it with `pnpm video upload <route> --file=clip.mp4 --policy=signed --no-write`.
Components nested inside `::pro` take three colons; the build fails on two.
