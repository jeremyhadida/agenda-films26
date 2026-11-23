import { unstable_cache } from 'next/cache'
import { supabase } from './supabase'
import type { Country, Film, FilmReleaseEvent } from './types'

const AGENDA_STATUSES = ['validated', 'nego']

// Une seule durée de cache pour TOUTES les requêtes : agenda et mouvements
// doivent être rafraîchis ensemble, sinon le bandeau "Derniers mouvements"
// annonce des films (ex. sorties 2027) absents de la frise agenda.
// ⚠️ Ne jamais passer `false` : pour unstable_cache, false = cache INDÉFINI
// (persisté dans .next/cache), ce qui figeait les données en dev.
// Garder en phase avec `export const revalidate` des pages (valeur littérale).
const REVALIDATE = process.env.NODE_ENV === 'development' ? 1 : 300

// Versions « fetch* » : lisent la base directement, sans cache. Réservées à la route PDF
// (jointe à la newsletter juste après une modification de dates : elle doit être à jour).
// Les pages publiques, elles, passent par les versions en cache ci-dessous (5 min).
export async function fetchActiveCountries(): Promise<Country[]> {
  const { data, error } = await supabase
    .from('countries')
    .select('id, name, region, film_releases!inner(film_id)')
    .order('name')
  if (error) throw error
  return (data ?? []).map(({ film_releases: _, ...c }) => c) as Country[]
}

export const getActiveCountries = unstable_cache(
  fetchActiveCountries,
  ['active-countries-v2'],
  { revalidate: REVALIDATE }
)

const FILMS_SELECT = `
  id, title, title_vf, studio, director, cast_main, synopsis, genre,
  poster_url, trailer_url, material_url, duration_min,
  projection_fmt, audio_mix, nationality, status
`

export async function fetchAgendaByCountry(countryId: string): Promise<(Film & { release_date: string })[]> {
  const { data, error } = await supabase
    .from('film_releases')
    .select(`release_date, films ( ${FILMS_SELECT} )`)
    .eq('country_id', countryId)
    .order('release_date', { ascending: true })
  if (error) throw error
  return (data ?? [])
    .map((r: any) => ({ ...r.films, release_date: r.release_date }))
    .filter((f: any) => AGENDA_STATUSES.includes(f.status))
}

export const getAgendaByCountry = unstable_cache(
  fetchAgendaByCountry,
  ['agenda-by-country-v2'],
  { revalidate: REVALIDATE, tags: ['agenda'] }
)

export const getAgendaByCountryMaster = unstable_cache(
  async (countryId: string): Promise<(Film & { release_date: string })[]> => {
    const { data, error } = await supabase
      .from('film_releases')
      .select(`release_date, films ( ${FILMS_SELECT} )`)
      .eq('country_id', countryId)
      .order('release_date', { ascending: true })
    if (error) throw error
    return (data ?? [])
      .map((r: any) => ({ ...r.films, release_date: r.release_date }))
      .filter((f: any) => f.status !== 'cancelled')
  },
  ['agenda-master-by-country-v2'],
  { revalidate: REVALIDATE, tags: ['agenda'] }
)

export const getFilmBySlug = unstable_cache(
  async (slug: string, countryId: string): Promise<(Film & { release_date: string }) | null> => {
    const { data, error } = await supabase
      .from('film_releases')
      .select(`release_date, films ( ${FILMS_SELECT} )`)
      .eq('country_id', countryId)
      .eq('film_id', slug)
      .single()
    if (error) return null
    if (!data) return null
    return { ...(data as any).films, release_date: (data as any).release_date }
  },
  ['film-by-slug-v2'],
  { revalidate: REVALIDATE, tags: ['films'] }
)

const MOVEMENTS_SELECT = `
  id, film_id, country_id, event_type, old_date, new_date, visible, occurred_at,
  films ( id, title, title_vf, poster_url, genre, status )
`

// onlyUnsent : ne garde que les mouvements pas encore envoyés par newsletter (send_id vide,
// colonne tenue par le Forecast tool). Sert au PDF joint au mail : il doit refléter le corps
// du mail, donc ne rien afficher quand tout a déjà été envoyé.
export async function fetchMovementsByCountry(
  countryId: string,
  options: { onlyUnsent?: boolean } = {},
): Promise<(FilmReleaseEvent & { film: Film })[]> {
  let query = supabase
    .from('film_release_events')
    .select(MOVEMENTS_SELECT)
    .eq('country_id', countryId)
    .eq('visible', true)
  if (options.onlyUnsent) query = query.is('send_id', null)
  const { data, error } = await query
    .order('occurred_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? [])
    .map((e: any) => ({ ...e, film: e.films }))
    .filter((e: any) => AGENDA_STATUSES.includes(e.film?.status))
}

export const getMovementsByCountry = unstable_cache(
  fetchMovementsByCountry,
  ['mouvements-by-country-v2'],
  { revalidate: REVALIDATE, tags: ['mouvements'] }
)

export const getMovementsByCountryMaster = unstable_cache(
  async (countryId: string): Promise<(FilmReleaseEvent & { film: Film })[]> => {
    const { data, error } = await supabase
      .from('film_release_events')
      .select(MOVEMENTS_SELECT)
      .eq('country_id', countryId)
      .eq('visible', true)
      .order('occurred_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return (data ?? [])
      .map((e: any) => ({ ...e, film: e.films }))
      .filter((e: any) => e.film?.status !== 'cancelled')
  },
  ['mouvements-master-by-country-v2'],
  { revalidate: REVALIDATE, tags: ['mouvements'] }
)
