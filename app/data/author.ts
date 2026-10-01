/**
 * Who builds this, as facts — copied from Swarnil's own profile repository
 * (github.com/imswarnil/imswarnil, scripts/content.py), the single place he
 * maintains them. Edit there first, then here; never embellish in between.
 * Used by the home page's author section and the About page (and its Person
 * JSON-LD).
 */
export interface AuthorRole {
  years: string
  title: string
  company: string
  place: string
  current: boolean
}

export interface AuthorProject {
  name: string
  blurb: string
  stack: string
  url: string
  status: 'live' | 'building'
}

export const AUTHOR = {
  name: 'Swarnil Singhai',
  initials: 'SS',
  avatar: 'https://github.com/imswarnil.png',
  role: 'Salesforce Engineer',
  company: 'Education First',
  place: 'Budapest, Hungary',
  lede: 'Salesforce engineer, seven years deep in go-to-market: pipeline, funnel, CPQ, forecasting and product-usage data turned into dashboards people actually open. Off the clock I build one corner of the internet end to end: the site, the theme it runs on, the design system under the theme, and the courses on top.',
  summary: 'Seven years turning raw pipeline, funnel, CPQ, product-usage and service data into decision-ready dashboards — used daily across the full go-to-market motion, from top-of-funnel through post-sale expansion.',
  highlights: [
    'Owned GTM analytics for Twilio\'s Sales Operations team — the single CRM Analytics point of contact for AEs, Sales leadership, CPQ, product-usage and service data.',
    'Shipped Unified CPQ Insights — configuration and pricing in one view, prioritised and adopted team-wide.',
    'Built lead and funnel-velocity dashboards that exposed staged drop-off and stalled deals, and forecast/pipeline dashboards that replaced manual prep before forecast calls.',
    'Migrated Qlik Sense reporting to CRM Analytics at Education First without breaking continuity for Sales, Marketing and Customer Service.'
  ],
  roles: [
    { years: '2026 —', title: 'Salesforce Engineer', company: 'Education First', place: 'Budapest, Hungary', current: true },
    { years: '2022 – 26', title: 'Salesforce GTM Engineer', company: 'Twilio', place: 'Bangalore, India', current: false },
    { years: '2021 – 22', title: 'CRM Analytics Consultant', company: 'Cognizant', place: 'Bangalore, India', current: false },
    { years: '2018 – 21', title: 'Salesforce Engineer', company: 'Accenture', place: 'Bangalore, India', current: false }
  ] as AuthorRole[],
  education: { degree: 'B.E. Computer Science', school: 'LNCT Group of Colleges (RGPV), Bhopal', years: '2013 – 2017' },
  skills: [
    { group: 'GTM', items: ['Quote-to-Cash', 'CPQ', 'Pipeline Management', 'Forecasting', 'Funnel Analytics', 'Lead Velocity', 'Cross-Sell', 'Product Usage', 'Sales Operations', 'Revenue Ops', 'AE Productivity', 'Adoption'] },
    { group: 'Salesforce', items: ['CRM Analytics', 'SAQL', 'Einstein Discovery', 'Apex', 'Sales Cloud', 'Service Cloud', 'Data Modelling', 'Data Preparation', 'Recipes & Dataflows', 'Bindings', 'Automation', 'Salesforce Admin'] },
    { group: 'Data', items: ['SQL', 'Snowflake', 'JSON', 'Qlik Sense migration', 'KPI Definition', 'Dashboard Design', 'Python'] },
    { group: 'Web', items: ['JavaScript', 'TypeScript', 'React', 'Vue', 'Next.js', 'Handlebars', 'Tailwind 4', 'Sass', 'Design Tokens', 'C'] },
    { group: 'Platform', items: ['Ghost', 'Jekyll', 'Supabase', 'Postgres', 'Neon', 'Vercel', 'Cloudflare Workers', 'GitHub Pages', 'OBS Studio', 'Git'] }
  ],
  social: [
    { key: 'site', icon: 'i-lucide-globe', label: 'imswarnil.com', url: 'https://imswarnil.com' },
    { key: 'linkedin', icon: 'i-simple-icons-linkedin', label: 'in/imswarnil', url: 'https://www.linkedin.com/in/imswarnil/' },
    { key: 'github', icon: 'i-simple-icons-github', label: 'imswarnil', url: 'https://github.com/imswarnil' },
    { key: 'x', icon: 'i-simple-icons-x', label: '@imswarnil', url: 'https://x.com/imswarnil' },
    { key: 'instagram', icon: 'i-simple-icons-instagram', label: '@imswarnil', url: 'https://instagram.com/imswarnil' },
    { key: 'index', icon: 'i-lucide-layout-grid', label: 'the index', url: 'https://imswarnil.github.io' }
  ],
  projects: [
    { name: 'imswarnil.com', blurb: 'The main desk: writing, videos, courses, projects and travel. Self-hosted Ghost.', stack: 'Ghost 6 · Im Design System', url: 'https://imswarnil.com', status: 'live' },
    { name: 'Im Design System', blurb: 'Tailwind 4 for Ghost themes, laid out on a twelve-column grid you can see.', stack: 'Tailwind 4 · Ghost 6 · Geist', url: 'https://design.imswarnil.com', status: 'live' },
    { name: 'Swarnil Broadcast Kit', blurb: 'A native OBS Studio plugin. Twenty sources, six filters and a 22-scene show.', stack: 'C · libobs · MIT', url: 'https://obs.imswarnil.com', status: 'live' },
    { name: 'Trailblazer', blurb: 'A Jekyll theme for Salesforce developers: lesson player, printable resume, cert wall.', stack: 'SCSS · MIT', url: 'https://trailblazer.imswarnil.com', status: 'live' },
    { name: 'Swarnil Icons', blurb: '61 icons on a 24 grid, drawn from scratch. No dependencies.', stack: 'SVG · MIT', url: 'https://icons.imswarnil.com', status: 'live' },
    { name: 'Job Seekers Guide', blurb: 'Notes and tooling for people job-hunting in the Salesforce ecosystem.', stack: 'Vue', url: 'https://jobseekers.imswarnil.com', status: 'live' },
    { name: 'Namaste Salesforce', blurb: 'A Salesforce teaching platform — Ghost theme out front, Next.js LMS behind it.', stack: 'Handlebars · Next.js', url: 'https://github.com/imswarnil/Namaste-Salesforce', status: 'building' },
    { name: 'CreatorKit', blurb: 'A React and Tailwind UI kit for people who publish. One recipe, two renderers.', stack: 'React · Tailwind · Turborepo', url: 'https://github.com/imswarnil/CreatorKit', status: 'building' }
  ] as AuthorProject[]
}
