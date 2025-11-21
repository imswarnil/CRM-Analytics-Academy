// app.config.ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',  // mapped to your Tailwind / Nuxt UI theme
      neutral: 'slate'
    }
  },
  seo: {
    siteName: 'CRM Analytics Academy'
  },
  header: {
    title: 'CRM Analytics Academy',
    to: '/',
    logo: {
      alt: 'CRM Analytics Academy',
      // TODO: replace these with your real SVG/PNG paths
      light: '/logo-light.svg',
      dark: '/logo-dark.svg'
    },
    search: true,
    colorMode: true,
    links: [
      {
        icon: 'i-simple-icons-github',
        to: 'https://github.com/your-org/your-repo',
        target: '_blank',
        'aria-label': 'GitHub'
      }
    ]
  },
  footer: {
    credits: `Built with Nuxt UI • © ${new Date().getFullYear()} CRM Analytics Academy`,
    colorMode: false,
    links: [
      {
        icon: 'i-simple-icons-youtube',
        to: 'https://www.youtube.com/@crm-analytics-academy',
        target: '_blank',
        'aria-label': 'YouTube'
      },
      {
        icon: 'i-simple-icons-x',
        to: 'https://x.com/your-handle',
        target: '_blank',
        'aria-label': 'X (Twitter)'
      },
      {
        icon: 'i-simple-icons-github',
        to: 'https://github.com/your-org/your-repo',
        target: '_blank',
        'aria-label': 'GitHub'
      }
    ]
  },
  toc: {
    title: 'On this page',
    bottom: {
      title: 'Community & links',
      // TODO: point this to your real repo/content directory
      edit: 'https://github.com/your-org/your-repo/edit/main/content',
      links: [
        {
          icon: 'i-lucide-star',
          label: 'Star on GitHub',
          to: 'https://github.com/your-org/your-repo',
          target: '_blank'
        },
        {
          icon: 'i-lucide-message-circle',
          label: 'Join the community',
          to: 'https://discord.gg/your-server',
          target: '_blank'
        }
      ]
    }
  }
})
