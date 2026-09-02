/**
 * GET /mcp — a human/agent-readable descriptor. The MCP protocol itself runs
 * over POST (see mcp.post.ts); this exists so that opening the endpoint in a
 * browser, or a client probing with GET, learns where to go instead of a 404.
 */
export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'application/json')
  return {
    name: 'crm-analytics-academy',
    version: '1.0.0',
    description: 'MCP server for the CRM Analytics Academy curriculum. Read-only tools: list_curriculum, search_lessons, get_lesson.',
    transport: 'streamable-http',
    endpoint: 'https://crmanalytics.imswarnil.com/mcp',
    usage: 'Send JSON-RPC 2.0 requests via POST to this URL (methods: initialize, tools/list, tools/call).',
    documentation: 'https://crmanalytics.imswarnil.com/ask'
  }
})
