/**
 * Re-scope Paste's dark theme tokens onto this site's `.dark` class.
 *
 * Paste ships its dark theme as a separate full token set rather than as a set
 * of overrides, scoped to its own `body[data-theme="twilio-dark"]` selector.
 * This site switches themes with a `.dark` class on <html>, so the tokens are
 * rewritten once here into app/assets/css/paste-dark.css rather than being
 * imported and then fought with specificity.
 *
 *   node scripts/paste-dark.mjs      # after upgrading @twilio-paste/design-tokens
 */
import { readFileSync, writeFileSync } from 'node:fs'

const SRC = 'node_modules/@twilio-paste/design-tokens/dist/themes/twilio-dark/tokens.custom-properties.css'
const OUT = 'app/assets/css/paste-dark.css'

const body = /\{([\s\S]*)\}/.exec(readFileSync(SRC, 'utf8'))?.[1] ?? ''
const decls = body.split('\n').map(l => l.trim()).filter(l => l.startsWith('--'))

if (!decls.length) {
  console.error(`No tokens found in ${SRC} — has the package layout changed?`)
  process.exit(1)
}

writeFileSync(OUT, `/* Generated from @twilio-paste/design-tokens twilio-dark, re-scoped from
   Paste's own selector to this site's \`.dark\` class so the colour-mode
   toggle drives it. Regenerate with scripts/paste-dark.mjs after a token
   upgrade; do not hand-edit. */
.dark {
  ${decls.join('\n  ')}
}
`)

console.log(`Wrote ${decls.length} dark tokens → ${OUT}`)
