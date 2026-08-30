export default defineAppConfig({
  ui: {
    // `salesforce` and `cloud` are defined in app/assets/css/main.css. The names
    // are deliberately kept from the previous palette so the ~15 existing
    // bg-salesforce-*/text-salesforce-* call sites across the pages repaint
    // from the token layer alone. `grape` is an alias of the brand ramp: a
    // second competing hue is an anti-pattern here, and the neo-* accents
    // cover everything the purple was doing.
    colors: {
      primary: 'salesforce',
      secondary: 'grape',
      neutral: 'cloud'
    },

    // -----------------------------------------------------------------------
    // Buttons. Every interactive element on the site resolves to this: ink
    // border, chunky corner, hard offset shadow, and the one press animation.
    // `transition-[transform,box-shadow,background-color,color]` restores the
    // colour transition that Nuxt UI's own base sets and that neo-press-sm's
    // shorthand would otherwise drop.
    // -----------------------------------------------------------------------
    button: {
      slots: {
        base: [
          'font-heading font-normal uppercase tracking-[0.04em]',
          'border-neo rounded-neo-sm neo-press-sm',
          'transition-[transform,box-shadow,background-color,color] duration-100',
          'justify-center'
        ],
        label: 'truncate'
      },
      variants: {
        size: {
          xs: { base: 'px-2.5 py-1 text-[11px] min-h-7 gap-1.5' },
          sm: { base: 'px-3 py-1.5 text-xs min-h-8 gap-1.5' },
          md: { base: 'px-4 py-2 text-xs min-h-10 gap-2' },
          lg: { base: 'px-5 py-2.5 text-sm min-h-11 gap-2' },
          xl: { base: 'px-6 py-3 text-base min-h-12 gap-2.5' }
        },
        // Icon-only buttons are the header's whole control strip. Square them
        // off at a real touch target rather than letting the horizontal
        // padding above collapse them into slivers.
        square: {
          true: 'p-0 aspect-square'
        }
      },
      compoundVariants: [
        { square: true, size: 'xs', class: 'size-7 min-h-7' },
        { square: true, size: 'sm', class: 'size-9 min-h-9' },
        { square: true, size: 'md', class: 'size-11 min-h-11' },
        { square: true, size: 'lg', class: 'size-11 min-h-11' },
        { square: true, size: 'xl', class: 'size-12 min-h-12' },
        // Ghost is the header/footer icon style: transparent until hovered,
        // but still a drawn box — a borderless button would read as a stray
        // glyph against everything else on the page.
        {
          variant: 'ghost',
          class: 'bg-default hover:bg-primary hover:text-inverted'
        },
        {
          color: 'neutral',
          variant: 'ghost',
          class: 'text-highlighted bg-default hover:bg-primary hover:text-inverted'
        },
        {
          color: 'neutral',
          variant: 'outline',
          class: 'bg-default text-highlighted ring-0 hover:bg-elevated'
        },
        {
          color: 'primary',
          variant: 'outline',
          class: 'bg-default text-primary ring-0 hover:bg-primary hover:text-inverted'
        },
        {
          color: 'primary',
          variant: 'subtle',
          class: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100'
        },
        // Inline text links are the one exception — a border and a shadow
        // around a word inside a sentence is noise, not emphasis.
        {
          variant: 'link',
          class: 'border-0 shadow-none hover:shadow-none hover:translate-none active:translate-none p-0 min-h-0 normal-case tracking-normal font-sans font-semibold underline underline-offset-4 decoration-2'
        }
      ]
    },

    // -----------------------------------------------------------------------
    // Badges. Flat accent fill, ink outline, display-face caps. These are the
    // site's smallest unit of colour and the only place besides the hero where
    // uppercase is allowed.
    // -----------------------------------------------------------------------
    badge: {
      slots: {
        base: 'border-neo rounded-neo-sm font-heading font-normal uppercase tracking-[0.1em] shadow-neo-xs'
      },
      variants: {
        size: {
          xs: 'px-1.5 py-0.5 text-[10px]',
          sm: 'px-2 py-0.5 text-[10px]',
          md: 'px-2.5 py-1 text-[11px]',
          lg: 'px-3 py-1 text-xs',
          xl: 'px-3.5 py-1.5 text-sm'
        }
      },
      compoundVariants: [
        { color: 'neutral', variant: 'solid', class: 'bg-default text-highlighted' },
        { color: 'neutral', variant: 'subtle', class: 'bg-elevated text-highlighted' },
        { color: 'primary', variant: 'subtle', class: 'bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-50' },
        { color: 'success', variant: 'subtle', class: 'bg-neo-teal text-ink' },
        { color: 'warning', variant: 'subtle', class: 'bg-neo-amber text-ink' },
        { color: 'error', variant: 'subtle', class: 'bg-neo-magenta text-white' }
      ]
    },

    // Dividers are structural here, not decorative: 2px of ink, full stop.
    separator: {
      slots: {
        border: 'border-(--ui-border)'
      },
      variants: {
        size: {
          xs: { border: 'border-t-2' },
          sm: { border: 'border-t-2' },
          md: { border: 'border-t-[3px]' },
          lg: { border: 'border-t-[3px]' },
          xl: { border: 'border-t-4' }
        }
      }
    },

    // Floating surfaces: same card treatment as everything else, so a menu
    // reads as a piece of paper that landed on top rather than a soft popover.
    dropdownMenu: {
      slots: {
        content: 'border-neo rounded-neo shadow-neo bg-default',
        item: 'rounded-neo-sm font-medium data-highlighted:bg-primary data-highlighted:text-inverted'
      }
    },

    tooltip: {
      slots: {
        content: 'border-neo rounded-neo-sm shadow-neo-sm bg-default text-highlighted font-medium'
      }
    },

    popover: {
      slots: {
        content: 'border-neo rounded-neo shadow-neo'
      }
    },

    modal: {
      slots: {
        content: 'border-neo rounded-neo shadow-neo-lg'
      }
    },

    toast: {
      slots: {
        root: 'border-neo rounded-neo shadow-neo'
      }
    },

    header: {
      slots: {
        root: 'border-b-[3px] border-(--ui-border) bg-default',
        container: 'max-w-(--ui-container)'
      }
    },

    footer: {
      slots: {
        root: 'border-t-[3px] border-(--ui-border) bg-primary-800 text-primary-50',
        left: 'text-sm text-primary-100'
      }
    },

    footerColumns: {
      slots: {
        label: 'font-heading uppercase tracking-[0.1em] text-[11px] text-primary-200',
        link: 'text-primary-50/80 hover:text-white font-medium'
      }
    },

    breadcrumb: {
      slots: {
        link: 'font-medium',
        separatorIcon: 'text-muted'
      }
    },

    // Docs sidebar. The active lesson is a solid blue block with an ink shadow
    // — the single loudest thing in the rail, so position in a 60-lesson tree
    // is readable at a glance.
    contentNavigation: {
      slots: {
        link: 'rounded-neo-sm font-medium transition-[background-color,color,box-shadow] duration-100',
        linkLeadingIcon: 'shrink-0',
        listWithChildren: 'ms-4 border-s-2 border-(--ui-border) ps-3'
      },
      variants: {
        active: {
          true: {
            link: 'bg-primary border-neo shadow-neo-xs font-semibold'
          },
          false: {
            link: 'text-default hover:bg-primary-50 hover:text-primary-700 hover:before:bg-transparent dark:hover:bg-primary-900 dark:hover:text-primary-50'
          }
        }
      },
      // The active link's colour is set by a compoundVariant upstream
      // ({ color: 'primary', variant: 'pill', active: true } -> text-primary),
      // and compoundVariants resolve after plain variants — so white text has
      // to be stated at the same specificity or the label comes out blue on a
      // blue fill, i.e. invisible.
      compoundVariants: [{
        color: 'primary',
        variant: 'pill',
        active: true,
        class: {
          link: 'text-inverted',
          linkLeadingIcon: 'text-inverted group-data-[state=open]:text-inverted'
        }
      }]
    },

    contentToc: {
      slots: {
        root: 'border-neo rounded-neo bg-default shadow-neo-sm p-3',
        title: 'font-heading uppercase tracking-[0.1em] text-[11px]',
        link: 'rounded-neo-sm font-medium'
      },
      variants: {
        active: {
          true: { link: 'text-primary font-semibold' }
        }
      }
    },

    contentSurround: {
      slots: {
        link: 'border-neo rounded-neo bg-default neo-press-sm p-4'
      }
    },

    contentSearchButton: {
      slots: {
        base: 'border-neo rounded-neo-sm bg-default shadow-neo-xs font-medium normal-case tracking-normal font-sans'
      }
    },

    pageHeader: {
      slots: {
        title: 'font-heading',
        headline: 'font-heading uppercase tracking-[0.12em] text-[11px] text-primary'
      }
    },

    pageLinks: {
      slots: {
        title: 'font-heading uppercase tracking-[0.1em] text-[11px]',
        link: 'font-medium'
      }
    },

    error: {
      slots: {
        statusCode: 'font-heading text-primary',
        statusMessage: 'font-heading'
      }
    }
  },

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
