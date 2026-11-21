<script setup lang="ts">
import { AUTHOR } from '~/data/author'

/**
 * /hire — hire the author for CRM Analytics work. Facts come from
 * app/data/author.ts only (the resume), never embellished here. Two ways in:
 * a LinkedIn message, or a project request that becomes a `consulting` lead
 * (POST /api/leads → app.lead → Salesforce Web-to-Lead).
 */
const { t, locale } = useI18n()
const linkedin = AUTHOR.social.find(s => s.key === 'linkedin')!.url

const title = 'Hire Swarnil — CRM Analytics consultant'
const description = 'Seven years of Salesforce CRM Analytics for sales and revenue teams: data prep, dashboards, SAQL, bindings, security, Einstein Discovery and migrations, delivered end to end.'
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: 'Hire me for CRM Analytics', description, headline: 'Consulting', spec: '7 YEARS · END TO END' })

const services = [
  { icon: 'i-lucide-workflow', title: 'Data prep and modelling', text: 'Sync, recipes, joins without fan-out, snapshots, one dataset per decision.' },
  { icon: 'i-lucide-layout-dashboard', title: 'Dashboards people open', text: 'Pipeline, forecast, funnel, CPQ and adoption dashboards for Sales, RevOps and leadership.' },
  { icon: 'i-lucide-link-2', title: 'SAQL and bindings', text: 'Interactive dashboards: faceting, selection and results bindings, windowing, compare tables.' },
  { icon: 'i-lucide-shield-check', title: 'Security and performance', text: 'Predicates, sharing inheritance, and slow dashboards made fast.' },
  { icon: 'i-lucide-arrow-right-left', title: 'Migrations', text: 'From Qlik Sense, Tableau or Salesforce reports to CRM Analytics, without breaking continuity.' },
  { icon: 'i-lucide-sparkles', title: 'Einstein Discovery', text: 'Win, churn and risk models, read honestly and put on the record page.' }
]

// How a whole project runs with one person and AI-assisted tooling.
const steps = [
  { icon: 'i-lucide-search', title: 'Discover', text: 'One workshop: the decisions, the audience, the 5 numbers, the data owners.', ai: 'Notes, KPI definitions and a data map drafted the same day.' },
  { icon: 'i-lucide-network', title: 'Model', text: 'Sources, keys, grain and security designed before any build.', ai: 'Field inventories and join checks generated from org metadata.' },
  { icon: 'i-lucide-hammer', title: 'Build', text: 'Recipes, datasets and dashboards in a sandbox, reviewed weekly.', ai: 'SAQL, recipe formulas and dashboard JSON scaffolded, then verified by hand.' },
  { icon: 'i-lucide-rocket', title: 'Ship', text: 'Tested as real users, deployed with the CLI and git, monitored.', ai: 'Test scripts, row-count reconciliation and deploy checks automated.' },
  { icon: 'i-lucide-graduation-cap', title: 'Hand over', text: 'Docs, short videos and a training session, so your team owns it.', ai: 'Runbooks and walkthrough scripts written from the build itself.' }
]

// The project request.
const scopes = ['implementation', 'dashboards', 'migration', 'audit', 'training'] as const
const form = reactive({ name: '', email: '', company: '', scope: 'implementation' as typeof scopes[number], message: '', website: '' })
const token = ref('')
const human = ref<{ reset: () => void } | null>(null)
const open = ref(false)
const sending = ref(false)
const sent = ref(false)
const error = ref('')
async function send() {
  error.value = ''
  if (!token.value) {
    error.value = t('human.wait')
    return
  }
  sending.value = true
  try {
    const source = (useNuxtApp().$firstTouch as (() => string) | undefined)?.() ?? ''
    await $fetch('/api/leads', {
      method: 'POST',
      body: { product: 'consulting', name: form.name, email: form.email, company: form.company, message: [`Scope: ${form.scope}`, form.message.trim()].filter(Boolean).join('\n'), website: form.website, token: token.value, locale: locale.value, source, landing: '/hire' }
    })
    sent.value = true
  } catch (e) {
    error.value = apiError(e) || 'Could not send. Message me on LinkedIn instead.'
    human.value?.reset()
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="bg-(--paper)">
    <!-- HERO -->
    <section class="relative overflow-hidden bg-(--navy) text-white">
      <div class="mx-auto grid max-w-(--ui-container) items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p class="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[.09em] text-blueprint-200">
            <span class="size-1.5 rounded-full bg-success" />Available for CRM Analytics projects
          </p>
          <h1 class="mt-5 text-4xl font-bold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
            Hire me to build your CRM Analytics, end to end.
          </h1>
          <p class="mt-5 max-w-lg text-lg text-white/75">
            {{ AUTHOR.summary }}
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton
              :to="linkedin"
              target="_blank"
              size="xl"
              icon="i-simple-icons-linkedin"
            >
              Message me on LinkedIn
            </UButton>
            <UButton
              size="xl"
              color="neutral"
              variant="ghost"
              icon="i-lucide-send"
              class="text-white ring-1 ring-inset ring-white/30 hover:bg-white/10 hover:text-white"
              @click="open = true"
            >
              Request a project
            </UButton>
          </div>
        </div>

        <!-- The card: who, where, track record -->
        <div class="rounded-[10px] bg-(--card) p-6 text-(--ink) shadow-[0_24px_48px_-24px_rgb(0_0_0/.6)]">
          <div class="flex items-center gap-4">
            <span class="flex size-14 items-center justify-center rounded-full bg-(--signal) text-xl font-bold text-white">{{ AUTHOR.initials }}</span>
            <div>
              <p class="text-lg font-bold">
                {{ AUTHOR.name }}
              </p>
              <p class="text-sm text-(--ink2)">
                {{ AUTHOR.role }} · {{ AUTHOR.company }} · {{ AUTHOR.place }}
              </p>
            </div>
          </div>
          <ol class="mt-6 space-y-3 border-s-2 border-(--line) ps-4">
            <li
              v-for="r in AUTHOR.roles"
              :key="r.company"
              class="relative"
            >
              <span
                class="absolute -start-[23px] top-1.5 size-3 rounded-full border-2 border-(--card)"
                :class="r.current ? 'bg-success' : 'bg-(--signal)'"
              />
              <p class="text-sm font-semibold">
                {{ r.title }} · {{ r.company }}
              </p>
              <p class="text-xs text-(--ink2)">
                {{ r.years }} · {{ r.place }}
              </p>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <!-- WHAT I DO -->
    <section class="mx-auto max-w-(--ui-container) px-4 py-16 sm:px-6 lg:px-8">
      <h2 class="bp-h2 text-center">
        What I can do for you
      </h2>
      <ul class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="s in services"
          :key="s.title"
          class="rounded-[8px] border border-(--line) bg-(--card) p-6"
        >
          <span class="flex size-11 items-center justify-center rounded-[8px] bg-(--ice) text-(--signal)">
            <UIcon
              :name="s.icon"
              class="size-6"
            />
          </span>
          <h3 class="mt-4 font-bold text-(--ink)">
            {{ s.title }}
          </h3>
          <p class="mt-1 text-[0.9375rem] text-(--ink2)">
            {{ s.text }}
          </p>
        </li>
      </ul>
    </section>

    <!-- HOW A PROJECT RUNS: one person, AI-assisted -->
    <section class="border-y border-(--line) bg-(--card)">
      <div class="mx-auto max-w-(--ui-container) px-4 py-16 sm:px-6 lg:px-8">
        <h2 class="bp-h2 text-center">
          A full project, one person, AI-assisted
        </h2>
        <p class="bp-lead mx-auto mt-3 max-w-2xl text-center">
          No hand-offs between five people. I use AI tools to move faster on code, documentation and testing, and I check every number myself.
        </p>
        <ol class="mt-12 grid gap-6 lg:grid-cols-5">
          <li
            v-for="(st, i) in steps"
            :key="st.title"
            class="relative"
          >
            <span class="flex size-12 items-center justify-center rounded-full bg-(--navy) text-white">
              <UIcon
                :name="st.icon"
                class="size-6"
              />
            </span>
            <p class="mt-4 text-xs font-bold uppercase tracking-[.09em] text-(--label)">
              Step {{ i + 1 }}
            </p>
            <h3 class="font-bold text-(--ink)">
              {{ st.title }}
            </h3>
            <p class="mt-1 text-sm text-(--ink2)">
              {{ st.text }}
            </p>
            <p class="mt-3 flex gap-1.5 rounded-[6px] bg-(--ice) p-2.5 text-xs text-(--ink)">
              <UIcon
                name="i-lucide-bot"
                class="mt-0.5 size-3.5 shrink-0 text-(--signal)"
              />{{ st.ai }}
            </p>
          </li>
        </ol>
      </div>
    </section>

    <!-- TRACK RECORD -->
    <section class="mx-auto grid max-w-(--ui-container) gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div>
        <h2 class="bp-h3">
          Track record
        </h2>
        <ul class="mt-5 space-y-3">
          <li
            v-for="h in AUTHOR.highlights"
            :key="h"
            class="flex gap-3 text-[0.9375rem] text-(--ink)"
          >
            <UIcon
              name="i-lucide-badge-check"
              class="mt-0.5 size-5 shrink-0 text-(--signal)"
            />{{ h }}
          </li>
        </ul>
        <p class="mt-6 text-sm text-(--ink2)">
          {{ AUTHOR.education.degree }} · {{ AUTHOR.education.school }}
        </p>
      </div>
      <div>
        <h2 class="bp-h3">
          Skills
        </h2>
        <div
          v-for="g in AUTHOR.skills.filter(s => ['Salesforce', 'GTM', 'Data'].includes(s.group))"
          :key="g.group"
          class="mt-5"
        >
          <p class="mono-label">
            {{ g.group }}
          </p>
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="s in g.items"
              :key="s"
              class="rounded-full border border-(--line) bg-(--card) px-3 py-1 text-sm text-(--ink)"
            >{{ s }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CLOSE -->
    <section class="bg-(--navy) text-white">
      <div class="mx-auto flex max-w-(--ui-container) flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 class="max-w-2xl text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
          Tell me what your team needs to decide.
        </h2>
        <p class="mt-3 text-white/70">
          I reply within one working day.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <UButton
            :to="linkedin"
            target="_blank"
            size="xl"
            icon="i-simple-icons-linkedin"
          >
            Message me on LinkedIn
          </UButton>
          <UButton
            size="xl"
            color="neutral"
            variant="ghost"
            icon="i-lucide-send"
            class="text-white ring-1 ring-inset ring-white/30 hover:bg-white/10 hover:text-white"
            @click="open = true"
          >
            Request a project
          </UButton>
        </div>
      </div>
    </section>

    <!-- The request, in a dialog -->
    <UModal
      v-model:open="open"
      title="Request a project"
      description="A few lines is enough. I reply within one working day."
    >
      <template #body>
        <div
          v-if="sent"
          class="py-6 text-center"
        >
          <UIcon
            name="i-lucide-check-circle-2"
            class="size-10 text-success"
          />
          <p class="mt-3 font-bold text-(--ink)">
            Thanks, it's on its way.
          </p>
          <p class="mt-1 text-sm text-(--ink2)">
            I'll reply by email within one working day.
          </p>
        </div>
        <form
          v-else
          class="grid gap-4"
          @submit.prevent="send"
        >
          <input
            v-model="form.website"
            name="website"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
            class="hidden"
          >
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Name">
              <UInput
                v-model="form.name"
                required
                class="w-full"
              />
            </UFormField>
            <UFormField label="Work email">
              <UInput
                v-model="form.email"
                type="email"
                required
                class="w-full"
              />
            </UFormField>
          </div>
          <UFormField label="Company">
            <UInput
              v-model="form.company"
              required
              class="w-full"
            />
          </UFormField>
          <UFormField label="What do you need?">
            <USelect
              v-model="form.scope"
              :items="scopes.map(s => ({ label: s[0]!.toUpperCase() + s.slice(1), value: s }))"
              class="w-full"
            />
          </UFormField>
          <UFormField label="A few lines about it">
            <UTextarea
              v-model="form.message"
              :rows="4"
              class="w-full"
            />
          </UFormField>
          <HumanCheck
            ref="human"
            v-model="token"
          />
          <UAlert
            v-if="error"
            color="error"
            variant="subtle"
            :description="error"
          />
          <UButton
            type="submit"
            size="lg"
            block
            :loading="sending"
            icon="i-lucide-send"
          >
            Send request
          </UButton>
        </form>
      </template>
    </UModal>
  </div>
</template>
