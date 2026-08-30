export default defineAppConfig({
  seo: {
    siteName: 'CRM Analytics Academy'
  },

  header: {
    title: '',
    to: '/',
    search: true,
    colorMode: true
  },

  footer: {
    credits: `Built by the community • © ${new Date().getFullYear()}`,
    colorMode: false,
    // These were the nuxt/ui template's own Discord/X/GitHub links, pointing at
    // nuxt.com rather than at this project.
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
