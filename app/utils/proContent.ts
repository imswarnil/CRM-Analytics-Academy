/**
 * Rendering gated markdown on the client — the one code path behind both a
 * whole Pro lesson (LessonProGate) and an inline `::pro` block (ProLocked).
 */
import type { InjectionKey, Ref } from 'vue'
import type { PlaybackTokens } from '#shared/utils/lessonVideo'

/**
 * Signed playbacks for the videos inside unlocked markdown, keyed by playback
 * id. Provided by whatever rendered the gated markdown; `:::lesson-video`
 * blocks inside it inject this to find their token.
 */
export const MUX_PLAYBACK: InjectionKey<Ref<Record<string, PlaybackTokens>>> = Symbol('mux-playback')

/**
 * Markdown → the shape ContentRenderer takes. Parsed here rather than handed
 * to <MDC> because <MDC> only resolves globally registered components, and the
 * course's own blocks (field tables, lesson links, …) are registered for
 * ContentRenderer — the same renderer free lessons use.
 */
export async function parseGatedMarkdown(markdown: string): Promise<{ body: unknown, toc?: unknown }> {
  const { parseMarkdown } = await import('@nuxtjs/mdc/runtime')
  return await parseMarkdown(markdown, { toc: { depth: 2, searchDepth: 1 } }) as { body: unknown, toc?: unknown }
}
