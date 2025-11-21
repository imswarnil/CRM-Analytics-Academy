<script setup lang="ts">
interface StepItem {
  title: string
  description?: string
  icon?: string
}

const props = defineProps<{
  steps: StepItem[]
  modelValue?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
}>()

const current = computed({
  get: () => props.modelValue ?? 0,
  set: (value: number) => {
    emit('update:modelValue', value)
    emit('change', value)
  }
})
</script>

<template>
  <section class="ui-container my-8">
    <div class="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <!-- LEFT: MAIN CONTENT -->
      <div class="space-y-4">
        <!-- Optional eyebrow / small label -->
        <slot name="eyebrow" />

        <!-- Optional title -->
        <slot name="title" />

        <!-- Main content (Markdown, lessons, whatever) -->
        <slot />
      </div>

      <!-- RIGHT: STEPPER CARD -->
      <aside class="u-page-card">
        <header class="ui-card-header">
          <div>
            <h2 class="u-card-title">
              <slot name="stepper-title">Your learning path</slot>
            </h2>
            <p class="u-card-subtitle">
              <slot name="stepper-subtitle">
                Follow each step to complete this module.
              </slot>
            </p>
          </div>
        </header>

        <UStepper
          v-model="current"
          :items="steps"
          orientation="vertical"
        />
      </aside>
    </div>
  </section>
</template>
