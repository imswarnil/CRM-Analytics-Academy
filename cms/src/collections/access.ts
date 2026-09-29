import type { Access } from 'payload'

/**
 * Everything here is authoring data. The site never reads Payload at runtime —
 * `pnpm content:pull` writes it out as markdown — so nothing needs to be public.
 */
export const signedIn: Access = ({ req }) => Boolean(req.user)
export const staffOnly = { read: signedIn, create: signedIn, update: signedIn, delete: signedIn }
