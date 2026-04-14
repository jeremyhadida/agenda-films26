export interface Country {
  id: string      // code ISO ex: 'ci', 'sn', 'ma'
  name: string
  region: string
}

export interface Film {
  id: string      // slug ex: 'neon-phantoms-2024'
  title: string
  studio: string | null
  release_date: string | null
  director: string | null
  cast_main: string | null
  synopsis: string | null
  genre: string | null
  poster_url: string | null
  trailer_url: string | null
  material_url: string | null
  duration_min: number | null
  projection_fmt: string | null   // '2D' | '3D' | 'IMAX' | '4DX'
  audio_mix: string | null        // 'Dolby Atmos' | 'DTS' | 'Stéréo'
  nationality: string | null
}

export interface FilmRelease {
  film_id: string
  country_id: string
  release_date: string
  film?: Film
}

export interface FilmReleaseEvent {
  id: string
  film_id: string
  country_id: string
  event_type: 'added' | 'date_changed' | 'removed'
  old_date: string | null
  new_date: string | null
  visible: boolean
  occurred_at: string
  film?: Film
}

export interface WeekGroup {
  isoWeek: number
  label: string           // ex: "SEMAINE 16 — 14 avr 2026"
  startDate: string       // ISO date du lundi de la semaine
  films: (Film & { release_date: string })[]
}
