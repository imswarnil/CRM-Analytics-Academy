<script setup lang="ts">
/**
 * "Test ride": one click into the shared demo account (POST /api/auth/demo —
 * the credentials never leave the server), then the dashboard.
 */
const props = withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg' | 'xl', block?: boolean, variant?: 'solid' | 'outline' | 'soft' | 'ghost' }>(), { size: 'md', block: false, variant: 'solid' })
const { t } = useI18n()
const localePath = useLocalePath()
const { signInAsDemo, pending } = useAuth()
const toast = useToast()

async function ride() {
  try {
    await signInAsDemo()
    await navigateTo(localePath('/dashboard'))
  } catch {
    toast.add({ title: t('auth.errDemo'), color: 'error', icon: 'i-lucide-circle-alert' })
  }
}
</script>

<template>
  <UButton
    :size="props.size"
    :block="props.block"
    :variant="props.variant"
    :loading="pending"
    icon="i-lucide-car-front"
    class="rounded-full whitespace-nowrap"
    @click="ride"
  >
    {{ t('auth.testRide') }}
  </UButton>
</template>
