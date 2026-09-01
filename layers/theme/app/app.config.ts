/**
 * The Nuxt UI theme.
 *
 * Stock components, two colour choices and a handful of slot tweaks — no
 * second component system. Indigo reads as instructional rather than
 * corporate and is deliberately not Salesforce blue: a site *about* a
 * Salesforce product should not dress as the product. Emerald carries
 * progress, which on a learning platform is the one thing worth a second
 * colour.
 */
export default defineAppConfig({
  ui: {
    colors: {
      // Blue, not indigo. This is an analytics platform and blue is the
      // colour of the domain — charts, dashboards, the products these lessons
      // are about. `sky` as the secondary keeps the accent inside the same
      // family so a second control never introduces a competing hue.
      primary: 'blue',
      secondary: 'sky',
      // Progress and completion. On a learning platform this is the one thing
      // that earns a colour of its own: "you finished this" has to be legible
      // at a glance in a rail full of grey rows.
      success: 'emerald',
      neutral: 'slate'
    },

    button: {
      slots: {
        base: 'font-semibold'
      },
      compoundVariants: [
        {
          // The chunky press, on filled buttons only.
          //
          // A solid button gets a darker bottom edge drawn *inside* it, and on
          // press the edge collapses while the button drops a pixel — so it
          // reads as a physical key rather than a rectangle that changes
          // colour. It is the single most recognisable thing about how a
          // learning app feels, and it costs one inset shadow.
          //
          // Inset rather than a coloured outer shadow so it works on every
          // colour without a per-colour value, and only on `solid`: on ghost
          // or link buttons there is no surface for an edge to belong to.
          variant: 'solid',
          class: 'shadow-[inset_0_-3px_0_rgb(0_0_0/0.18)] active:translate-y-px active:shadow-[inset_0_-1px_0_rgb(0_0_0/0.18)] transition-[box-shadow,transform] duration-75'
        }
      ]
    },

    card: {
      slots: {
        // Flat by default. On a page that is mostly cards, a shadow on each
        // one is elevation applied to everything, which is elevation applied
        // to nothing.
        root: 'shadow-none'
      }
    },

    progress: {
      slots: {
        // Thicker than stock. On a learning platform the progress bar is not
        // a loading indicator, it is the reward — it should be legible from
        // across the room, not a hairline.
        base: 'rounded-full',
        indicator: 'rounded-full'
      }
    },

    prose: {
      // NSDS's one genuinely good idea, kept: a lesson is read continuously
      // for minutes, so the reading size is a step above the UI size. Set as
      // utilities because prose components emit utilities, and a utility
      // beats layered CSS by design.
      p: { base: 'text-[1.0625rem] leading-[1.75] my-5' },
      ul: { base: 'text-[1.0625rem] leading-[1.75] my-5' },
      ol: { base: 'text-[1.0625rem] leading-[1.75] my-5' },
      blockquote: { base: 'text-[1.0625rem] leading-[1.75]' }
    }
  }
})
