import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Affichage explicite en console + à l'écran pour ne pas planter silencieusement
  // eslint-disable-next-line no-console
  console.error(
    '[Sterkte Records] Variables Supabase manquantes. ' +
    'Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans votre environnement Vercel.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://missing.supabase.co',
  supabaseAnonKey || 'missing-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
