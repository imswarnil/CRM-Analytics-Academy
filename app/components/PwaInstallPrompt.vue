<script setup lang="ts">
// No visible markup of its own — just watches for an installable PWA prompt
// and surfaces it as a toast with an "Install" action. Dismissal is
// remembered for a week so returning readers aren't nagged every visit.
const { canInstall, promptInstall } = usePwaInstall()
const toast = useToast()

const DISMISS_KEY = 'pwa-install-dismissed-until'

function dismissedRecently() {
  const until = Number(localStorage.getItem(DISMISS_KEY) || 0)
  return Date.now() < until
}
function snooze() {
  localStorage.setItem(DISMISS_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000))
}

watch(canInstall, (able) => {
  if (!able || dismissedRecently()) return
  toast.add({
    title: 'Install CRM Analytics Academy',
    description: 'Add it to your home screen for a faster, full-screen experience.',
    icon: 'i-lucide-download',
    color: 'primary',
    duration: 0,
    actions: [
      {
        label: 'Install',
        color: 'primary',
        onClick: () => promptInstall()
      },
      {
        label: 'Not now',
        color: 'neutral',
        variant: 'ghost',
        onClick: () => snooze()
      }
    ]
  })
})
</script>

<template>
  <div class="hidden" />
</template>
