# NS Design System tokens — vendored

Source: `nsds-design-system` v3.0.0 (git 9526e20), `src/tokens/*.css`.

Vendored rather than installed. The package is not published to npm, and a
`file:` dependency pointing outside this repository would resolve locally and
then fail in GitHub Actions, where only this repo is checked out.

Only the **token** layer is copied — 58 KB of custom properties. The full
`dist/nsds.tailwind.css` is 716 KB because it carries the component classes
too, and this site gets its components from Nuxt UI. Taking both would mean two
button implementations fighting over the same markup.

The four Figtree woff2 in `public/fonts/` are byte-identical to the NS ones,
so the type is already the system's; nothing was copied for fonts.

## Updating

Re-copy `src/tokens/*.css` from the design system and note the new version
above. Do not hand-edit these files — local changes belong in `main.css`,
which loads after them and can override any token.
