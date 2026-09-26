export default defineAppConfig({
  ui: {
    // Every ramp comes from the Swarnil design system's colour foundation:
    // azure (blue, hue 240) leads, iris (violet, 285) supports, ink is a
    // faintly blue-tinted neutral so dark mode reads as night rather than as
    // soot. All three sit on ONE shared lightness ladder, so azure-500 and
    // iris-500 carry the same weight and are interchangeable as a mark.
    //
    // Blue is the whole theme here, and that is a teaching decision as much as
    // a brand one: this curriculum spends red on "this number is wrong, look at
    // it", so red cannot also be the furniture. Structure, emphasis, nav, links
    // and icons all draw from the blue ramp at different steps -- 600 for text
    // on light, 500 for marks, 400 for dark mode, 100/50 for washes.
    //
    // Statuses stay on Nuxt UI's defaults, which is what this site ran on
    // before: green, amber, red, blue. They are state, not brand, and keeping
    // them conventional is why a red delta still reads as bad news.
    colors: {
      primary: 'azure',
      secondary: 'iris',
      neutral: 'ink'
    },
    footer: {
      slots: {
        root: 'border-t border-default',
        left: 'text-sm text-muted'
      }
    }
  },
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
    credits: `Built with Nuxt UI • © ${new Date().getFullYear()}`,
    colorMode: false,
    links: [{
      'icon': 'i-simple-icons-discord',
      'to': 'https://go.nuxt.com/discord',
      'target': '_blank',
      'aria-label': 'Nuxt on Discord'
    }, {
      'icon': 'i-simple-icons-x',
      'to': 'https://go.nuxt.com/x',
      'target': '_blank',
      'aria-label': 'Nuxt on X'
    }, {
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/nuxt/ui',
      'target': '_blank',
      'aria-label': 'Nuxt UI on GitHub'
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
