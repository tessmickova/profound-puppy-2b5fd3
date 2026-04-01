// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export function createSupabaseBrowser() {
  if (!url || !anon) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return createClient<Database>(url, anon)
}

export function createSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

let _browserClient: ReturnType<typeof createSupabaseBrowser> | null = null
export function supabase() {
  if (!_browserClient) {
    if (!url || !anon) throw new Error('Missing Supabase env vars for browser client')
    _browserClient = createSupabaseBrowser()
  }
  return _browserClient
}
