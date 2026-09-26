export default defineAppConfig({
  ui: {
    // Every ramp comes from the Im Design System (design.imswarnil.com); see
    // the block comment in app/assets/css/main.css for the source values.
    //
    // BLUE LEADS, RED ACCENTS. The design system's own accent is red (signal,
    // #f22f46) and this site ran on it until now. It doesn't survive being the
    // dominant colour of a *teaching* site: the curriculum's whole argument is
    // that red means "look at this number, something is wrong", and a red
    // header, red nav and red buttons spend that meaning before a lesson can
    // use it. So the system's blue (cobalt, #175cd3) carries structure --
    // header, nav, links, buttons -- and signal drops to `secondary`, used
    // sparingly for emphasis, the logo mark and anything genuinely urgent.
    //
    // The four statuses stay named explicitly. `info` is the same cobalt as
    // primary, which is deliberate: it is the system's own info hex, and an
    // informational callout on a blue-brand site reading as brand-coloured is
    // correct. Warning/error/success stay clearly apart from both.
    colors: {
      primary: 'cobalt',
      secondary: 'signal',
      neutral: 'graphite',
      success: 'verdant',
      warning: 'ochre',
      error: 'crimson',
      info: 'cobalt'
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
