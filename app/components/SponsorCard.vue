<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <NuxtLink
    :to="localePath('/sponsor')"
    class="sponsor"
  >
    <Icon
      name="i-lucide-heart"
      class="sponsor__icon"
    />

    <span class="sponsor__text">
      <span class="sponsor__title">{{ t('sponsorCard.title') }}</span>
      <span class="sponsor__desc">{{ t('sponsorCard.desc') }}</span>
    </span>

    <Icon
      name="i-lucide-arrow-right"
      class="sponsor__arrow"
    />
  </NuxtLink>
</template>

<style scoped lang="scss">
.sponsor {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-3);
  border: 1px solid var(--c-line);
  border-radius: var(--r-md);
  background: var(--c-brand-faint);
  text-decoration: none;
  transition: border-color var(--dur-fast) var(--ease-out), background-color var(--dur-fast) var(--ease-out);

  &:hover {
    border-color: var(--c-brand);
    background: var(--c-brand-soft);

    .sponsor__arrow { transform: translateX(2px); }
  }
}

.sponsor__icon {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  color: var(--coral);
}

.sponsor__text {
  // min-width:0 is what lets the two truncating children actually truncate
  // inside a flex row rather than forcing the card wider.
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.sponsor__title,
.sponsor__desc {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sponsor__title {
  font-size: var(--t-tiny);
  font-weight: 650;
  color: var(--c-text);
}

.sponsor__desc {
  font-size: var(--t-micro);
  color: var(--c-text-soft);
}

.sponsor__arrow {
  flex-shrink: 0;
  width: 0.85rem;
  height: 0.85rem;
  color: var(--c-text-faint);
  transition: transform var(--dur-fast) var(--ease-out);
}

:global([dir="rtl"]) .sponsor__arrow {
  transform: scaleX(-1);
}
</style>
