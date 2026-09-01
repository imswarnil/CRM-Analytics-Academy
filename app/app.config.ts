/**
 * Site configuration — what the chrome says, not how it looks.
 *
 * There is deliberately no `ui` key here. Component styling lives in
 * layers/nsds/app/app.config.ts, so that the design system is one removable
 * unit rather than a set of overrides scattered between a layer and the app.
 * Anything added here under `ui` would silently win over the theme.
 */
export default defineAppConfig({
  seo: {
    siteName: 'CRM Analytics Academy'
  },
  header: {
    title: '',
    to: '/',
    logo: {
      alt: '',
      light: '',
      dark: ''
    },
    search: true,
    colorMode: true,
    links: [{
      icon: 'i-lucide-heart',
      label: 'Sponsor this project',
      to: 'https://github.com/sponsors/crm-analytics-academy',
      target: '_blank',
      color: 'primary',
      variant: 'subtle',
      class: 'max-sm:[&_span:last-child]:hidden'
    }, {
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/imswarnil/CRM-Analytics-Academy',
      'target': '_blank',
      'aria-label': 'GitHub'
    }]
  },
  footer: {
    credits: `CRM Analytics Academy • Free and open source • © ${new Date().getFullYear()}`,
    colorMode: false,
    // These used to point at Nuxt's own Discord, X and GitHub — template
    // leftovers that sent every visitor who clicked them to another project.
    // Only URLs that already exist elsewhere in this repo are used here.
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/imswarnil/CRM-Analytics-Academy',
      'target': '_blank',
      'aria-label': 'CRM Analytics Academy on GitHub'
    }, {
      'icon': 'i-lucide-heart',
      'to': 'https://github.com/sponsors/crm-analytics-academy',
      'target': '_blank',
      'aria-label': 'Sponsor this project'
    }]
  },
  toc: {
    title: 'Table of Contents',
    bottom: {
      title: 'Community',
      edit: 'https://github.com/imswarnil/CRM-Analytics-Academy/edit/main/content',
      links: [{
        icon: 'i-lucide-star',
        label: 'Star on GitHub',
        to: 'https://github.com/imswarnil/CRM-Analytics-Academy',
        target: '_blank'
      }, {
        icon: 'i-lucide-git-pull-request',
        label: 'Contribute',
        to: '/contribute'
      }]
    }
  }
})
