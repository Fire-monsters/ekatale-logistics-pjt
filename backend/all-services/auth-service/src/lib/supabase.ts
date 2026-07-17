import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('⚠️ Supabase credentials are not configured. Consumer auth endpoints will fail until SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.')
}

export const supabaseAdmin = createClient(supabaseUrl ?? 'https://placeholder.supabase.co', supabaseServiceRoleKey ?? 'placeholder-key', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
