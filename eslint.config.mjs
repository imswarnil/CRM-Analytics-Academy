// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    // The SFDX scaffold ships its own eslint.config.js expecting Salesforce's
    // LWC plugins, which are not dependencies of this site. Left in scope, the
    // root lint tries to load it and dies before checking anything. The
    // Salesforce project lints itself, from inside its own folder.
    // studio/**/*.jsx is Adobe ExtendScript (ES3, globals like `app` that
    // only exist inside After Effects, Premiere and Photoshop), not web code.
    ignores: ['salesforce/**', 'docs/**', 'cms/**', 'studio/**/*.jsx', 'studio/out/**', 'business/**']
  }
)
