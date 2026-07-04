import type { Database } from '~~/types/database.types'

/** Typed Supabase client (RLS-scoped to the current user). */
export const useDb = () => useSupabaseClient<Database>()
