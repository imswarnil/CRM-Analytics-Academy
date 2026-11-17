export default defineAppConfig({
  ui: {
    // The Namaste Salesforce design system (2026-11-17): Salesforce blue as the
    // only signal, 4px controls, 6px cards, hairline borders, near-flat
    // elevation, uppercase tracked labels. Ramps live in main.css: blueprint
    // (the brand ramp), glow (an alias of it) and ink (the warm neutral).
    colors: {
      primary: 'blueprint',
      secondary: 'glow',
      neutral: 'ink'
    },

    // ---- Primitives -------------------------------------------------------
    // Apple-like: pill buttons, hairline borders, soft shadows, quick
    // ease-out colour changes. Hover always tints; press scales slightly.
    button: {
      slots: {
        base: 'rounded-[4px] font-semibold transition-[background-color,color,box-shadow] duration-150 ease-out motion-reduce:transition-none'
      },
      variants: {
        size: {
          xs: { base: 'h-7 px-2.5 text-xs' },
          sm: { base: 'h-8 px-3 text-sm' },
          md: { base: 'h-10 px-4 text-sm' },
          lg: { base: 'h-11 px-5 text-[15px]' },
          xl: { base: 'h-12 px-6 text-base' }
        }
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: 'bg-(--signal) text-white hover:bg-blueprint-600 active:bg-blueprint-700 dark:text-white dark:hover:bg-blueprint-500'
        },
        {
          color: 'neutral',
          variant: 'outline',
          class: 'bg-(--card) text-(--signal) ring-1 ring-inset ring-(--line) hover:bg-(--ice) hover:ring-(--signal)/40'
        },
        {
          color: 'neutral',
          variant: 'solid',
          class: 'bg-(--ink) text-(--paper) hover:bg-(--ink)/85'
        },
        {
          color: 'primary',
          variant: 'outline',
          class: 'text-(--signal) ring-1 ring-inset ring-(--signal)/40 hover:bg-(--signal)/8'
        },
        {
          color: 'primary',
          variant: 'soft',
          class: 'bg-(--signal)/10 text-(--signal) hover:bg-(--signal)/16'
        },
        {
          color: 'neutral',
          variant: 'ghost',
          class: 'text-(--ink2) hover:bg-(--ice)/70 hover:text-(--ink)'
        }
      ]
    },
    badge: {
      slots: {
        base: 'rounded-full font-bold uppercase tracking-[.09em] text-[10px]'
      }
    },
    card: {
      slots: {
        root: 'rounded-[6px] border border-(--line) bg-(--card) ring-0 divide-y divide-(--line)',
        header: 'px-5 py-4',
        body: 'px-5 py-5',
        footer: 'px-5 py-4'
      }
    },
    input: {
      slots: {
        base: 'rounded-[4px] bg-(--card) ring-1 ring-(--line) focus-visible:ring-2 focus-visible:ring-(--signal)'
      }
    },
    textarea: {
      slots: {
        base: 'rounded-[4px] bg-(--card) ring-1 ring-(--line) focus-visible:ring-2 focus-visible:ring-(--signal)'
      }
    },
    select: {
      slots: {
        base: 'rounded-[4px] bg-(--card) ring-1 ring-(--line)',
        content: 'rounded-[6px] ring-1 ring-(--line) shadow-[0_4px_16px_-8px_rgb(0_0_0/.18)]'
      }
    },
    selectMenu: {
      slots: {
        base: 'rounded-[4px] bg-(--card) ring-1 ring-(--line)',
        content: 'rounded-[6px] ring-1 ring-(--line) shadow-[0_4px_16px_-8px_rgb(0_0_0/.18)]'
      }
    },
    dropdownMenu: {
      slots: {
        content: 'rounded-[6px] p-1 ring-1 ring-(--line) bg-(--card) shadow-[0_4px_16px_-8px_rgb(0_0_0/.18)]',
        item: 'rounded-[4px]',
        label: 'text-[11px] font-bold uppercase tracking-[.09em] text-(--label)'
      }
    },
    formField: {
      slots: {
        label: 'text-sm font-semibold text-(--ink)',
        help: 'text-(--ink2)'
      }
    },
    tabs: {
      slots: {
        list: 'rounded-full bg-(--ice) p-1',
        trigger: 'rounded-full font-medium data-[state=active]:bg-(--card) data-[state=active]:text-(--ink) data-[state=active]:shadow-sm',
        indicator: 'hidden'
      }
    },
    modal: {
      slots: {
        content: 'rounded-[8px] ring-1 ring-(--line) bg-(--card) shadow-[0_4px_16px_-8px_rgb(0_0_0/.18)]',
        header: 'border-b border-(--line)'
      }
    },
    slideover: {
      slots: {
        content: 'ring-0 border-l border-(--line) bg-(--paper)'
      }
    },
    accordion: {
      slots: {
        item: 'border-b border-(--line) last:border-b-0',
        trigger: 'font-semibold text-(--ink)'
      }
    },
    progress: {
      slots: {
        base: 'rounded-full h-2 bg-(--line)',
        indicator: 'rounded-full bg-(--signal)'
      }
    },
    alert: {
      slots: {
        root: 'rounded-2xl'
      }
    },
    avatar: {
      slots: {
        root: 'rounded-full'
      }
    },
    skeleton: {
      base: 'rounded-xl bg-(--ice)'
    },
    tooltip: {
      slots: {
        content: 'rounded-lg bg-(--ink) text-(--paper) text-xs ring-0'
      }
    },
    kbd: {
      base: 'rounded-md'
    },

    // ---- Chrome -----------------------------------------------------------
    header: {
      slots: {
        root: 'h-16 bg-(--card)/95 backdrop-blur border-b border-(--line)',
        container: 'max-w-(--ui-container)',
        content: 'bg-(--paper)'
      }
    },
    footer: {
      slots: {
        root: 'bg-(--navy) text-white/80'
      }
    },
    navigationMenu: {
      slots: {
        link: 'font-semibold rounded-[4px]'
      }
    },

    // ---- Page blocks ------------------------------------------------------
    pageHeader: {
      slots: {
        root: 'border-b-0 pt-2 pb-6',
        headline: 'mb-3 text-sm font-semibold text-(--signal)',
        title: 'text-4xl sm:text-5xl font-bold tracking-[-0.03em] text-(--ink)',
        description: 'text-lg text-(--ink2)'
      }
    },
    pageSection: {
      slots: {
        headline: 'text-sm font-semibold text-(--signal)',
        title: 'text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-(--ink)',
        description: 'text-lg text-(--ink2)'
      }
    },
    pageCard: {
      slots: {
        root: 'rounded-2xl',
        leadingIcon: 'size-5 shrink-0 text-(--signal)',
        title: 'text-base font-semibold text-(--ink)',
        description: 'text-[15px] text-(--ink2)'
      },
      variants: {
        variant: {
          outline: { root: 'bg-(--card) ring-0 border border-(--line)' },
          subtle: { root: 'bg-(--card) ring-0 border border-(--line)' }
        }
      }
    },

    // ---- Docs -------------------------------------------------------------
    contentNavigation: {
      slots: {
        trigger: 'font-semibold text-(--ink)',
        link: 'text-sm rounded-lg before:rounded-lg',
        listWithChildren: 'ms-4 border-s border-(--line)'
      },
      variants: {
        active: {
          true: { link: 'text-(--signal) font-semibold before:bg-(--ice)' }
        }
      }
    },
    contentToc: {
      slots: {
        root: 'lg:mx-0 lg:px-0 lg:backdrop-blur-none lg:max-h-none lg:overflow-visible bg-transparent',
        container: 'lg:pt-2 lg:pb-2 border-0',
        trigger: 'text-xs font-semibold text-(--ink2)',
        link: 'py-[0.2rem]'
      }
    },
    contentSurround: {
      slots: {
        link: 'rounded-2xl border border-(--line) bg-(--card) hover:bg-(--card) hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgb(12_27_51/.28)] transition-[transform,box-shadow] duration-200 ease-out motion-reduce:transition-none px-5 py-6',
        linkLeading: 'rounded-xl bg-(--ice) ring-0 group-hover:bg-(--signal)',
        linkLeadingIcon: 'text-(--signal) group-hover:text-white'
      }
    },
    contentSearch: {
      slots: {
        modal: 'rounded-3xl ring-1 ring-(--line) shadow-2xl'
      }
    },

    // ---- Prose (lesson bodies) ---------------------------------------------
    prose: {
      h1: { slots: { base: 'font-bold tracking-[-0.03em]' } },
      h2: { slots: { base: 'font-semibold tracking-[-0.02em] mt-12' } },
      h3: { slots: { base: 'font-semibold tracking-[-0.015em]' } },
      // Reading size per Apple's HIG: 18px body, 19px from tablet up, with
      // generous leading. Lists and table cells follow the paragraphs.
      p: { base: 'text-[1.125rem] sm:text-[1.1875rem] leading-[1.75] text-(--ink)' },
      li: { base: 'text-[1.125rem] sm:text-[1.1875rem] leading-[1.7]' },
      td: { base: 'text-base border-(--line) first:border-s-0 last:border-e-0' },
      a: { base: 'border-(--signal)/30' },
      code: {
        variants: {
          color: {
            neutral: 'rounded-md border border-(--line) bg-(--ice) text-(--ink)'
          }
        }
      },
      pre: {
        slots: {
          root: 'my-6',
          base: 'rounded-2xl border border-(--line) bg-[#07122A] text-[#DDEBFA]',
          header: 'rounded-t-2xl border border-b-0 border-(--line) bg-(--ice) font-mono text-xs'
        }
      },
      table: {
        slots: {
          root: 'rounded-2xl border border-(--line)',
          base: ''
        }
      },
      th: { base: 'bg-(--ice) text-xs font-semibold text-(--ink) border-(--line) first:border-s-0 border-t-0 last:border-e-0' },
      blockquote: { base: 'rounded-e-xl border-s-[3px] border-(--signal) bg-(--ice) not-italic ps-4 py-2 pe-3 text-(--ink)' },
      callout: {
        slots: {
          base: 'rounded-2xl border'
        }
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
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/imswarnil/CRM-Analytics-Academy',
      'target': '_blank',
      'aria-label': 'GitHub'
    }]
  },
  footer: {
    credits: `© ${new Date().getFullYear()} CRM Analytics Academy`,
    colorMode: false,
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/imswarnil/CRM-Analytics-Academy',
      'target': '_blank',
      'aria-label': 'CRM Analytics Academy on GitHub'
    }, {
      'icon': 'i-simple-icons-youtube',
      'to': 'https://www.youtube.com/@crmanalyticsacademy',
      'target': '_blank',
      'aria-label': 'CRM Analytics Academy on YouTube'
    }]
  },
  toc: {
    title: 'Table of Contents',
    bottom: {
      title: 'Community',
      edit: 'https://github.com/imswarnil/CRM-Analytics-Academy/edit/main/content',
      links: [{
        icon: 'i-simple-icons-youtube',
        label: 'Watch on YouTube',
        to: 'https://www.youtube.com/@crmanalyticsacademy',
        target: '_blank'
      }, {
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
