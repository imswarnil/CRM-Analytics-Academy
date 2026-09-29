// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    // The SFDX scaffold ships its own eslint.config.js expecting Salesforce's
    // LWC plugins, which are not dependencies of this site. Left in scope, the
    // root lint tries to load it and dies before checking anything. The
    // Salesforce project lints itself, from inside its own folder.
    ignores: ['salesforce/**', 'docs/**', 'cms/**']
  }
)
