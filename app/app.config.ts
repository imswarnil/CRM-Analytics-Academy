export default defineAppConfig({
  ui: {
    // Blueprint (docs/design-handoff-blueprint). Square corners, 1.5px ink
    // borders, hard offset shadows, mono labels. The ramps live in main.css:
    // blueprint (primary), glow (the cyan accent) and ink (the neutral).
    colors: {
      primary: 'blueprint',
      secondary: 'glow',
      neutral: 'ink'
    },

    // ---- Primitives -------------------------------------------------------
    button: {
      slots: {
        // The press: one pixel down-right while the hard shadow shrinks by the
        // same pixel, so the shadow's outer edge never moves and nothing around
        // the button shifts. Only transform and box-shadow animate (120ms,
        // ease-out); colours change at once. Reduced motion gets the same one-pixel
        // state change with no transition.
        base: 'rounded-none font-bold border-[1.5px] border-transparent transition-[transform,box-shadow] duration-[120ms] ease-out motion-reduce:transition-none'
      },
      variants: {
        size: {
          xs: { base: 'h-7 px-2 text-xs' },
          sm: { base: 'h-9 px-3 text-sm' },
          md: { base: 'h-11 px-4 text-sm' },
          lg: { base: 'h-13 px-6 text-[15px]' },
          xl: { base: 'h-14 px-7 text-base' }
        }
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: 'border-(--ink) bg-(--signal) text-white shadow-[5px_5px_0_var(--ink)] hover:bg-blueprint-900 active:translate-x-px active:translate-y-px active:shadow-[4px_4px_0_var(--ink)] dark:text-(--on) dark:hover:bg-blueprint-300'
        },
        {
          color: 'neutral',
          variant: 'outline',
          class: 'border-(--ink) bg-(--card) text-(--ink) ring-0 hover:bg-(--ice) active:translate-x-px active:translate-y-px'
        },
        {
          color: 'neutral',
          variant: 'solid',
          class: 'border-(--ink) bg-(--ink) text-(--paper) hover:bg-(--signal) hover:text-white active:translate-x-px active:translate-y-px'
        },
        {
          color: 'primary',
          variant: 'outline',
          class: 'border-(--signal) text-(--signal) ring-0 hover:bg-(--ice) active:translate-x-px active:translate-y-px'
        },
        {
          color: 'primary',
          variant: 'soft',
          class: 'bg-(--ice) text-(--signal) border-(--line) hover:border-(--ink)'
        },
        {
          color: 'neutral',
          variant: 'ghost',
          class: 'text-(--ink) hover:bg-(--ice)'
        }
      ]
    },
    badge: {
      slots: {
        base: 'rounded-none font-mono uppercase tracking-[.08em] text-[10px] font-medium'
      }
    },
    card: {
      slots: {
        root: 'rounded-none border-[1.5px] border-(--ink) bg-(--card) ring-0 divide-y-[1.5px] divide-(--ink)',
        header: 'bg-(--ice) px-5 py-4',
        body: 'px-5 py-5',
        footer: 'px-5 py-4'
      }
    },
    input: {
      slots: {
        base: 'rounded-none bg-(--card) ring-[1.5px] ring-(--ink) focus-visible:ring-(--signal)'
      }
    },
    textarea: {
      slots: {
        base: 'rounded-none bg-(--card) ring-[1.5px] ring-(--ink) focus-visible:ring-(--signal)'
      }
    },
    select: {
      slots: {
        base: 'rounded-none bg-(--card) ring-[1.5px] ring-(--ink)',
        content: 'rounded-none ring-[1.5px] ring-(--ink) shadow-[5px_5px_0_var(--ink)]'
      }
    },
    selectMenu: {
      slots: {
        base: 'rounded-none bg-(--card) ring-[1.5px] ring-(--ink)',
        content: 'rounded-none ring-[1.5px] ring-(--ink) shadow-[5px_5px_0_var(--ink)]'
      }
    },
    dropdownMenu: {
      slots: {
        content: 'rounded-none ring-[1.5px] ring-(--ink) bg-(--card) shadow-[5px_5px_0_var(--ink)]',
        item: 'rounded-none',
        label: 'font-mono text-[10px] uppercase tracking-[.1em]'
      }
    },
    formField: {
      slots: {
        label: 'font-mono text-[11px] uppercase tracking-[.1em] text-(--ink2)',
        help: 'text-(--ink2)'
      }
    },
    tabs: {
      slots: {
        list: 'rounded-none border-[1.5px] border-(--ink) p-0 bg-(--card)',
        trigger: 'rounded-none font-bold data-[state=active]:bg-(--ink) data-[state=active]:text-(--paper)',
        indicator: 'hidden'
      }
    },
    modal: {
      slots: {
        content: 'rounded-none border-[1.5px] border-(--ink) ring-0 bg-(--card) shadow-[10px_10px_0_var(--signal)]',
        header: 'border-b-[1.5px] border-(--ink) bg-(--ice)'
      }
    },
    slideover: {
      slots: {
        content: 'rounded-none border-l-[1.5px] border-(--ink) ring-0 bg-(--paper)'
      }
    },
    accordion: {
      slots: {
        item: 'border-b border-dashed border-(--line) last:border-b-0',
        trigger: 'font-bold text-(--ink)'
      }
    },
    progress: {
      slots: {
        base: 'rounded-none border-[1.5px] border-(--ink) h-3 bg-(--card)',
        indicator: 'rounded-none bg-[repeating-linear-gradient(135deg,var(--color-blueprint-500)_0_6px,var(--color-blueprint-400)_6px_12px)]'
      }
    },
    alert: {
      slots: {
        root: 'rounded-none border-[1.5px] border-(--ink)'
      }
    },
    avatar: {
      slots: {
        root: 'rounded-none border-[1.5px] border-(--ink)'
      }
    },
    skeleton: {
      base: 'rounded-none bg-(--ice)'
    },
    tooltip: {
      slots: {
        content: 'rounded-none bg-(--ink) text-(--paper) font-mono text-[11px] ring-0'
      }
    },
    kbd: {
      base: 'rounded-none font-mono'
    },

    // ---- Chrome -----------------------------------------------------------
    header: {
      slots: {
        root: 'h-16 bg-[color-mix(in_oklab,var(--paper)_88%,transparent)] backdrop-blur-md border-b-[1.5px] border-(--ink)',
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
        link: 'font-semibold rounded-none'
      }
    },

    // ---- Page blocks ------------------------------------------------------
    pageHeader: {
      slots: {
        root: 'border-b-0 pt-2 pb-6',
        headline: 'mb-3 font-mono text-[11px] uppercase tracking-[.14em] text-(--signal)',
        title: 'text-4xl sm:text-5xl font-black tracking-[-0.04em] text-(--ink)',
        description: 'text-lg text-(--ink2)'
      }
    },
    pageSection: {
      slots: {
        headline: 'font-mono text-[11px] uppercase tracking-[.14em] text-(--signal)',
        title: 'text-3xl sm:text-5xl font-extrabold tracking-[-0.04em] text-(--ink)',
        description: 'text-lg text-(--ink2)'
      }
    },
    pageCard: {
      slots: {
        root: 'rounded-none',
        leadingIcon: 'size-5 shrink-0 text-(--signal)',
        title: 'text-base font-extrabold text-(--ink)',
        description: 'text-[15px] text-(--ink2)'
      },
      variants: {
        variant: {
          outline: { root: 'bg-(--card) ring-0 border-[1.5px] border-(--ink)' },
          subtle: { root: 'bg-(--card) ring-0 border-[1.5px] border-(--ink)' }
        }
      }
    },

    // ---- Docs -------------------------------------------------------------
    contentNavigation: {
      slots: {
        trigger: 'font-bold text-(--ink)',
        link: 'text-sm rounded-none before:rounded-none',
        listWithChildren: 'ms-4 border-s border-(--line)'
      },
      variants: {
        active: {
          true: { link: 'text-(--signal) font-bold before:bg-(--ice)' }
        }
      }
    },
    contentToc: {
      slots: {
        root: 'lg:mx-0 lg:px-0 lg:backdrop-blur-none lg:max-h-none lg:overflow-visible bg-transparent',
        container: 'lg:pt-2 lg:pb-2 border-0',
        trigger: 'font-mono text-[10px] uppercase tracking-[.12em] text-(--ink2)',
        link: 'py-[0.2rem]'
      }
    },
    contentSurround: {
      slots: {
        link: 'rounded-none border-[1.5px] border-(--ink) bg-(--card) hover:bg-(--card) hover:shadow-[4px_4px_0_var(--ink)] hover:-translate-x-px hover:-translate-y-px transition-[transform,box-shadow] duration-[160ms] ease-out motion-reduce:transition-none px-5 py-6',
        linkLeading: 'rounded-none bg-(--ice) ring-[1.5px] ring-(--ink) group-hover:bg-(--signal)',
        linkLeadingIcon: 'text-(--signal) group-hover:text-white'
      }
    },
    contentSearch: {
      slots: {
        modal: 'rounded-none border-[1.5px] border-(--ink) ring-0 shadow-[10px_10px_0_var(--signal)]'
      }
    },

    // ---- Prose (lesson bodies) ---------------------------------------------
    prose: {
      h1: { slots: { base: 'font-black tracking-[-0.045em]' } },
      h2: { slots: { base: 'font-extrabold tracking-[-0.03em] pt-8 border-t border-dashed border-(--line) mt-10' } },
      h3: { slots: { base: 'font-extrabold tracking-[-0.02em]' } },
      p: { base: 'leading-7.5 text-(--ink)' },
      a: { base: 'border-(--signal)/30' },
      code: {
        variants: {
          color: {
            neutral: 'rounded-none border border-(--line) bg-(--ice) text-(--ink)'
          }
        }
      },
      pre: {
        slots: {
          root: 'my-6',
          base: 'rounded-none border-[1.5px] border-(--ink) bg-[#07122A] text-[#DDEBFA]',
          header: 'rounded-none border-[1.5px] border-b-0 border-(--ink) bg-(--ice) font-mono text-xs'
        }
      },
      table: {
        slots: {
          root: 'rounded-none border-[1.5px] border-(--ink)',
          base: 'rounded-none'
        }
      },
      th: { base: 'bg-(--ice) font-mono text-[10px] uppercase tracking-[.1em] text-(--ink) border-(--line) first:border-s-0 border-t-0 last:border-e-0' },
      td: { base: 'border-(--line) first:border-s-0 last:border-e-0' },
      blockquote: { base: 'border-s-[3px] border-(--signal) bg-(--ice) not-italic ps-4 py-2 pe-3 text-(--ink)' },
      callout: {
        slots: {
          base: 'rounded-none border-dashed border-[1.5px]'
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
    credits: `© ${new Date().getFullYear()} CRM Analytics Academy`,
    colorMode: false,
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/imswarnil/CRM-Analytics-Academy',
      'target': '_blank',
      'aria-label': 'CRM Analytics Academy on GitHub'
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
