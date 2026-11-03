/**
 * Vulnerability scanners probe every site for WordPress, PHP, dotfiles and
 * admin panels this site has never had. Those paths are not static files, so
 * each one reaches the Worker; answering them here, first and without
 * rendering anything, keeps them from costing CPU time. Real pages never
 * match: no route here ends in .php or starts with a dot.
 */
const PROBE = /(^\/(wp-|wordpress|xmlrpc|phpmyadmin|pma|cgi-bin|vendor\/|\.env|\.git|\.aws|\.ssh|\.vscode|\.DS_Store|server-status|actuator|boaform|HNAP1|owa\/|ecp\/|autodiscover))|\.(php\d?|asp|aspx|jsp|cgi|env|ini|bak|sql|yml|yaml|log|old|swp)$/i

export default defineEventHandler((event) => {
  const path = event.path.split('?')[0] ?? '/'
  if (!PROBE.test(path)) return
  setResponseHeaders(event, { 'cache-control': 'public, max-age=86400', 'content-type': 'text/plain' })
  setResponseStatus(event, 404)
  return 'Not found'
})
