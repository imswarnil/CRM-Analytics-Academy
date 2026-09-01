/**
 * The Nuxt UI theme, tuned to the Academy "Neo Brutal" design system.
 *
 * Stock components, one custom palette and a handful of slot tweaks — no
 * second component system. `salesforce` is the blue ramp defined in
 * tokens.css with #0176D3 at 500: this site now deliberately dresses in the
 * domain's own colour, with an ink line around anything interactive.
 */
export default defineAppConfig({
  ui: {
    colors: {
      // Salesforce blue — the design system's primary. `sky` keeps the
      // secondary accent inside the same family.
      primary: 'salesforce',
      secondary: 'sky',
      // Progress and completion. On a learning platform this is the one thing
      // that earns a colour of its own: "you finished this" has to be legible
      // at a glance in a rail full of grey rows.
      success: 'emerald',
      neutral: 'slate'
    },

    button: {
      slots: {
        // Every button in the design system is a pill set in the display
        // face. The weight is what lets a bordered white button read as a
        // button at all.
        base: 'font-display font-bold rounded-full'
      },
      compoundVariants: [
        {
          // Solid buttons wear the ink line and press down a pixel — the
          // neo-brutal read of a physical key, at the cost of one border.
          variant: 'solid',
          class: 'border-2 border-(--nb-ink) active:translate-y-px transition-transform duration-75'
        },
        {
          // Bordered white pill — the design system's secondary action.
          variant: 'outline',
          class: 'border-2 border-(--nb-ink) bg-(--nb-surface) text-highlighted ring-0 active:translate-y-px transition-transform duration-75'
        }
      ]
    },

    badge: {
      slots: {
        base: 'font-display font-bold'
      }
    },

    card: {
      slots: {
        // The standard nb-card: 3px of ink, 16px corner, flat. Elevation on
        // a page of cards is elevation applied to nothing.
        root: 'rounded-2xl ring-[3px] ring-(--nb-ink) shadow-none'
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
      // A lesson is read continuously for minutes, so the reading size is a
      // step above the UI size. Set as utilities because prose components
      // emit utilities, and a utility beats layered CSS by design.
      p: { base: 'text-[1.0625rem] leading-[1.75] my-5' },
      ul: { base: 'text-[1.0625rem] leading-[1.75] my-5' },
      ol: { base: 'text-[1.0625rem] leading-[1.75] my-5' },
      blockquote: { base: 'text-[1.0625rem] leading-[1.75]' }
    }
  }
})
