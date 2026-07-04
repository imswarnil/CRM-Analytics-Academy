<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const supabase = useSupabaseClient()
const { user, profile, isAdmin, displayName } = useProfile()
const localePath = useLocalePath()
const { t } = useI18n()

async function signOut() {
  await supabase.auth.signOut()
  await navigateTo(localePath('/'))
}

const items = computed<DropdownMenuItem[][]>(() => {
  const groups: DropdownMenuItem[][] = [
    [{
      label: displayName.value,
      avatar: profile.value?.avatar_url ? { src: profile.value.avatar_url } : undefined,
      type: 'label'
    }],
    [
      { label: t('nav.dashboard'), icon: 'i-lucide-layout-dashboard', to: localePath('/dashboard') },
      { label: t('nav.profile'), icon: 'i-lucide-user', to: localePath('/profile') }
    ]
  ]
  if (isAdmin.value) {
    groups.push([{ label: t('nav.admin'), icon: 'i-lucide-shield-check', to: localePath('/admin') }])
  }
  groups.push([{ label: t('nav.signOut'), icon: 'i-lucide-log-out', onSelect: signOut }])
  return groups
})
</script>

<template>
  <ClientOnly>
    <UDropdownMenu
      v-if="user"
      :items="items"
      :content="{ align: 'end' }"
    >
      <UButton
        color="neutral"
        variant="ghost"
        class="rounded-full p-0.5"
        :aria-label="displayName"
      >
        <UAvatar
          :src="profile?.avatar_url || undefined"
          :alt="displayName"
          size="sm"
          icon="i-lucide-user"
        />
      </UButton>
    </UDropdownMenu>

    <UButton
      v-else
      :to="localePath('/login')"
      icon="i-lucide-log-in"
      color="primary"
      variant="subtle"
      size="sm"
      class="rounded-full"
    >
      <span class="max-sm:hidden">{{ t('nav.signIn') }}</span>
    </UButton>

    <template #fallback>
      <div class="size-8" />
    </template>
  </ClientOnly>
</template>
