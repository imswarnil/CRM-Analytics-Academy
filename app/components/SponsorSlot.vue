<script setup lang="ts">
/**
 * A slot from sponsor.imswarnil.com.
 *
 * WHY THE IFRAME DIRECTLY, AND NOT THE `<script>` TAG THE PLATFORM HANDS OUT.
 * That loader finds its own tag with `document.currentScript`, which is null
 * whenever a framework injects the script after parse — so in a Nuxt app it
 * would silently render nothing. Rendering the frame ourselves is the same
 * result with none of the guesswork, and it is one element.
 *
 * The height is reserved up front so the sidebar does not shift when the ad
 * arrives, and the frame is sandboxed: it may run its own scripts and open
 * links, and it has no same-origin access to this page.
 *
 * Nothing about the reader is collected — the platform counts a per-day view
 * and nothing else. That is why this is safe to leave on every page.
 */
const props = withDefaults(
  defineProps<{
    /** The slot's public id, from the platform's studio. */
    slot?: string
    /** Reserved height in px. Match the slot's shape: card 340, banner 120. */
    height?: number
  }>(),
  { slot: 'top-spot', height: 340 }
)

const src = computed(() => `https://sponsor.imswarnil.com/embed/${props.slot}`)
</script>

<template>
  <iframe
    :src="src"
    :style="{ height: `${props.height}px` }"
    title="Sponsored"
    loading="lazy"
    scrolling="no"
    sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
    class="block w-full border-0 bg-transparent"
  />
</template>
