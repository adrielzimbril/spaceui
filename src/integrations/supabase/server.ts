import { createServerClient } from '@supabase/ssr'
import { Database } from '@/integrations/supabase/types'
import { supabaseConfig } from '@/integrations/supabase/client'

export const createClient = (cookieStore?: any) => {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return null
  }
  return createServerClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return cookieStore ? cookieStore.getAll() : []
      },
      setAll(cookiesToSet) {
        try {
          if (cookieStore) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          }
        } catch {
          // Can be ignored if called from Server Component
        }
      },
    },
  })
}

export const createAdminClient = () => {
  if (!supabaseConfig.url || !supabaseConfig.serviceRoleKey) {
    return null
  }
  return createServerClient<Database>(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {
        // No-op for admin client
      },
    },
  })
}
