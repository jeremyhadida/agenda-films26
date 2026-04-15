import { unstable_cache } from 'next/cache'
import { supabase } from './supabase'
import type { Country, Film, FilmReleaseEvent } from './types'

export const getActiveCountries = unstable_cache(
  async (): Promise<Country[]> => {
    const { data, error } = await supabase
      .from('countries')
      .select('id, name, region, film_releases!inner(film_id)')
      .order('name')
    if (error) throw error
    return (data ?? []).map(({ film_releases: _, ...c }) => c) as Country[]
  },
  ['active-countries'],
  { revalidate: 3600 }
)

export const getAgendaByCountry = unstable_cache(
  async (countryId: string): Promise<(Film & { release_date: string })[]> => {
    const { data, error } = await supabase
      .from('film_releases')
      .select(`
        release_date,
        films (
          id, title, studio, director, cast_main, synopsis, genre,
          poster_url, trailer_url, material_url, duration_min,
          projection_fmt, audio_mix, nationality
        )
      `)
      .eq('country_id', countryId)
      .order('release_date', { ascending: true })
    if (error) throw error
    return (data ?? []).map((r: any) => ({
      ...r.films,
      release_date: r.release_date,
    }))
  },
  ['agenda-by-country'],
  { revalidate: 3600, tags: ['agenda'] }
)

export const getFilmBySlug = unstable_cache(
  async (slug: string, countryId: string): Promise<(Film & { release_date: string }) | null> => {
    const { data, error } = await supabase
      .from('film_releases')
      .select(`
        release_date,
        films (
          id, title, studio, director, cast_main, synopsis, genre,
          poster_url, trailer_url, material_url, duration_min,
          projection_fmt, audio_mix, nationality
        )
      `)
      .eq('country_id', countryId)
      .eq('film_id', slug)
      .single()
    if (error) return null
    if (!data) return null
    return { ...(data as any).films, release_date: (data as any).release_date }
  },
  ['film-by-slug'],
  { revalidate: 3600, tags: ['films'] }
)

export const getMovementsByCountry = unstable_cache(
  async (countryId: string): Promise<(FilmReleaseEvent & { film: Film })[]> => {
    const { data, error } = await supabase
      .from('film_release_events')
      .select(`
        id, film_id, country_id, event_type, old_date, new_date, visible, occurred_at,
        films ( id, title, poster_url, genre )
      `)
      .eq('country_id', countryId)
      .eq('visible', true)
      .order('occurred_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return (data ?? []).map((e: any) => ({
      ...e,
      film: e.films,
    }))
  },
  ['mouvements-by-country'],
  { revalidate: 1800, tags: ['mouvements'] }
)
