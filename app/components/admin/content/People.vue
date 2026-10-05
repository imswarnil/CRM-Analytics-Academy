<script setup lang="ts">
/**
 * The people registry (content/people/<slug>.yml) and the instructor accounts
 * linked to it. Admins only.
 *
 * Onboarding an instructor is three steps, all on this screen or the Users
 * tab: add their person entry here, give their account the instructor role
 * (Users & Roles), then link the account to the entry below. From then on
 * they can edit any lesson whose `authors` includes their slug.
 */
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import type { EditorPerson, PublishResult } from '~/types/content-editor'

const props = defineProps<{ people: EditorPerson[] }>()
const emit = defineEmits<{ saved: [] }>()

interface Instructor {
  id: string
  email: string
  name: string | null
  personSlug: string | null
}

const editing = ref<{ path: string | null, sha: string | null } | null>(null)
const form = reactive({
  slug: '',
  name: '',
  role: 'instructor' as PersonRole,
  avatar: '',
  headline: '',
  bio: '',
  links: Object.fromEntries(PERSON_LINK_KEYS.map(k => [k, ''])) as Record<string, string>
})
const saving = ref(false)
const error = ref('')
const result = ref<PublishResult | null>(null)

const instructors = ref<Instructor[]>([])
const migrated = ref(true)
const linkBusy = ref<string | null>(null)
const linkError = ref('')

async function loadInstructors() {
  try {
    const r = await $fetch<{ instructors: Instructor[], migrated: boolean }>('/api/admin/content/instructors')
    instructors.value = r.instructors
    migrated.value = r.migrated
  } catch (e) {
    linkError.value = apiError(e) || 'Could not load instructor accounts.'
  }
}
onMounted(loadInstructors)

function startNew() {
  editing.value = { path: null, sha: null }
  Object.assign(form, { slug: '', name: '', role: 'instructor', avatar: '', headline: '', bio: '' })
  for (const k of PERSON_LINK_KEYS) form.links[k] = ''
  result.value = null
  error.value = ''
}

async function edit(p: EditorPerson) {
  error.value = ''
  result.value = null
  try {
    const r = await $fetch<{ sha: string, content: string }>('/api/admin/content/file', { query: { path: p.path } })
    const d = (parseYaml(r.content) ?? {}) as Record<string, unknown>
    const links = (d.links ?? {}) as Record<string, string>
    Object.assign(form, {
      slug: p.slug,
      name: String(d.name ?? ''),
      role: (PERSON_ROLES as readonly string[]).includes(String(d.role)) ? d.role as PersonRole : 'community',
      avatar: String(d.avatar ?? ''),
      headline: String(d.headline ?? ''),
      bio: String(d.bio ?? '')
    })
    for (const k of PERSON_LINK_KEYS) form.links[k] = String(links[k] ?? '')
    editing.value = { path: p.path, sha: r.sha }
  } catch (e) {
    error.value = apiError(e) || 'Could not load that person.'
  }
}

watch(() => form.name, (name) => {
  if (editing.value && !editing.value.path) form.slug = slugify(name)
})

const data = computed(() => {
  const links = Object.fromEntries(Object.entries(form.links).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v))
  return Object.fromEntries(Object.entries({
    name: form.name.trim(),
    role: form.role,
    avatar: form.avatar.trim() || undefined,
    headline: form.headline.trim() || undefined,
    bio: form.bio.trim() || undefined,
    links: Object.keys(links).length ? links : undefined
  }).filter(([, v]) => v !== undefined))
})
const problems = computed(() => {
  const out = personProblems(data.value)
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(form.slug)) out.push('slug must be lowercase letters, digits and dashes.')
  if (editing.value && !editing.value.path && props.people.some(p => p.slug === form.slug)) out.push(`${form.slug} already exists.`)
  return out
})

async function save() {
  if (!editing.value || problems.value.length) return
  saving.value = true
  error.value = ''
  try {
    const content = stringifyYaml(data.value, { lineWidth: 0, defaultStringType: 'QUOTE_DOUBLE', defaultKeyType: 'PLAIN' })
    result.value = await $fetch<PublishResult>('/api/admin/content/file', {
      method: 'PUT',
      body: { path: editing.value.path ?? `content/people/${form.slug}.yml`, content, sha: editing.value.sha }
    })
    editing.value = null
    emit('saved')
  } catch (e) {
    error.value = apiError(e) || 'Could not save.'
  } finally {
    saving.value = false
  }
}

async function link(i: Instructor, slug: string | null) {
  linkBusy.value = i.id
  linkError.value = ''
  try {
    await $fetch('/api/admin/content/instructors', { method: 'PUT', body: { userId: i.id, personSlug: slug } })
    i.personSlug = slug
  } catch (e) {
    linkError.value = apiError(e) || 'Could not link the account.'
  } finally {
    linkBusy.value = null
  }
}

const personItems = computed(() => [{ label: '— not linked —', value: '_' }, ...props.people.map(p => ({ label: `${p.name} (${p.slug})`, value: p.slug }))])
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <!-- Registry -->
    <section>
      <div class="mb-3 flex items-center justify-between">
        <p class="mono-label">
          People registry · content/people
        </p>
        <UButton
          size="xs"
          icon="i-lucide-user-plus"
          label="Add person"
          variant="soft"
          @click="startNew"
        />
      </div>
      <ul class="border-[1.5px] border-(--ink) bg-(--card)">
        <li
          v-for="p in people"
          :key="p.slug"
          class="flex items-center gap-3 border-b border-(--line) px-3 py-2 last:border-b-0"
        >
          <img
            v-if="p.avatar"
            :src="p.avatar"
            alt=""
            class="size-8 border border-(--ink) object-cover"
          >
          <span
            v-else
            class="grid size-8 place-items-center border border-(--ink) bg-(--ice) font-mono text-[10px]"
          >{{ p.name.slice(0, 2).toUpperCase() }}</span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-(--ink)">
              {{ p.name }}
            </p>
            <p class="truncate font-mono text-[11px] text-(--ink2)">
              {{ p.slug }} · {{ p.role }}
            </p>
          </div>
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-lucide-pencil"
            aria-label="Edit"
            @click="edit(p)"
          />
        </li>
        <li
          v-if="!people.length"
          class="p-6 text-center text-sm text-(--ink2)"
        >
          No people yet.
        </li>
      </ul>

      <div
        v-if="editing"
        class="mt-4 grid gap-3 border-[1.5px] border-(--ink) bg-(--card) p-4 sm:grid-cols-2"
      >
        <UFormField label="Name">
          <UInput v-model="form.name" />
        </UFormField>
        <UFormField
          label="Slug"
          :help="editing.path ? 'The file name — fixed once created.' : 'Lessons name authors by this.'"
        >
          <UInput
            v-model="form.slug"
            :disabled="Boolean(editing.path)"
            class="font-mono"
          />
        </UFormField>
        <UFormField label="Role">
          <USelect
            v-model="form.role"
            :items="[...PERSON_ROLES]"
          />
        </UFormField>
        <UFormField label="Avatar URL">
          <UInput
            v-model="form.avatar"
            placeholder="https://… or /people/x.jpg"
          />
        </UFormField>
        <UFormField
          label="Headline"
          class="sm:col-span-2"
        >
          <UInput
            v-model="form.headline"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Bio"
          class="sm:col-span-2"
        >
          <UTextarea
            v-model="form.bio"
            :rows="2"
            autoresize
            class="w-full"
          />
        </UFormField>
        <UFormField
          v-for="k in PERSON_LINK_KEYS"
          :key="k"
          :label="k"
          class="capitalize"
        >
          <UInput
            v-model="form.links[k]"
            placeholder="https://…"
            class="w-full normal-case"
          />
        </UFormField>
        <ul
          v-if="problems.length"
          class="text-sm text-error sm:col-span-2"
        >
          <li
            v-for="pr in problems"
            :key="pr"
          >
            {{ pr }}
          </li>
        </ul>
        <div class="flex justify-end gap-2 sm:col-span-2">
          <UButton
            color="neutral"
            variant="ghost"
            label="Cancel"
            @click="editing = null"
          />
          <UButton
            icon="i-lucide-git-commit-horizontal"
            label="Commit to main"
            :loading="saving"
            :disabled="problems.length > 0"
            @click="save"
          />
        </div>
      </div>
      <p
        v-if="error"
        class="mt-3 text-sm text-error"
      >
        {{ error }}
      </p>
      <p
        v-if="result"
        class="mt-3 text-sm text-(--ink)"
      >
        Committed <a
          :href="result.commitUrl"
          target="_blank"
          rel="noopener"
          class="font-mono text-primary"
        >{{ result.commitSha.slice(0, 7) }}</a>. It appears on /instructors after the next deploy.
      </p>
    </section>

    <!-- Instructor accounts -->
    <section>
      <p class="mono-label mb-3">
        Instructor accounts
      </p>
      <UAlert
        v-if="!migrated"
        color="warning"
        variant="subtle"
        icon="i-lucide-database"
        title="Migration needed"
        description="Apply server/db/012_instructors.sql to Neon to link instructor accounts."
        class="mb-3"
      />
      <p class="mb-3 text-sm text-(--ink2)">
        Give an account the <b>instructor</b> role in Users &amp; Roles, then link it to their person here.
        They can edit any lesson whose authors include that person; every save becomes a pull request in the review queue.
      </p>
      <p
        v-if="linkError"
        class="mb-3 text-sm text-error"
      >
        {{ linkError }}
      </p>
      <ul class="border-[1.5px] border-(--ink) bg-(--card)">
        <li
          v-for="i in instructors"
          :key="i.id"
          class="flex flex-wrap items-center gap-3 border-b border-(--line) px-3 py-2 last:border-b-0"
        >
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-(--ink)">
              {{ i.name || '—' }}
            </p>
            <p class="truncate text-xs text-(--ink2)">
              {{ i.email }}
            </p>
          </div>
          <USelect
            :model-value="i.personSlug ?? '_'"
            :items="personItems"
            value-key="value"
            class="w-56"
            :disabled="linkBusy === i.id || !migrated"
            @update:model-value="(v: string) => link(i, v === '_' ? null : v)"
          />
        </li>
        <li
          v-if="!instructors.length"
          class="p-6 text-center text-sm text-(--ink2)"
        >
          No accounts have the instructor role yet.
        </li>
      </ul>
    </section>
  </div>
</template>
