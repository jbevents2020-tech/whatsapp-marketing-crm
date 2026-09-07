import { createClient } from '@supabase/supabase-js'

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

function normalizeSupabaseUrl(value?: string){
  if(!value) return ''
  try{
    const url = new URL(value)
    return url.origin
  }catch{
    return value.replace(/\/+$/,'')
  }
}

const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl)

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
