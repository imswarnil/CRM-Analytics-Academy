import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// Resolved from this file rather than written as `~/assets/...`, because `~`
// points at the consuming app's directory, not the layer's.
const layerDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  // The single stylesheet entry for the whole site. Registering it here rather
  // than in the root config is what makes the theme one removable unit.
  css: [join(layerDir, 'app/assets/css/index.css')]
})
