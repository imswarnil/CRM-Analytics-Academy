<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'

/**
 * Submit an interview question with a model answer. The answer is written in
 * a rich text editor (Nuxt UI's UEditor) that reads and writes markdown, so
 * what is stored is plain markdown and renders in the Blueprint prose style.
 * Everything waits for an admin's approval.
 */
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const localePath = useLocalePath()
const navigation = inject<Ref<{ path?: string, title?: string }[]>>('navigation', ref([]))
useSeoMeta({ title: () => t('interview.newTitle'), robots: 'noindex, nofollow' })

const TYPES = ['conceptual', 'technical', 'scenario', 'behavioral', 'saql'] as const
const LEVELS = ['junior', 'mid', 'senior'] as const
const form = reactive({ question: '', answer: '', type: 'conceptual', level: 'mid', topic: 'foundations', company: '', role: '' })
const topics = computed(() => (navigation.value ?? []).map(m => ({
  value: String(m.path ?? '').replace(/^\/[a-z]{2}(?=\/)/, '').replace(/^\//, ''),
  label: String(m.title ?? '')
})).filter(x => x.value && x.value !== 'introduction'))

const toolbar: EditorToolbarItem[][] = [
  [{ kind: 'heading', level: 3, icon: 'i-lucide-heading-3' }],
  [{ kind: 'mark', mark: 'bold', icon: 'i-lucide-bold' }, { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic' }, { kind: 'mark', mark: 'code', icon: 'i-lucide-code' }],
  [{ kind: 'bulletList', icon: 'i-lucide-list' }, { kind: 'orderedList', icon: 'i-lucide-list-ordered' }, { kind: 'blockquote', icon: 'i-lucide-text-quote' }, { kind: 'codeBlock', icon: 'i-lucide-square-code' }],
  [{ kind: 'link', icon: 'i-lucide-link' }],
  [{ kind: 'undo', icon: 'i-lucide-undo' }, { kind: 'redo', icon: 'i-lucide-redo' }]
]

const problem = computed(() => {
  if (form.question.trim().length < 10) return t('interview.form.errQuestion')
  if (form.answer.trim().length < 30) return t('interview.form.errAnswer')
  return ''
})
const showProblem = ref(false)
const sending = ref(false)
const error = ref('')
const sent = ref<string | null>(null)

async function send() {
  if (problem.value) {
    showProblem.value = true
    return
  }
  sending.value = true
  error.value = ''
  try {
    const res = await $fetch<{ slug: string }>('/api/interview', { method: 'POST', body: { ...form } })
    sent.value = res.slug
    useNuxtApp().$track?.('interview_submit', form.type)
  } catch (e) {
    error.value = apiError(e) || t('interview.form.errGeneric')
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div>
    <BpPageHeader
      :sheet="t('interview.eyebrow')"
      :title="t('interview.newTitle')"
      :lead="t('interview.newLead')"
    />
    <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div
        v-if="sent"
        class="border-[1.5px] border-(--ink) bg-(--card) p-8 text-center"
      >
        <UIcon
          name="i-lucide-circle-check"
          class="size-10 text-(--signal)"
        />
        <h2 class="bp-h3 mt-3">
          {{ t('interview.form.sentTitle') }}
        </h2>
        <p class="mt-2 text-(--ink2)">
          {{ t('interview.form.sentBody') }}
        </p>
        <div class="mt-6 flex justify-center gap-3">
          <UButton
            icon="i-lucide-plus"
            @click="sent = null; form.question = ''; form.answer = ''"
          >
            {{ t('interview.form.another') }}
          </UButton>
          <UButton
            :to="localePath('/interview-questions')"
            color="neutral"
            variant="outline"
          >
            {{ t('interview.back') }}
          </UButton>
        </div>
      </div>

      <form
        v-else
        class="crosshair space-y-6 border-[1.5px] border-(--ink) bg-(--card) p-6 shadow-[10px_10px_0_var(--ice)] sm:p-8"
        @submit.prevent="send"
      >
        <UFormField
          :label="t('interview.form.question')"
          required
        >
          <UInput
            v-model="form.question"
            size="xl"
            class="w-full"
            :placeholder="t('interview.form.questionPh')"
          />
        </UFormField>

        <UFormField
          :label="t('interview.form.answer')"
          required
          :help="t('interview.form.answerHelp')"
        >
          <div class="border-[1.5px] border-(--ink) bg-(--paper)">
            <UEditor
              v-slot="{ editor }"
              v-model="form.answer"
              content-type="markdown"
              :placeholder="t('interview.form.answerPh')"
              class="bp-prose min-h-64 px-4 py-3"
            >
              <UEditorToolbar
                :editor="editor"
                :items="toolbar"
                class="-mx-4 -mt-3 mb-3 border-b-[1.5px] border-(--ink) bg-(--card) px-2 py-1"
              />
            </UEditor>
          </div>
        </UFormField>

        <div class="grid gap-6 sm:grid-cols-2">
          <UFormField :label="t('interview.filters.type')">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="ty in TYPES"
                :key="ty"
                type="button"
                class="border-[1.5px] px-3 py-1.5 text-sm font-semibold"
                :class="form.type === ty ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) hover:border-(--ink)'"
                @click="form.type = ty"
              >
                {{ t(`interview.types.${ty}`) }}
              </button>
            </div>
          </UFormField>
          <UFormField :label="t('interview.filters.level')">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="lv in LEVELS"
                :key="lv"
                type="button"
                class="border-[1.5px] px-3 py-1.5 text-sm font-semibold"
                :class="form.level === lv ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) hover:border-(--ink)'"
                @click="form.level = lv"
              >
                {{ t(`interview.levels.${lv}`) }}
              </button>
            </div>
          </UFormField>
          <UFormField :label="t('interview.filters.topic')">
            <USelect
              v-model="form.topic"
              :items="topics"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="t('interview.form.company')"
            :hint="t('submit.optional')"
            :help="t('interview.form.companyHelp')"
          >
            <UInput
              v-model="form.company"
              class="w-full"
              placeholder="e.g. Salesforce, Deloitte, Accenture"
            />
          </UFormField>
          <UFormField
            :label="t('interview.form.role')"
            :hint="t('submit.optional')"
          >
            <UInput
              v-model="form.role"
              class="w-full"
              placeholder="e.g. CRM Analytics Consultant"
            />
          </UFormField>
        </div>

        <p
          v-if="(showProblem && problem) || error"
          class="flex items-center gap-2 border-[1.5px] border-dashed border-warning px-4 py-3 text-sm text-warning"
          role="alert"
        >
          <UIcon
            name="i-lucide-triangle-alert"
            class="size-4 flex-none"
          />{{ error || problem }}
        </p>

        <div class="flex justify-end border-t-[1.5px] border-(--ink) pt-5">
          <UButton
            type="submit"
            size="lg"
            icon="i-lucide-send"
            :loading="sending"
          >
            {{ t('interview.form.send') }}
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>
