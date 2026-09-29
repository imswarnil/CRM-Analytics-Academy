import { redirect } from 'next/navigation'

/** There is no front end here — the site is the Nuxt app one folder up. */
export default function Home() {
  redirect('/admin')
}
