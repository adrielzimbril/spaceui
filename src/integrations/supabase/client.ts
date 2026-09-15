import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/integrations/supabase/types'

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  serviceRoleKey: process.env.NEXT_PRIVATE_SUPABASE_SECRET_KEY,
}

export const createClient = () => {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return null
  }
  return createBrowserClient<Database>(supabaseConfig.url, supabaseConfig.anonKey)
}

export const supabase =
  typeof window !== 'undefined' && supabaseConfig.url && supabaseConfig.anonKey
    ? createBrowserClient<Database>(supabaseConfig.url, supabaseConfig.anonKey)
    : null
