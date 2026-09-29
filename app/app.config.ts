export default defineAppConfig({
  ui: {
    // cobalt leads, lagoon is the cooler second blue, mist is the blue-tinted
    // neutral. Ramps live in main.css. Statuses stay on Nuxt UI's defaults:
    // they are state, not brand, which is why a red delta still reads as bad.
    colors: {
      primary: 'cobalt',
      secondary: 'lagoon',
      neutral: 'mist'
    },

    // ---- Primitives -------------------------------------------------------
    button: {
      slots: {
        base: 'font-semibold rounded-lg transition-[background-color,border-color,color,box-shadow] duration-150'
      },
      compoundVariants: [{
        color: 'primary',
        variant: 'solid',
        class: 'shadow-[0_1px_0_0_rgb(255_255_255/0.18)_inset,0_1px_2px_0_rgb(15_30_80/0.18)]'
      }]
    },
    badge: {
      slots: {
        base: 'font-semibold rounded-md'
      }
    },
    card: {
      slots: {
        root: 'rounded-xl',
        header: 'px-5 py-4 sm:px-6',
        body: 'px-5 py-5 sm:p-6',
        footer: 'px-5 py-4 sm:px-6'
      },
      variants: {
        variant: {
          outline: {
            root: 'bg-default ring ring-default divide-y divide-default'
          }
        }
      }
    },
    input: {
      slots: {
        base: 'rounded-lg'
      }
    },
    textarea: {
      slots: {
        base: 'rounded-lg'
      }
    },
    select: {
      slots: {
        base: 'rounded-lg'
      }
    },
    selectMenu: {
      slots: {
        base: 'rounded-lg'
      }
    },
    formField: {
      slots: {
        label: 'font-semibold text-highlighted',
        help: 'text-muted'
      }
    },
    tabs: {
      slots: {
        list: 'rounded-lg',
        trigger: 'font-semibold'
      }
    },

    // ---- Chrome -----------------------------------------------------------
    header: {
      slots: {
        root: 'bg-default/85 backdrop-blur-md border-b border-default',
        title: 'font-bold text-lg tracking-tight'
      }
    },
    footer: {
      slots: {
        root: 'border-t border-default bg-default',
        left: 'text-sm text-muted'
      }
    },
    navigationMenu: {
      slots: {
        link: 'font-medium'
      }
    },

    // ---- Page blocks ------------------------------------------------------
    pageHero: {
      slots: {
        title: 'text-4xl sm:text-6xl font-bold tracking-tighter text-highlighted text-balance',
        description: 'text-lg sm:text-xl text-muted text-pretty',
        headline: 'mb-4'
      }
    },
    pageHeader: {
      slots: {
        root: 'border-b-0 pt-2 pb-6',
        headline: 'mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-primary',
        title: 'text-3xl sm:text-4xl font-bold tracking-tight text-balance',
        description: 'text-lg text-muted text-pretty'
      }
    },
    pageSection: {
      slots: {
        headline: 'text-xs font-semibold uppercase tracking-[0.08em] text-primary',
        title: 'text-3xl sm:text-4xl font-bold tracking-tight text-highlighted text-balance',
        description: 'text-lg text-muted text-pretty'
      }
    },
    pageCard: {
      slots: {
        root: 'rounded-xl',
        leadingIcon: 'size-5 shrink-0 text-primary',
        title: 'text-base font-semibold text-highlighted tracking-tight',
        description: 'text-[15px] text-muted text-pretty'
      },
      variants: {
        variant: {
          outline: {
            root: 'bg-default ring ring-default'
          },
          subtle: {
            root: 'bg-default ring ring-default'
          }
        }
      }
    },
    pageCTA: {
      slots: {
        root: 'rounded-2xl',
        title: 'font-bold tracking-tight text-balance'
      }
    },

    // ---- Docs -------------------------------------------------------------
    contentNavigation: {
      slots: {
        trigger: 'font-semibold text-highlighted',
        link: 'text-[0.9rem] before:rounded-lg',
        listWithChildren: 'ms-[1.1rem] border-s border-default'
      },
      variants: {
        active: {
          true: {
            link: 'text-primary font-semibold before:bg-primary/8'
          }
        }
      }
    },
    // The TOC root carries a mobile bar's worth of utilities (negative margin
    // cancelled by padding, a translucent backdrop, its own scroll region).
    // On desktop they only eat the rail's width, so they are undone here.
    contentToc: {
      slots: {
        root: 'lg:mx-0 lg:px-0 lg:backdrop-blur-none lg:max-h-none lg:overflow-visible',
        container: 'lg:pt-7 lg:pb-6',
        trigger: 'text-xs uppercase tracking-[0.08em] text-muted',
        link: 'py-[0.2rem]'
      }
    },
    contentSurround: {
      slots: {
        link: 'rounded-xl bg-default hover:bg-default hover:ring-primary/40 hover:border-primary/40 px-5 py-6',
        linkLeading: 'bg-primary/8 ring-primary/20 group-hover:bg-primary group-hover:ring-primary',
        linkLeadingIcon: 'text-primary group-hover:text-inverted'
      }
    },

    // ---- Prose (markdown bodies) -------------------------------------------
    prose: {
      h1: {
        slots: {
          base: 'tracking-tighter'
        }
      },
      h2: {
        slots: {
          base: 'tracking-tight pt-8 border-t border-default mt-10'
        }
      },
      h3: {
        slots: {
          base: 'tracking-tight'
        }
      },
      p: {
        base: 'leading-7.5'
      },
      a: {
        base: 'border-primary/30'
      },
      code: {
        variants: {
          color: {
            neutral: 'border border-default bg-elevated/70 text-highlighted'
          }
        }
      },
      pre: {
        slots: {
          base: 'rounded-lg bg-muted',
          header: 'rounded-t-lg'
        }
      },
      table: {
        slots: {
          root: 'rounded-lg ring ring-default',
          base: 'rounded-lg'
        }
      },
      th: {
        base: 'bg-muted text-highlighted text-xs uppercase tracking-[0.04em] border-default first:border-s-0 border-t-0 last:border-e-0'
      },
      td: {
        base: 'border-default first:border-s-0 last:border-e-0 [tr:last-child_&]:border-b-0'
      },
      blockquote: {
        base: 'border-s-4 border-primary/40 bg-primary/5 not-italic ps-4 py-2 pe-3 rounded-e-lg text-toned'
      },
      callout: {
        slots: {
          base: 'rounded-lg'
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
