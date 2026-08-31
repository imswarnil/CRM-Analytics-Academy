<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const year = new Date().getFullYear()

const columns = computed(() => [
  {
    label: t('footer.curriculum'),
    links: [
      { label: t('home.modules.foundations.title'), to: localePath('/foundations') },
      { label: t('nav.showcase'), to: localePath('/showcase') },
      { label: t('nav.resources'), to: localePath('/resources') },
      { label: t('nav.datasets'), to: localePath('/datasets') }
    ]
  },
  {
    label: t('footer.project'),
    links: [
      { label: t('nav.about'), to: localePath('/about') },
      { label: t('nav.contribute'), to: localePath('/contribute') },
      { label: t('nav.roadmap'), to: localePath('/roadmap') },
      { label: t('nav.changelog'), to: localePath('/changelog') }
    ]
  },
  {
    label: t('footer.legal'),
    links: [
      { label: t('nav.privacy'), to: localePath('/privacy') },
      { label: t('nav.terms'), to: localePath('/terms') },
      { label: t('nav.sponsor'), to: localePath('/sponsor') }
    ]
  }
])
</script>

<template>
  <footer class="ftr">
    <div class="container">
      <div class="ftr__top">
        <div class="ftr__brand">
          <NuxtLink
            :to="localePath('/')"
            class="ftr__logo"
          >
            <AppLogo />
          </NuxtLink>
          <p class="ftr__tagline">
            {{ t('footer.tagline') }}
          </p>
          <div class="ftr__socials">
            <a
              class="ftr__social"
              href="https://github.com/imswarnil/CRM-Analytics-Academy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Icon name="i-simple-icons-github" />
            </a>
            <a
              class="ftr__social"
              href="https://github.com/sponsors/crm-analytics-academy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sponsor this project"
            >
              <Icon name="i-lucide-heart" />
            </a>
          </div>
        </div>

        <div
          v-for="col in columns"
          :key="col.label"
          class="ftr__col"
        >
          <p class="ftr__col-title">
            {{ col.label }}
          </p>
          <ul class="ftr__list">
            <li
              v-for="link in col.links"
              :key="link.to"
            >
              <NuxtLink
                :to="link.to"
                class="ftr__link"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="ftr__base">
        <p>© {{ year }} CRM Analytics Academy — free and open source.</p>
        <p class="ftr__note">
          Not affiliated with Salesforce, Inc.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.ftr {
  margin-block-start: var(--s-9);
  padding-block: var(--s-8) var(--s-5);
  background: var(--c-bg-sunken);
  border-block-start: 1px solid var(--c-line);
}

.ftr__top {
  display: grid;
  gap: var(--s-6);
  grid-template-columns: 1fr;

  @media (min-width: 40rem) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 64rem) {
    // The brand column gets nearly twice the width so the tagline sets on two
    // lines rather than five.
    grid-template-columns: 1.6fr repeat(3, 1fr);
    gap: var(--s-7);
  }
}

.ftr__brand {
  @media (min-width: 40rem) and (max-width: 63.999rem) {
    grid-column: 1 / -1;
  }
}

.ftr__logo {
  display: inline-block;
  text-decoration: none;
}

.ftr__tagline {
  margin-block: var(--s-3) var(--s-4);
  max-width: 28ch;
  font-size: var(--t-small);
  color: var(--c-text-soft);
}

.ftr__socials {
  display: flex;
  gap: var(--s-2);
}

.ftr__social {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid var(--c-line);
  border-radius: var(--r-full);
  background: var(--c-bg-raised);
  color: var(--c-text-soft);
  transition: color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);

  &:hover {
    color: var(--c-brand-text);
    border-color: var(--c-brand);
  }
}

.ftr__col-title {
  margin: 0 0 var(--s-3);
  font-family: var(--font-display);
  font-size: var(--t-micro);
  letter-spacing: var(--tr-caps);
  text-transform: uppercase;
  color: var(--c-text-faint);
}

.ftr__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}

.ftr__link {
  font-size: var(--t-small);
  color: var(--c-text-soft);
  text-decoration: none;

  &:hover { color: var(--c-brand-text); }
}

.ftr__base {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--s-2);
  margin-block-start: var(--s-7);
  padding-block-start: var(--s-4);
  border-block-start: 1px solid var(--c-line);
  font-size: var(--t-tiny);
  color: var(--c-text-faint);

  p { margin: 0; }
}

.ftr__note { opacity: 0.8; }
</style>
