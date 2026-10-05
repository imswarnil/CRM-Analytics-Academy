<script setup lang="ts">
/**
 * The sponsor studio's creative editor: one format at a time, with live
 * previews at TRUE size drawn by the same <PromoCreative> the site uses.
 *
 * Images are checked for type, weight and pixel size in the browser before
 * upload (a quick answer), and again from the bytes by /api/upload (the one
 * that counts). Copy limits mirror the database constraints.
 *
 * English-only, like the rest of the signed-in tooling.
 */
import type { PartnerCreative, PartnerFormat, PartnerImageKind, PartnerMode, PartnerTheme } from '#shared/utils/partner'

interface EditableCreative {
  id?: string
  format: PartnerFormat
  mode: PartnerMode
  imageUrl: string | null
  imageMobileUrl: string | null
  logoUrl: string | null
  headline: string | null
  body: string | null
  cta: string | null
  theme: PartnerTheme
  clickUrl: string
  alt: string | null
  status?: string
}

const props = defineProps<{
  format: PartnerFormat
  initial: EditableCreative | null
  sponsorName: string
  website: string | null
  canPublish: boolean
}>()
const emit = defineEmits<{ saved: [id: string], cancel: [] }>()

const blank = (): EditableCreative => ({
  format: props.format,
  mode: 'designed',
  imageUrl: null,
  imageMobileUrl: null,
  logoUrl: null,
  headline: '',
  body: '',
  cta: '',
  theme: 'paper',
  clickUrl: props.website ?? 'https://',
  alt: ''
})
const form = reactive<EditableCreative>({ ...blank(), ...(props.initial ?? {}) })
watch(() => [props.initial, props.format], () => {
  Object.assign(form, blank(), props.initial ?? {})
  error.value = ''
})

const L = PARTNER_LIMITS
const preview = computed<Pick<PartnerCreative, 'format' | 'mode' | 'imageUrl' | 'imageMobileUrl' | 'logoUrl' | 'headline' | 'body' | 'cta' | 'theme' | 'alt' | 'sponsor'>>(() => ({
  format: form.format,
  mode: form.mode,
  imageUrl: form.imageUrl,
  imageMobileUrl: form.imageMobileUrl,
  logoUrl: form.logoUrl,
  headline: form.headline || 'Your headline',
  body: form.body,
  cta: form.cta,
  theme: form.theme,
  alt: form.alt,
  sponsor: props.sponsorName
}))

// ---- uploads -------------------------------------------------------------
const uploading = ref<string | null>(null)
const error = ref('')

function dimensions(file: File): Promise<{ w: number, h: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({ w: img.naturalWidth, h: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      reject(new Error('unreadable'))
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

async function upload(e: Event, kind: PartnerImageKind, field: 'imageUrl' | 'imageMobileUrl' | 'logoUrl') {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  error.value = ''
  const spec = PARTNER_IMAGE_SPECS[kind]
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    error.value = 'Use a PNG, JPG or WebP image.'
    return
  }
  if (file.size > L.bytes) {
    error.value = 'Images are capped at 1 MB.'
    return
  }
  try {
    const { w, h } = await dimensions(file)
    if (!partnerImageFits(kind, w, h)) {
      error.value = `${spec.label}: this image is ${w}×${h}.`
      return
    }
  } catch {
    error.value = 'That image could not be read.'
    return
  }
  uploading.value = field
  try {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('kind', kind)
    const res = await $fetch<{ url: string }>('/api/upload', { method: 'POST', body: fd })
    form[field] = res.url
  } catch (err) {
    error.value = apiError(err) || 'Upload failed.'
  } finally {
    uploading.value = null
  }
}

// ---- save ----------------------------------------------------------------
const saving = ref<'draft' | 'publish' | null>(null)
async function save(publish: boolean) {
  error.value = ''
  saving.value = publish ? 'publish' : 'draft'
  try {
    const res = await $fetch<{ id: string }>('/api/partner/creatives', {
      method: 'POST',
      body: { ...form, format: props.format, publish }
    })
    form.id = res.id
    emit('saved', res.id)
  } catch (err) {
    error.value = apiError(err) || 'Could not save.'
  } finally {
    saving.value = null
  }
}

const count = (s: string | null, max: number) => `${(s ?? '').length}/${max}`
const squareKind = ref<'square' | 'squareOne'>('square')
const themes: { value: PartnerTheme, label: string }[] = [
  { value: 'paper', label: 'Paper' },
  { value: 'navy', label: 'Navy' },
  { value: 'signal', label: 'Signal' }
]
const inputClass = 'mt-1 w-full border-[1.5px] border-(--ink) bg-(--card) px-3 py-2 text-sm outline-none focus:border-(--signal)'
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
    <!-- ================= Form ================= -->
    <form
      class="space-y-4 border-[1.5px] border-(--ink) bg-(--card) p-5"
      @submit.prevent="save(false)"
    >
      <div
        v-if="format !== 'text'"
        class="flex border-[1.5px] border-(--ink)"
        role="radiogroup"
        aria-label="Creative type"
      >
        <button
          v-for="m in (['designed', 'image'] as const)"
          :key="m"
          type="button"
          role="radio"
          :aria-checked="form.mode === m"
          class="flex-1 px-3 py-2 font-mono text-[11px] uppercase tracking-[.08em]"
          :class="form.mode === m ? 'bg-(--signal) text-white' : 'hover:bg-(--ice)'"
          @click="form.mode = m"
        >
          {{ m === 'designed' ? 'Designed (logo + copy)' : 'Image upload' }}
        </button>
      </div>

      <!-- Image mode -->
      <template v-if="form.mode === 'image'">
        <div v-if="format === 'leaderboard'">
          <span class="mono-label">Desktop image · 728×90 (or 1456×180)</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            class="mt-1 block w-full text-sm"
            :disabled="uploading !== null"
            @change="upload($event, 'leaderboard', 'imageUrl')"
          >
          <span class="mono-label mt-3 block">Phone image · 320×100 (or 640×200) — optional</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            class="mt-1 block w-full text-sm"
            :disabled="uploading !== null"
            @change="upload($event, 'leaderboardMobile', 'imageMobileUrl')"
          >
          <p class="mt-1 text-xs text-(--ink2)">
            Without a phone image, the desktop one is scaled down to fit 320×100.
          </p>
        </div>
        <div v-else>
          <span class="mono-label">Image</span>
          <div class="mt-1 flex gap-2">
            <button
              v-for="k in (['square', 'squareOne'] as const)"
              :key="k"
              type="button"
              class="border-[1.5px] px-2 py-1 font-mono text-[10px] uppercase"
              :class="squareKind === k ? 'border-(--signal) text-(--signal)' : 'border-(--ink)'"
              @click="squareKind = k"
            >
              {{ k === 'square' ? '300×250 (or 600×500)' : '1:1, 300–2400px' }}
            </button>
          </div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            class="mt-2 block w-full text-sm"
            :disabled="uploading !== null"
            @change="upload($event, squareKind, 'imageUrl')"
          >
          <p class="mt-1 text-xs text-(--ink2)">
            A 1:1 image is shown whole inside the 300×250 slot, with a paper margin.
          </p>
        </div>
        <label class="block">
          <span class="mono-label">Alt text · {{ count(form.alt, L.alt) }}</span>
          <input
            v-model="form.alt"
            :maxlength="L.alt"
            :class="inputClass"
            placeholder="What the image says, for screen readers"
          >
        </label>
      </template>

      <!-- Designed / text mode -->
      <template v-else>
        <div>
          <span class="mono-label">Logo · square PNG/JPG/WebP, 96–1024px — optional</span>
          <div class="mt-1 flex items-center gap-3">
            <img
              v-if="form.logoUrl"
              :src="form.logoUrl"
              alt=""
              class="size-10 border-[1.5px] border-(--ink) object-contain"
            >
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              class="block w-full text-sm"
              :disabled="uploading !== null"
              @change="upload($event, 'logo', 'logoUrl')"
            >
            <UButton
              v-if="form.logoUrl"
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              aria-label="Remove logo"
              @click="form.logoUrl = null"
            />
          </div>
        </div>
        <label class="block">
          <span class="mono-label">Headline · {{ count(form.headline, L.headline) }}</span>
          <input
            v-model="form.headline"
            :maxlength="L.headline"
            required
            :class="inputClass"
          >
        </label>
        <label class="block">
          <span class="mono-label">Line · {{ count(form.body, L.body) }}</span>
          <textarea
            v-model="form.body"
            :maxlength="L.body"
            rows="3"
            :class="inputClass"
          />
        </label>
        <label class="block">
          <span class="mono-label">Button / link text · {{ count(form.cta, L.cta) }}</span>
          <input
            v-model="form.cta"
            :maxlength="L.cta"
            placeholder="Learn more"
            :class="inputClass"
          >
        </label>
        <div v-if="format !== 'text'">
          <span class="mono-label">Colour</span>
          <div class="mt-1 flex gap-2">
            <button
              v-for="th in themes"
              :key="th.value"
              type="button"
              class="border-[1.5px] px-3 py-1 font-mono text-[10px] uppercase"
              :class="form.theme === th.value ? 'border-(--signal) text-(--signal)' : 'border-(--ink)'"
              @click="form.theme = th.value"
            >
              {{ th.label }}
            </button>
          </div>
        </div>
      </template>

      <label class="block">
        <span class="mono-label">Link · https only</span>
        <input
          v-model="form.clickUrl"
          type="url"
          required
          maxlength="500"
          :class="inputClass"
          placeholder="https://example.com/?utm_source=crmanalytics"
        >
      </label>

      <p
        v-if="uploading"
        class="text-xs text-(--ink2)"
      >
        Uploading…
      </p>
      <p
        v-if="error"
        class="text-sm text-error"
        role="alert"
      >
        {{ error }}
      </p>

      <div class="flex flex-wrap gap-2 pt-2">
        <UButton
          type="submit"
          color="neutral"
          variant="outline"
          :loading="saving === 'draft'"
          :disabled="saving !== null || uploading !== null"
        >
          {{ form.status === 'published' ? 'Save (stays live)' : 'Save draft' }}
        </UButton>
        <UButton
          icon="i-lucide-radio"
          :loading="saving === 'publish'"
          :disabled="saving !== null || uploading !== null || !canPublish || form.status === 'paused' || form.status === 'rejected'"
          @click="save(true)"
        >
          Save & publish
        </UButton>
        <UButton
          color="neutral"
          variant="ghost"
          @click="emit('cancel')"
        >
          Close
        </UButton>
      </div>
      <p
        v-if="!canPublish"
        class="text-xs text-(--ink2)"
      >
        Publishing unlocks once one of your months is paid. Drafts can be saved now.
      </p>
    </form>

    <!-- ================= Live previews ================= -->
    <div class="min-w-0 space-y-6">
      <template v-if="format === 'leaderboard'">
        <BpFigure
          caption="Preview — desktop"
          spec="728×90"
        >
          <div class="overflow-x-auto p-4 graph-paper-fine">
            <p class="mb-1 font-mono text-[10px] uppercase tracking-[.14em] text-(--ink2)">
              Sponsored
            </p>
            <div class="h-[90px] w-[728px]">
              <PromoCreative
                :creative="preview"
                variant="desktop"
              />
            </div>
          </div>
        </BpFigure>
        <BpFigure
          caption="Preview — phone"
          spec="320×100"
        >
          <div class="p-4 graph-paper-fine">
            <p class="mb-1 font-mono text-[10px] uppercase tracking-[.14em] text-(--ink2)">
              Sponsored
            </p>
            <div class="h-[100px] w-[320px] max-w-full">
              <PromoCreative
                :creative="preview"
                variant="mobile"
              />
            </div>
          </div>
        </BpFigure>
      </template>
      <template v-else-if="format === 'square'">
        <div class="grid gap-6 lg:grid-cols-2">
          <BpFigure
            caption="Preview — page sidebar"
            spec="300×250"
          >
            <div class="p-4 graph-paper-fine">
              <p class="mb-1 font-mono text-[10px] uppercase tracking-[.14em] text-(--ink2)">
                Sponsored
              </p>
              <div class="h-[250px] w-[300px] max-w-full">
                <PromoCreative :creative="preview" />
              </div>
            </div>
          </BpFigure>
          <BpFigure
            caption="Preview — lesson rail"
            spec="scaled to 224 wide"
          >
            <div class="p-4 graph-paper-fine">
              <p class="mb-1 font-mono text-[10px] uppercase tracking-[.14em] text-(--ink2)">
                Sponsored
              </p>
              <div class="aspect-[300/250] w-[224px]">
                <PromoCreative :creative="preview" />
              </div>
            </div>
          </BpFigure>
        </div>
      </template>
      <template v-else>
        <BpFigure
          caption="Preview — in a lesson"
          spec="680 wide"
        >
          <div class="overflow-x-auto p-4 graph-paper-fine">
            <p class="mb-1 font-mono text-[10px] uppercase tracking-[.14em] text-(--ink2)">
              Sponsored
            </p>
            <div class="h-32 w-[680px]">
              <PromoCreative :creative="preview" />
            </div>
          </div>
        </BpFigure>
        <BpFigure
          caption="Preview — phone"
          spec="343 wide"
        >
          <div class="p-4 graph-paper-fine">
            <p class="mb-1 font-mono text-[10px] uppercase tracking-[.14em] text-(--ink2)">
              Sponsored
            </p>
            <div class="h-32 w-[343px] max-w-full">
              <PromoCreative :creative="preview" />
            </div>
          </div>
        </BpFigure>
      </template>
      <p class="text-xs text-(--ink2)">
        Previews use the same component as the live site. Changes to a published creative appear on the site within about five minutes.
      </p>
    </div>
  </div>
</template>
