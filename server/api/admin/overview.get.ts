// Admin overview: headline counts, recent sign-ups, and a 7-week activity
// trend. Reads auth.users (via the service-role auth admin API) for accurate
// sign-up / last-sign-in timestamps, joined to profiles for display names.
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)

  const WEEK = 7 * 24 * 60 * 60 * 1000
  const now = Date.now()

  // Seven weekly buckets, oldest → newest, each ending `i` weeks ago.
  const buckets = Array.from({ length: 7 }, (_, idx) => {
    const i = 6 - idx
    const end = now - i * WEEK
    const start = end - WEEK
    const d = new Date(end)
    return { label: `${d.getMonth() + 1}/${d.getDate()}`, start, end, signups: 0, active: 0 }
  })
  const place = (iso: string | null | undefined, key: 'signups' | 'active') => {
    if (!iso) return
    const t = new Date(iso).getTime()
    for (const b of buckets) {
      if (t > b.start && t <= b.end) {
        b[key]++
        break
      }
    }
  }

  const [usersRes, profilesRes, pendingRes, openFb, commentsCount, votesCount, resourcesApproved] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('profiles').select('id, username, full_name, role'),
    admin.from('resources').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('feedback').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    admin.from('comments').select('id', { count: 'exact', head: true }),
    admin.from('resource_votes').select('id', { count: 'exact', head: true }),
    admin.from('resources').select('id', { count: 'exact', head: true }).eq('status', 'approved')
  ])

  const users = usersRes.data?.users ?? []
  const profileById = new Map((profilesRes.data ?? []).map(p => [p.id, p]))

  for (const u of users) {
    place(u.created_at, 'signups')
    place(u.last_sign_in_at, 'active')
  }

  const nameFor = (id: string, email?: string | null) => {
    const p = profileById.get(id)
    return p?.full_name || p?.username || email?.split('@')[0] || 'Unknown'
  }

  const newUsers7d = users.filter(u => u.created_at && now - new Date(u.created_at).getTime() <= WEEK).length
  const activeUsers7d = users.filter(u => u.last_sign_in_at && now - new Date(u.last_sign_in_at).getTime() <= WEEK).length

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
    .slice(0, 8)
    .map(u => ({
      id: u.id,
      name: nameFor(u.id, u.email),
      email: u.email ?? null,
      isAdmin: profileById.get(u.id)?.role === 'admin',
      created_at: u.created_at ?? null,
      last_sign_in_at: u.last_sign_in_at ?? null
    }))

  return {
    stats: {
      totalUsers: users.length,
      newUsers7d,
      activeUsers7d,
      pendingResources: pendingRes.count ?? 0,
      openFeedback: openFb.count ?? 0,
      comments: commentsCount.count ?? 0,
      votes: votesCount.count ?? 0,
      approvedResources: resourcesApproved.count ?? 0
    },
    weekly: buckets.map(b => ({ label: b.label, signups: b.signups, active: b.active })),
    recentUsers
  }
})
