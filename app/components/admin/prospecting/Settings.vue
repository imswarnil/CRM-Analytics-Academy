<script setup lang="ts">
/** Sending settings (cap, ramp-up, window, time zone, sender, footer) and the global suppression list. */
const emit = defineEmits<{ saved: [] }>()
interface Settings { dailyCap: number, rampStart: number, rampStep: number, windowStart: number, windowEnd: number, defaultTz: string, senderName: string, footer: string, suppressLearners: boolean }

const { data: status } = await useLazyAsyncData('prospect-settings', () => $fetch<{ settings: Settings }>('/api/admin/prospecting/status'), { server: false })
const form = ref<Settings | null>(null)
watch(status, (s) => {
  if (s) form.value = { ...s.settings }
}, { immediate: true })
const message = ref<string | null>(null)
async function save() {
  try {
    await $fetch('/api/admin/prospecting/settings', { method: 'POST', body: form.value })
    message.value = 'Saved'
    emit('saved')
  } catch (e) {
    message.value = (e as { statusMessage?: string }).statusMessage ?? String(e)
  }
}

const { data: supp, refresh } = await useLazyAsyncData('prospect-suppression', () => $fetch<{ suppression: { value: string, reason: string, note: string | null, at: string }[] }>('/api/admin/prospecting/suppression'), { server: false })
const add = ref('')
async function addSuppression() {
  if (!add.value.trim()) return
  await $fetch('/api/admin/prospecting/suppression', { method: 'POST', body: { action: 'add', values: add.value } })
  add.value = ''
  await refresh()
}
async function removeSuppression(value: string) {
  await $fetch('/api/admin/prospecting/suppression', { method: 'POST', body: { action: 'remove', value } })
  await refresh()
}
</script>

<template>
  <div class="grid gap-5 lg:grid-cols-2">
    <form
      v-if="form"
      class="space-y-3 rounded-[6px] border border-(--line) bg-(--card) p-4 text-sm"
      @submit.prevent="save"
    >
      <h3 class="font-semibold text-(--ink)">
        Sending
      </h3>
      <div class="grid grid-cols-2 gap-3 text-xs">
        <label>Daily cap (rolling 24 h)
          <input
            v-model.number="form.dailyCap"
            type="number"
            min="0"
            max="200"
            class="mt-1 w-full rounded-[4px] border border-(--line) bg-(--card) px-2 py-1"
          ></label>
        <label>Ramp-up: start at / day, + per day
          <span class="mt-1 flex gap-1">
            <input
              v-model.number="form.rampStart"
              type="number"
              min="1"
              max="200"
              class="w-full rounded-[4px] border border-(--line) bg-(--card) px-2 py-1"
            >
            <input
              v-model.number="form.rampStep"
              type="number"
              min="0"
              max="100"
              class="w-full rounded-[4px] border border-(--line) bg-(--card) px-2 py-1"
            >
          </span></label>
        <label>Window (prospect's local hours, Mon–Fri)
          <span class="mt-1 flex gap-1">
            <input
              v-model.number="form.windowStart"
              type="number"
              min="0"
              max="23"
              class="w-full rounded-[4px] border border-(--line) bg-(--card) px-2 py-1"
            >
            <input
              v-model.number="form.windowEnd"
              type="number"
              min="1"
              max="24"
              class="w-full rounded-[4px] border border-(--line) bg-(--card) px-2 py-1"
            >
          </span></label>
        <label>Default time zone (when the prospect's is unknown)
          <input
            v-model="form.defaultTz"
            class="mt-1 w-full rounded-[4px] border border-(--line) bg-(--card) px-2 py-1"
          ></label>
        <label class="col-span-2">Sender name
          <input
            v-model="form.senderName"
            class="mt-1 w-full rounded-[4px] border border-(--line) bg-(--card) px-2 py-1"
          ></label>
        <label class="col-span-2">Footer (who you are; the unsubscribe link is added below it)
          <textarea
            v-model="form.footer"
            rows="3"
            class="mt-1 w-full rounded-[4px] border border-(--line) bg-(--card) px-2 py-1"
          /></label>
        <label class="col-span-2 flex items-center gap-2"><input
          v-model="form.suppressLearners"
          type="checkbox"
        > Never email people who already have an Academy account</label>
      </div>
      <div class="flex items-center gap-3">
        <UButton
          type="submit"
          size="sm"
        >
          Save
        </UButton>
        <span class="text-xs text-(--ink2)">{{ message }}</span>
      </div>
      <p class="text-xs text-(--ink2)">
        Sends go out from your connected Gmail only, never through the site's Resend account. Replies and bounces stop a prospect's sequences; open tracking is off.
      </p>
    </form>

    <section class="space-y-3 rounded-[6px] border border-(--line) bg-(--card) p-4 text-sm">
      <h3 class="font-semibold text-(--ink)">
        Do-not-contact ({{ supp?.suppression.length ?? 0 }})
      </h3>
      <form
        class="flex gap-2"
        @submit.prevent="addSuppression"
      >
        <UInput
          v-model="add"
          size="sm"
          placeholder="a@b.com, @competitor.com"
          class="flex-1"
        />
        <UButton
          type="submit"
          size="sm"
          variant="outline"
        >
          Add
        </UButton>
      </form>
      <ul class="max-h-96 space-y-1 overflow-y-auto text-xs">
        <li
          v-for="s in supp?.suppression"
          :key="s.value"
          class="flex items-center gap-2"
        >
          <span class="flex-1 font-mono">{{ s.value }}</span>
          <span class="text-(--ink2)">{{ s.reason }}</span>
          <button
            v-if="s.reason === 'manual'"
            type="button"
            class="text-(--ink2) hover:text-error"
            @click="removeSuppression(s.value)"
          >
            remove
          </button>
        </li>
      </ul>
      <p class="text-xs text-(--ink2)">
        Unsubscribes, bounces and deleted prospects are added automatically and cannot be removed here.
      </p>
    </section>
  </div>
</template>
