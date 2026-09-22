import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Instancié à la première utilisation (pas au chargement du module) pour ne
// pas casser la collecte des données de page au build si les env vars ne
// sont pas encore résolues à ce moment-là.
let client: SupabaseClient | undefined

function getSupabase(): SupabaseClient {
  if (!client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    // Les tables du Forecast tool / agenda vivent dans forecast_agenda, pas
    // public — schéma partagé avec d'autres outils F26 sur le même projet
    // Supabase. Nécessite 'forecast_agenda' dans les Exposed schemas de la
    // Data API et un GRANT USAGE ON SCHEMA forecast_agenda TO anon,
    // authenticated (un nouveau schéma n'hérite pas de ces droits par
    // défaut, contrairement à public).
    client = createClient(supabaseUrl, supabaseAnonKey, {
      db: { schema: 'forecast_agenda' },
    })
  }
  return client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabase(), prop, receiver)
  },
})
