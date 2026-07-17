import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Instancié à la première utilisation (pas au chargement du module) pour ne
// pas casser la collecte des données de page au build si les env vars ne
// sont pas encore résolues à ce moment-là.
let client: SupabaseClient | undefined

function getSupabase(): SupabaseClient {
  if (!client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    client = createClient(supabaseUrl, supabaseAnonKey)
  }
  return client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabase(), prop, receiver)
  },
})
