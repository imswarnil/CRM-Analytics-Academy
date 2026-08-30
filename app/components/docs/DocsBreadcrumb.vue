<script setup lang="ts">
defineProps<{
  items: { label: string, to?: string, icon?: string }[]
}>()
</script>

<template>
  <nav
    class="crumbs"
    aria-label="Breadcrumb"
  >
    <ol class="crumbs__list">
      <li
        v-for="(item, i) in items"
        :key="i"
        class="crumbs__item"
      >
        <NuxtLink
          v-if="item.to && i < items.length - 1"
          :to="item.to"
          class="crumbs__link"
        >
          <Icon
            v-if="item.icon"
            :name="item.icon"
            class="crumbs__icon"
          />
          {{ item.label }}
        </NuxtLink>
        <!-- The last crumb is the current page: a link to here is noise. -->
        <span
          v-else
          class="crumbs__current"
          aria-current="page"
        >{{ item.label }}</span>

        <Icon
          v-if="i < items.length - 1"
          name="i-lucide-chevron-right"
          class="crumbs__sep"
          aria-hidden="true"
        />
      </li>
    </ol>
  </nav>
</template>

<style scoped lang="scss">
.crumbs__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-1);
  list-style: none;
  margin: 0;
  padding: 0;
}

.crumbs__item {
  display: inline-flex;
  align-items: center;
  gap: var(--s-1);
  font-size: var(--t-tiny);
}

.crumbs__link {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  color: var(--c-text-soft);
  text-decoration: none;

  &:hover {
    color: var(--c-brand-text);
    text-decoration: underline;
  }
}

.crumbs__current {
  color: var(--c-text);
  font-weight: 600;
}

.crumbs__icon {
  width: 0.95rem;
  height: 0.95rem;
}

.crumbs__sep {
  width: 0.9rem;
  height: 0.9rem;
  color: var(--c-line-strong);
  flex-shrink: 0;
}

:global([dir="rtl"]) .crumbs__sep {
  transform: scaleX(-1);
}
</style>
