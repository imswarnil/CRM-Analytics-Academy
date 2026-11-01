#!/usr/bin/env node
/**
 * Creates the Academy's Stripe products and prices (PRICES in
 * shared/utils/products.ts) — run it yourself, with your own key:
 *
 *   pnpm stripe:setup                 # products + prices (safe to re-run)
 *   pnpm stripe:setup --webhook       # also the customer portal and the webhook
 *
 * Reads STRIPE_SECRET_KEY from the environment or .env (use a sk_test_… key
 * first). Prices are matched by lookup_key: an unchanged price is left alone;
 * a changed amount creates a new price and moves the lookup_key onto it
 * (Stripe prices are immutable), so the site picks it up without a deploy.
 *
 * --webhook creates the endpoint https://crmanalytics.imswarnil.com/api/stripe/webhook
 * (or --url <url>) and prints its signing secret ONCE: store it with
 *   wrangler secret put STRIPE_WEBHOOK_SECRET
 */
import { readFileSync, existsSync } from 'node:fs'

if (!process.env.STRIPE_SECRET_KEY && existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^STRIPE_SECRET_KEY=['"]?([^'"\s]+)/)
    if (m) process.env.STRIPE_SECRET_KEY = m[1]
  }
}
const KEY = process.env.STRIPE_SECRET_KEY
if (!KEY) {
  console.error('Set STRIPE_SECRET_KEY (in .env or the environment) — a sk_test_… key first.')
  process.exit(1)
}
const mode = KEY.startsWith('sk_live_') ? 'LIVE' : 'TEST'
const args = process.argv.slice(2)
const urlAt = args.indexOf('--url')
const WEBHOOK_URL = urlAt >= 0 ? args[urlAt + 1] : 'https://crmanalytics.imswarnil.com/api/stripe/webhook'

// Mirror of PRICES in shared/utils/products.ts (kept in step by hand: two places, one review).
const PRODUCTS = [
  { id: 'crma_pro', name: 'CRM Analytics Academy Pro', description: 'Every Pro lesson, full exam review, no ads.', prices: [
    { key: 'crma_pro_monthly', usd: 15, interval: 'month' },
    { key: 'crma_pro_yearly', usd: 150, interval: 'year' }
  ] },
  { id: 'crma_team_seat', name: 'CRM Analytics Academy Team seat', description: 'Pro for one member of a team, per month.', prices: [
    { key: 'crma_team_seat_monthly', usd: 10, interval: 'month' }
  ] },
  { id: 'crma_sponsor', name: 'CRM Analytics Academy Sponsorship', description: 'A sitewide sponsor banner with tracked views and clicks.', prices: [
    { key: 'crma_sponsor_7d', usd: 99 },
    { key: 'crma_sponsor_30d', usd: 299 }
  ] }
]

function encode(params, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue
    const key = prefix ? `${prefix}[${k}]` : k
    if (Array.isArray(v)) v.forEach((item, i) => (typeof item === 'object' ? encode(item, `${key}[${i}]`, out) : out.append(`${key}[${i}]`, String(item))))
    else if (typeof v === 'object') encode(v, key, out)
    else out.append(key, String(v))
  }
  return out
}
async function stripe(method, path, params = {}) {
  const body = encode(params)
  const res = await fetch(`https://api.stripe.com/v1/${path}${method === 'GET' ? `?${body}` : ''}`, {
    method,
    headers: { 'authorization': `Bearer ${KEY}`, 'content-type': 'application/x-www-form-urlencoded', 'stripe-version': '2024-06-20' },
    body: method === 'GET' ? undefined : body
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`${path}: ${json.error?.message}`)
  return json
}

console.log(`Stripe ${mode} mode\n`)
for (const p of PRODUCTS) {
  let product
  try {
    product = await stripe('GET', `products/${p.id}`)
  } catch {
    product = await stripe('POST', 'products', { id: p.id, name: p.name, description: p.description })
    console.log(`+ product ${p.name}`)
  }
  for (const price of p.prices) {
    const existing = (await stripe('GET', 'prices', { lookup_keys: [price.key], active: true, limit: 1 })).data[0]
    const sameAmount = existing && existing.unit_amount === price.usd * 100 && (existing.recurring?.interval ?? null) === (price.interval ?? null)
    if (sameAmount) {
      console.log(`= ${price.key}  $${price.usd}${price.interval ? `/${price.interval}` : ''}`)
      continue
    }
    await stripe('POST', 'prices', {
      product: product.id, currency: 'usd', unit_amount: price.usd * 100, lookup_key: price.key, transfer_lookup_key: true,
      ...(price.interval ? { recurring: { interval: price.interval } } : {}), nickname: price.key
    })
    console.log(`${existing ? '~' : '+'} ${price.key}  $${price.usd}${price.interval ? `/${price.interval}` : ''}`)
  }
}

if (args.includes('--webhook')) {
  const proPrices = (await stripe('GET', 'prices', { lookup_keys: ['crma_pro_monthly', 'crma_pro_yearly'], active: true })).data
  const portal = await stripe('POST', 'billing_portal/configurations', {
    business_profile: { headline: 'CRM Analytics Academy — manage your plan' },
    features: {
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      customer_update: { enabled: true, allowed_updates: ['email', 'address', 'tax_id'] },
      subscription_cancel: { enabled: true, mode: 'at_period_end' },
      subscription_update: { enabled: true, default_allowed_updates: ['price', 'quantity'], proration_behavior: 'create_prorations', products: [{ product: 'crma_pro', prices: proPrices.map(p => p.id) }] }
    },
    default_return_url: WEBHOOK_URL.replace(/\/api\/stripe\/webhook$/, '/dashboard')
  })
  console.log(`\n+ customer portal configuration ${portal.id} (set it as default in the dashboard if it is not)`)
  const hook = await stripe('POST', 'webhook_endpoints', {
    url: WEBHOOK_URL,
    enabled_events: ['checkout.session.completed', 'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted', 'invoice.paid'],
    description: 'CRM Analytics Academy'
  })
  console.log(`+ webhook ${hook.url}`)
  console.log('\nStore this signing secret now (it is shown once):')
  console.log(`  ${hook.secret}`)
  console.log('  → wrangler secret put STRIPE_WEBHOOK_SECRET   (and add it to .env for local testing)')
}
console.log('\nDone.')
