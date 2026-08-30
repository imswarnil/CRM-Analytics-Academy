<script setup lang="ts">
/**
 * On-this-page. Replaces UContentToc.
 *
 * The active-heading highlight uses IntersectionObserver against a band near
 * the top of the viewport rather than scroll maths: it does not run on every
 * scroll frame, and it needs to know nothing about header height, zoom or
 * sticky offsets.
 */
interface TocLink {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

const props = defineProps<{
  links: TocLink[]
  title?: string
}>()

// Two levels is the useful depth; three turns the rail into a second document.
const flat = computed(() => {
  const out: TocLink[] = []
  for (const link of props.links ?? []) {
    out.push(link)
    for (const child of link.children ?? []) out.push(child)
  }
  return out
})

const activeId = ref<string>('')

onMounted(() => {
  const ids = flat.value.map(l => l.id)
  const seen = new Map<string, boolean>()

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) seen.set(entry.target.id, entry.isIntersecting)
      // First heading currently inside the band wins. Keeping the previous
      // value when none match stops the rail going blank between headings.
      const first = ids.find(id => seen.get(id))
      if (first) activeId.value = first
    },
    // Top 15% of the viewport: a heading becomes current once it reaches
    // reading position, not when it first peeks in from the bottom.
    { rootMargin: '0px 0px -85% 0px', threshold: 0 }
  )

  for (const id of ids) {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  }

  onScopeDispose(() => observer.disconnect())
})
</script>

<template>
  <nav
    v-if="flat.length"
    class="toc"
    aria-labelledby="toc-title"
  >
    <p
      id="toc-title"
      class="toc__title"
    >
      {{ title || 'On this page' }}
    </p>

    <ul class="toc__list">
      <li
        v-for="link in flat"
        :key="link.id"
      >
        <a
          :href="`#${link.id}`"
          class="toc__link"
          :class="[`toc__link--d${link.depth}`, { 'is-active': activeId === link.id }]"
          :aria-current="activeId === link.id ? 'location' : undefined"
        >{{ link.text }}</a>
      </li>
    </ul>

    <slot name="bottom" />
  </nav>
</template>

<style scoped lang="scss">
.toc__title {
  margin: 0 0 var(--s-3);
  font-family: var(--font-display);
  font-size: var(--t-micro);
  letter-spacing: var(--tr-caps);
  text-transform: uppercase;
  color: var(--c-text-faint);
}

.toc__list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-inline-start: 1px solid var(--c-line);
}

.toc__link {
  position: relative;
  display: block;
  padding: var(--s-1) var(--s-3);
  font-size: var(--t-tiny);
  line-height: 1.45;
  color: var(--c-text-soft);
  text-decoration: none;
  transition: color var(--dur-fast) var(--ease-out);

  &:hover { color: var(--c-text); }

  // The marker replaces the track segment rather than sitting beside it, so
  // the rail reads as one continuous line with the current position lit.
  &::before {
    content: "";
    position: absolute;
    inset-block: 0.15rem;
    inset-inline-start: -1px;
    width: 2px;
    background: transparent;
    transition: background-color var(--dur-fast) var(--ease-out);
  }

  &.is-active {
    color: var(--c-brand-text);
    font-weight: 650;

    &::before { background: var(--c-brand); }
  }
}

.toc__link--d3 {
  padding-inline-start: var(--s-5);
  font-size: var(--t-micro);
}
</style>
