<script setup lang="ts">
const { canInstall, promptInstall, dismiss } = usePwaInstall()
</script>

<template>
  <Transition name="pwa">
    <div
      v-if="canInstall"
      class="pwa"
      role="dialog"
      aria-labelledby="pwa-title"
    >
      <Icon
        name="i-lucide-download"
        class="pwa__icon"
      />

      <div class="pwa__body">
        <p
          id="pwa-title"
          class="pwa__title"
        >
          Install CRM Analytics Academy
        </p>
        <p class="pwa__desc">
          Add it to your home screen for offline lessons.
        </p>
      </div>

      <div class="pwa__actions">
        <UiButton
          variant="primary"
          size="sm"
          label="Install"
          @click="promptInstall"
        />
        <UiButton
          variant="ghost"
          size="sm"
          label="Not now"
          @click="dismiss"
        />
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.pwa {
  position: fixed;
  // Sits above the iOS home indicator rather than under it.
  inset-block-end: max(var(--s-4), env(safe-area-inset-bottom));
  inset-inline-end: var(--s-4);
  z-index: var(--z-toast);
  display: flex;
  align-items: flex-start;
  gap: var(--s-3);
  max-width: min(22rem, calc(100vw - var(--s-8)));
  padding: var(--s-4);
  background: var(--c-bg-raised);
  border: 1px solid var(--c-line);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-4);
}

.pwa__icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin-block-start: 0.1rem;
  color: var(--c-brand);
}

.pwa__body { flex: 1; min-width: 0; }

.pwa__title {
  margin: 0;
  font-size: var(--t-small);
  font-weight: 700;
}

.pwa__desc {
  margin: var(--s-1) 0 0;
  font-size: var(--t-tiny);
  color: var(--c-text-soft);
}

.pwa__actions {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
  flex-shrink: 0;
}

.pwa-enter-active,
.pwa-leave-active {
  transition: opacity var(--dur-mid) var(--ease-out), transform var(--dur-mid) var(--ease-spring);
}

.pwa-enter-from,
.pwa-leave-to {
  opacity: 0;
  transform: translateY(0.75rem);
}
</style>
