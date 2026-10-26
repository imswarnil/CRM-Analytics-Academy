import { WALL_PEOPLE, type WallPerson } from '~/data/wall-of-fame'

/**
 * The Wall of Fame: the curated people in app/data/wall-of-fame.ts plus the
 * community nominations an admin approved (GET /api/wall). The approved ones
 * are fetched in the browser, so prerendered pages stay static and a new
 * approval shows up without a rebuild. Shared by /wall-of-fame and the home page.
 */
export function useWall() {
  const { data } = useFetch<(WallPerson & { community?: boolean })[]>('/api/wall', {
    key: 'wall-community',
    server: false,
    default: () => []
  })
  const people = computed<(WallPerson & { community?: boolean })[]>(() => {
    const seen = new Set(WALL_PEOPLE.map(p => p.name.toLowerCase()))
    return [...WALL_PEOPLE, ...(data.value ?? []).filter(p => !seen.has(p.name.toLowerCase()))]
  })
  return { people }
}

/** Where every "Nominate someone" button goes: the submit form, preset. */
export const NOMINATE_PATH = '/submit?type=nominate'
