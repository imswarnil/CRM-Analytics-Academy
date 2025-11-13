// app.config.ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'slate'
    }
  },

  // High-level site meta you can reuse everywhere
  site: {
    name: 'CRM Analytics Academy',
    shortName: 'CRM Analytics',
    url: 'https://crmanalytics.imswarnil.com',
    description:
      'Free, open-source Salesforce CRM Analytics (Einstein Analytics / Tableau CRM / Wave Analytics) training. Learn datasets, lenses, dashboards, SAQL, dataflows/recipes, bindings, RLS, Einstein Discovery, and embedding in Lightning.',
    language: 'en',
    locale: 'en-IN',
    author: {
      name: 'Swarnil Singhai',
      handle: '@imswarnil',
      url: 'https://imswarnil.com'
    },
    brand: {
      owner: 'Imswarnil',
      tagline: 'Master Salesforce CRM Analytics from scratch.'
    }
  },

  // Centralised SEO defaults (your index.md can still override per-page)
  seo: {
    defaultTitle:
      'CRM Analytics Academy – Learn Salesforce CRM Analytics (Einstein Analytics / Tableau CRM)',
    titleTemplate: '%s · CRM Analytics Academy',
    description:
      'Learn Salesforce CRM Analytics from zero to advanced with a structured, open-source academy. Build real dashboards, write SAQL, design dataflows/recipes, implement RLS, and embed analytics in Lightning apps.',
    siteName: 'CRM Analytics Academy',
    canonicalHost: 'https://crmanalytics.imswarnil.com',
    twitter: {
      card: 'summary_large_image',
      site: '@imswarnil',
      creator: '@imswarnil'
    },
    openGraph: {
      type: 'website',
      image: '/og/default-og.png', // create this later
      imageAlt: 'CRM Analytics Academy – Salesforce Analytics training'
    }
  },

  // Repo + docs metadata you can use for “Edit this page”, footer links, etc.
  repo: {
    provider: 'github',
    owner: 'imswarnil',
    name: 'CRM-Analytics-Academy',
    branch: 'main',
    baseUrl: 'https://github.com/imswarnil/CRM-Analytics-Academy',
    docsDir: 'content',
    issuesUrl: 'https://github.com/imswarnil/CRM-Analytics-Academy/issues',
    discussionsUrl:
      'https://github.com/imswarnil/CRM-Analytics-Academy/discussions'
  },

  // Global links (good for footer, nav, JSON-LD, etc.)
  links: {
    homepage: 'https://crmanalytics.imswarnil.com',
    github: 'https://github.com/imswarnil/CRM-Analytics-Academy',
    mainSite: 'https://imswarnil.com',
    youtube: 'https://www.youtube.com/@Imswarnil',
    twitter: 'https://x.com/imswarnil',
    linkedin: 'https://www.linkedin.com/in/imswarnil'
  },

  // Academy-specific metadata (can be reused for JSON-LD later)
  academy: {
    domain: 'Salesforce CRM Analytics',
    tagline: 'From first dataset to production dashboards.',
    tracks: [
      {
        id: 'foundations',
        label: 'Foundations',
        level: 'Beginner',
        description:
          'Platform basics, terminology, licenses, datasets, lenses, and first dashboards.'
      },
      {
        id: 'dashboards-saql',
        label: 'Dashboards & SAQL',
        level: 'Intermediate',
        description:
          'Dashboard design, SAQL queries, compare tables, UX patterns, and interactivity.'
      },
      {
        id: 'recipes-governance',
        label: 'Recipes, RLS & Governance',
        level: 'Advanced',
        description:
          'Dataflows/recipes, row-level security, performance, deployment patterns, and Einstein Discovery.'
      }
    ],
    stats: {
      plannedModules: 25,
      handsOnLabs: 15,
      completelyFree: true
    }
  }
})
