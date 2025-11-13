<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui'

const items = ref<StepperItem[]>([
  {
    title: 'Address',
    description: 'Add your address here',
    icon: 'i-lucide-house'
  },
  {
    title: 'Shipping',
    description: 'Set your preferred shipping method',
    icon: 'i-lucide-truck'
  },
  {
    title: 'Checkout',
    description: 'Confirm your order'
  }
])
</script>

<template>
  <UStepper size="xl" :items="items" class="w-full" />
</template>
