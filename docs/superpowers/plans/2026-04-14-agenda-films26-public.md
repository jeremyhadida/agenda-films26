# Agenda Films26 — Plateforme Publique B2B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire la plateforme publique read-only agenda.films26.com : sélecteur de pays, agenda hebdomadaire, fiche film, feed de mouvements — design "Marquee Pro" dark navy / or.

**Architecture:** Hybrid ISR — les 20 pages pays sont pré-générées via `generateStaticParams` (revalidate 3600s), les fiches films sont générées à la demande (ISR), les mouvements en SSR. Toutes les requêtes Supabase sont wrappées dans `unstable_cache`. `params` est une Promise en Next.js 16 → toujours `await params`.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, Supabase JS, React 19, TypeScript, Vitest

---

## Fichiers créés / modifiés

| Fichier | Action | Rôle |
|---|---|---|
| `.env.local` | Créer | Clés Supabase |
| `src/app/globals.css` | Modifier | Tokens Marquee Pro via `@theme` |
| `src/app/layout.tsx` | Modifier | Fonts Manrope+Inter, bg surface |
| `src/lib/types.ts` | Créer | Types TS partagés |
| `src/lib/supabase.ts` | Créer | Client Supabase anon |
| `src/lib/utils.ts` | Créer | isoWeek, groupByWeek, formatDate |
| `src/lib/queries.ts` | Créer | Requêtes Supabase cachées |
| `src/components/layout/Header.tsx` | Créer | Logo + CountrySelector |
| `src/components/layout/Footer.tsx` | Créer | Footer minimal |
| `src/components/layout/BottomNav.tsx` | Créer | Nav mobile fixe (Agenda + Mouvements) |
| `src/components/agenda/FilmCard.tsx` | Créer | Carte film desktop vertical + mobile horizontal |
| `src/components/agenda/WeekSection.tsx` | Créer | Section semaine avec grille films |
| `src/components/agenda/MonthTabs.tsx` | Créer | Tabs mois sticky + scroll-spy (Client) |
| `src/components/film/HeroSection.tsx` | Créer | Hero image + titre overlay |
| `src/components/film/TechInfo.tsx` | Créer | Format / Mix Audio / Nationalité |
| `src/components/film/CastGrid.tsx` | Créer | Grid photos casting |
| `src/components/mouvements/EventCard.tsx` | Créer | Carte événement |
| `src/components/mouvements/EventFeed.tsx` | Créer | Feed liste événements |
| `src/app/page.tsx` | Modifier | Sélecteur de pays (statique) |
| `src/app/[pays]/page.tsx` | Créer | Agenda hebdo (ISR 3600s) |
| `src/app/[pays]/films/[slug]/page.tsx` | Créer | Fiche film (ISR 3600s) |
| `src/app/[pays]/mouvements/page.tsx` | Créer | Feed mouvements (SSR 1800s) |
| `src/lib/utils.test.ts` | Créer | Tests Vitest pour utils |

---

## Task 1: Variables d'environnement + dépendances

**Files:**
- Create: `.env.local`
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Installer @supabase/supabase-js**

```bash
cd "agenda-films26"
npm install @supabase/supabase-js
```

Expected: `added 1 package` (ou similaire), pas d'erreur.

- [ ] **Step 2: Installer Vitest pour les tests utilitaires**

```bash
npm install -D vitest @vitejs/plugin-react
```

- [ ] **Step 3: Créer `.env.local`**

Copier les valeurs depuis le `.env` du repo `antigravity-forecast` :

```env
NEXT_PUBLIC_SUPABASE_URL=<valeur depuis antigravity-forecast/.env>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<valeur depuis antigravity-forecast/.env>
```

- [ ] **Step 4: Ajouter le script de test dans `package.json`**

Ouvrir `package.json` et ajouter dans `"scripts"` :

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Créer `vitest.config.ts` à la racine**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts .gitignore
git commit -m "chore: add supabase, vitest deps and env setup"
```

Note : ne jamais committer `.env.local` (déjà dans `.gitignore` par défaut de Next.js).

---

## Task 2: Design system — tokens Tailwind v4

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

> **Important Tailwind v4 :** Les tokens custom se définissent dans `globals.css` via la directive `@theme`, pas dans `tailwind.config.ts`.

- [ ] **Step 1: Remplacer `src/app/globals.css`**

```css
@import "tailwindcss";

@theme {
  /* Surfaces */
  --color-surface: #021232;
  --color-surface-low: #0a1a3a;
  --color-surface-card: #263455;

  /* Gold */
  --color-gold: #ffd700;
  --color-gold-dim: #e9c400;
  --color-gold-light: #ffe16d;

  /* Text */
  --color-text: #fff6df;
  --color-muted: #d0c6ab;

  /* Chips genre */
  --color-chip-bg: #544601;
  --color-chip-text: #c9b468;

  /* Tags techniques */
  --color-cyan: #defcff;

  /* Fonts */
  --font-display: var(--font-manrope);
  --font-body: var(--font-inter);

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
}

* {
  box-sizing: border-box;
}

body {
  background-color: var(--color-surface);
  color: var(--color-text);
  font-family: var(--font-body), sans-serif;
}
```

- [ ] **Step 2: Mettre à jour `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Manrope, Inter } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Agenda Films26',
  description: 'Agenda hebdomadaire des sorties cinéma en Afrique Francophone',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${manrope.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Vérifier le build TypeScript**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: design system Marquee Pro tokens + fonts"
```

---

## Task 3: Types TypeScript partagés

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Créer `src/lib/types.ts`**

```ts
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
```

- [ ] **Step 2: Vérifier la compilation**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: shared TypeScript types"
```

---

## Task 4: Fonctions utilitaires + tests

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/lib/utils.test.ts`

- [ ] **Step 1: Écrire les tests en premier (`src/lib/utils.test.ts`)**

```ts
import { describe, it, expect } from 'vitest'
import { getIsoWeek, getWeekMonday, formatWeekLabel, formatDate, groupFilmsByWeek } from './utils'

describe('getIsoWeek', () => {
  it('returns ISO week number for a known date', () => {
    // 2026-04-14 est en semaine 16
    expect(getIsoWeek('2026-04-14')).toBe(16)
  })
  it('returns correct week for first week of year', () => {
    // 2026-01-05 est en semaine 2
    expect(getIsoWeek('2026-01-05')).toBe(2)
  })
})

describe('getWeekMonday', () => {
  it('returns the monday of a given ISO week', () => {
    expect(getWeekMonday(2026, 16)).toBe('2026-04-13')
  })
})

describe('formatWeekLabel', () => {
  it('formats week label in French', () => {
    expect(formatWeekLabel(16, '2026-04-13')).toBe('SEMAINE 16 — 13 avr 2026')
  })
})

describe('formatDate', () => {
  it('formats date in French short format', () => {
    expect(formatDate('2026-04-14')).toBe('14 avr 2026')
  })
})

describe('groupFilmsByWeek', () => {
  it('groups films by ISO week', () => {
    const films = [
      { id: 'film-a', title: 'Film A', release_date: '2026-04-14' },
      { id: 'film-b', title: 'Film B', release_date: '2026-04-15' },
      { id: 'film-c', title: 'Film C', release_date: '2026-04-21' },
    ] as any[]
    const groups = groupFilmsByWeek(films)
    expect(groups).toHaveLength(2)
    expect(groups[0].isoWeek).toBe(16)
    expect(groups[0].films).toHaveLength(2)
    expect(groups[1].isoWeek).toBe(17)
    expect(groups[1].films).toHaveLength(1)
  })

  it('returns empty array for empty input', () => {
    expect(groupFilmsByWeek([])).toEqual([])
  })
})
```

- [ ] **Step 2: Exécuter les tests — vérifier qu'ils échouent**

```bash
npm test
```

Expected: FAIL — "Cannot find module './utils'"

- [ ] **Step 3: Implémenter `src/lib/utils.ts`**

```ts
import type { Film, WeekGroup } from './types'

/**
 * Retourne le numéro de semaine ISO (1–53) pour une date ISO string.
 */
export function getIsoWeek(dateStr: string): number {
  const date = new Date(dateStr)
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

/**
 * Retourne la date ISO du lundi d'une semaine ISO donnée.
 */
export function getWeekMonday(year: number, isoWeek: number): string {
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const dayOfWeek = jan4.getUTCDay() || 7
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1 + (isoWeek - 1) * 7)
  return monday.toISOString().split('T')[0]
}

const FR_MONTHS = ['jan', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc']

/**
 * Formate un label de semaine : "SEMAINE 16 — 13 avr 2026"
 */
export function formatWeekLabel(isoWeek: number, mondayDate: string): string {
  const d = new Date(mondayDate + 'T00:00:00Z')
  const day = d.getUTCDate()
  const month = FR_MONTHS[d.getUTCMonth()]
  const year = d.getUTCFullYear()
  return `SEMAINE ${isoWeek} — ${day} ${month} ${year}`
}

/**
 * Formate une date ISO en "14 avr 2026"
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  return `${d.getUTCDate()} ${FR_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/**
 * Groupe une liste de films (avec release_date) par semaine ISO, triés chronologiquement.
 */
export function groupFilmsByWeek(
  films: (Film & { release_date: string })[]
): WeekGroup[] {
  if (films.length === 0) return []

  const weekMap = new Map<number, WeekGroup>()

  for (const film of films) {
    const week = getIsoWeek(film.release_date)
    if (!weekMap.has(week)) {
      const year = new Date(film.release_date).getFullYear()
      const monday = getWeekMonday(year, week)
      weekMap.set(week, {
        isoWeek: week,
        label: formatWeekLabel(week, monday),
        startDate: monday,
        films: [],
      })
    }
    weekMap.get(week)!.films.push(film)
  }

  return Array.from(weekMap.values()).sort((a, b) => a.isoWeek - b.isoWeek)
}
```

- [ ] **Step 4: Exécuter les tests — vérifier qu'ils passent**

```bash
npm test
```

Expected: toutes les suites PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils.ts src/lib/utils.test.ts vitest.config.ts
git commit -m "feat: utility functions (isoWeek, groupByWeek, formatDate) with tests"
```

---

## Task 5: Client Supabase + requêtes cachées

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/lib/queries.ts`

- [ ] **Step 1: Créer `src/lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 2: Créer `src/lib/queries.ts`**

```ts
import { unstable_cache } from 'next/cache'
import { supabase } from './supabase'
import type { Country, Film, FilmReleaseEvent } from './types'

/**
 * Retourne les pays actifs (ayant au moins une film_release).
 * Utilisé pour generateStaticParams et le sélecteur.
 */
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

/**
 * Retourne tous les films d'un pays avec leur release_date, triés par date.
 * Utilisé pour construire l'agenda.
 */
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
  ['agenda'],
  { revalidate: 3600, tags: ['agenda'] }
)

/**
 * Retourne un film par son id (slug) avec sa release_date dans un pays donné.
 */
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
  ['film'],
  { revalidate: 3600, tags: ['films'] }
)

/**
 * Retourne les événements visibles d'un pays, triés du plus récent au plus ancien.
 */
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
  ['mouvements'],
  { revalidate: 1800, tags: ['mouvements'] }
)
```

- [ ] **Step 3: Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase.ts src/lib/queries.ts
git commit -m "feat: Supabase client + cached queries (agenda, film, mouvements, countries)"
```

---

## Task 6: Composants layout (Header, Footer, BottomNav)

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/BottomNav.tsx`

- [ ] **Step 1: Créer `src/components/layout/Header.tsx`**

```tsx
import Link from 'next/link'
import type { Country } from '@/lib/types'

interface HeaderProps {
  countries: Country[]
  currentCountryId?: string
}

export function Header({ countries, currentCountryId }: HeaderProps) {
  const current = countries.find(c => c.id === currentCountryId)

  return (
    <header className="sticky top-0 z-50 bg-surface-low/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-gold text-lg tracking-tight">
          FILMS 26
        </Link>

        {current && (
          <div className="flex items-center gap-3">
            <span className="text-muted text-sm font-body">{current.name}</span>
            <Link
              href="/"
              className="text-xs text-gold-dim hover:text-gold font-body transition-colors"
            >
              Changer ▾
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Créer `src/components/layout/Footer.tsx`**

```tsx
export function Footer() {
  return (
    <footer className="bg-surface-low mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <span className="font-display font-bold text-gold text-sm">FILMS 26</span>
        <span className="text-muted text-xs font-body">
          © {new Date().getFullYear()} Metropolitan Filmexport
        </span>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Créer `src/components/layout/BottomNav.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BottomNavProps {
  paysId: string
}

export function BottomNav({ paysId }: BottomNavProps) {
  const pathname = usePathname()
  const isAgenda = !pathname.includes('/mouvements')
  const isMouvements = pathname.includes('/mouvements')

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-low/70 backdrop-blur-xl md:hidden border-t border-surface-card">
      <div className="flex">
        <Link
          href={`/${paysId}`}
          className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-body transition-colors ${
            isAgenda ? 'text-text' : 'text-muted'
          }`}
        >
          <span className="text-lg">📅</span>
          <span>Agenda</span>
          {isAgenda && <span className="w-1 h-1 bg-gold rounded-full" />}
        </Link>

        <Link
          href={`/${paysId}/mouvements`}
          className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-body transition-colors ${
            isMouvements ? 'text-text' : 'text-muted'
          }`}
        >
          <span className="text-lg">📰</span>
          <span>Mouvements</span>
          {isMouvements && <span className="w-1 h-1 bg-gold rounded-full" />}
        </Link>
      </div>
    </nav>
  )
}
```

- [ ] **Step 4: Vérifier la compilation**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/
git commit -m "feat: Header, Footer, BottomNav components"
```

---

## Task 7: Page sélecteur de pays (`/`)

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Remplacer `src/app/page.tsx`**

```tsx
import Link from 'next/link'
import { getActiveCountries } from '@/lib/queries'
import type { Country } from '@/lib/types'

const REGIONS: Record<string, string> = {
  'Maghreb': 'Maghreb',
  'Ouest XOF': 'Afrique de l\'Ouest',
  'Centrale XAF': 'Afrique Centrale',
  'Autres': 'Autres',
}

export const dynamic = 'force-static'

export default async function HomePage() {
  const countries = await getActiveCountries()

  const byRegion = countries.reduce<Record<string, Country[]>>((acc, c) => {
    const region = c.region ?? 'Autres'
    if (!acc[region]) acc[region] = []
    acc[region].push(c)
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-display text-5xl font-bold text-gold mb-2 tracking-tight">
          FILMS 26
        </h1>
        <p className="font-body text-muted mb-12">
          Agenda des sorties cinéma en Afrique Francophone
        </p>

        <div className="space-y-10">
          {Object.entries(byRegion).map(([region, pays]) => (
            <div key={region}>
              <h2 className="font-body text-xs uppercase tracking-widest text-muted mb-4">
                {REGIONS[region] ?? region}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pays.map((country) => (
                  <Link
                    key={country.id}
                    href={`/${country.id}`}
                    className="bg-surface-card rounded-lg px-4 py-3 hover:scale-[1.02] transition-transform"
                  >
                    <span className="font-display font-semibold text-text">
                      {country.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Lancer le serveur de dev et vérifier la page**

```bash
npm run dev
```

Ouvrir http://localhost:3000 — la liste des pays doit s'afficher groupée par région.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: country selector page (/)"
```

---

## Task 8: Composant `FilmCard`

**Files:**
- Create: `src/components/agenda/FilmCard.tsx`

- [ ] **Step 1: Créer `src/components/agenda/FilmCard.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import type { Film } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface FilmCardProps {
  film: Film & { release_date: string }
  paysId: string
  variant?: 'desktop' | 'mobile'
}

export function FilmCard({ film, paysId, variant = 'desktop' }: FilmCardProps) {
  const href = `/${paysId}/films/${film.id}`

  const techTags = [film.projection_fmt, film.audio_mix].filter(Boolean)
  const isTechnical = (tag: string) =>
    ['IMAX', '3D', '4DX', 'Dolby Atmos', 'ATMOS'].some(t => tag.toUpperCase().includes(t.toUpperCase()))

  if (variant === 'mobile') {
    return (
      <Link href={href} className="flex gap-3 p-3 bg-surface-card rounded-lg hover:scale-[1.02] transition-transform">
        <div className="w-16 h-24 rounded-md overflow-hidden flex-shrink-0 bg-surface-low relative">
          {film.poster_url ? (
            <Image src={film.poster_url} alt={film.title} fill className="object-cover" sizes="64px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted text-2xl">🎬</div>
          )}
        </div>
        <div className="flex-1 min-w-0 py-1">
          <h3 className="font-display font-semibold text-text text-sm leading-tight mb-1 truncate">
            {film.title}
          </h3>
          {film.director && (
            <p className="text-muted text-xs font-body mb-2 truncate">{film.director}</p>
          )}
          <div className="flex flex-wrap gap-1">
            {film.genre && (
              <span className="bg-chip-bg text-chip-text rounded-full text-xs px-2 py-0.5 font-body">
                {film.genre}
              </span>
            )}
            {film.duration_min && (
              <span className="bg-surface-low text-muted rounded-md text-xs px-2 py-0.5 font-body">
                {Math.floor(film.duration_min / 60)}h{String(film.duration_min % 60).padStart(2, '0')}
              </span>
            )}
            {techTags.map(tag => (
              <span key={tag} className={`rounded-md text-xs px-2 py-0.5 font-body ${isTechnical(tag!) ? 'text-cyan bg-surface-low' : 'bg-surface-low text-muted'}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    )
  }

  // Desktop variant (vertical)
  return (
    <Link href={href} className="bg-surface-card rounded-lg overflow-hidden hover:scale-[1.02] transition-transform duration-200 group block">
      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-surface-low">
        {film.poster_url ? (
          <Image src={film.poster_url} alt={film.title} fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-4xl">🎬</div>
        )}
        {film.projection_fmt && (
          <span className="absolute top-2 right-2 bg-surface-card/80 text-cyan text-xs px-2 py-0.5 rounded-md font-body">
            {film.projection_fmt}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-display font-semibold text-text text-sm leading-tight mb-1 line-clamp-2">
          {film.title}
        </h3>
        <p className="text-muted text-xs font-body mb-2">{formatDate(film.release_date)}</p>
        <div className="flex flex-wrap gap-1">
          {film.genre && (
            <span className="bg-chip-bg text-chip-text rounded-full text-xs px-2 py-0.5 font-body">
              {film.genre}
            </span>
          )}
          {film.duration_min && (
            <span className="bg-surface-low text-muted rounded-md text-xs px-2 py-0.5 font-body">
              {Math.floor(film.duration_min / 60)}h{String(film.duration_min % 60).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/agenda/FilmCard.tsx
git commit -m "feat: FilmCard component (desktop vertical + mobile horizontal)"
```

---

## Task 9: Composants agenda (MonthTabs + WeekSection)

**Files:**
- Create: `src/components/agenda/MonthTabs.tsx`
- Create: `src/components/agenda/WeekSection.tsx`

- [ ] **Step 1: Créer `src/components/agenda/WeekSection.tsx`**

```tsx
import type { WeekGroup } from '@/lib/types'
import { FilmCard } from './FilmCard'

interface WeekSectionProps {
  group: WeekGroup
  paysId: string
}

export function WeekSection({ group, paysId }: WeekSectionProps) {
  return (
    <section id={`week-${group.isoWeek}`} className="scroll-mt-28">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-gold text-sm tracking-wide">
          {group.label}
        </h2>
        <span className="bg-surface-card text-muted text-xs font-body px-3 py-1 rounded-full">
          {group.films.length} {group.films.length > 1 ? 'SORTIES' : 'SORTIE'}
        </span>
      </div>

      {/* Desktop: grille */}
      <div className="hidden md:grid grid-cols-5 lg:grid-cols-5 gap-4">
        {group.films.map(film => (
          <FilmCard key={film.id} film={film} paysId={paysId} variant="desktop" />
        ))}
      </div>

      {/* Mobile: liste */}
      <div className="md:hidden flex flex-col gap-2">
        {group.films.map(film => (
          <FilmCard key={film.id} film={film} paysId={paysId} variant="mobile" />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Créer `src/components/agenda/MonthTabs.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import type { WeekGroup } from '@/lib/types'

const FR_MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

interface MonthTabsProps {
  groups: WeekGroup[]
}

function getMonthFromDate(dateStr: string): number {
  return new Date(dateStr + 'T00:00:00Z').getUTCMonth()
}

function getUniqueMonths(groups: WeekGroup[]): { month: number; year: number; firstWeek: number }[] {
  const seen = new Set<string>()
  const result: { month: number; year: number; firstWeek: number }[] = []
  for (const group of groups) {
    const d = new Date(group.startDate + 'T00:00:00Z')
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`
    if (!seen.has(key)) {
      seen.add(key)
      result.push({ month: d.getUTCMonth(), year: d.getUTCFullYear(), firstWeek: group.isoWeek })
    }
  }
  return result
}

export function MonthTabs({ groups }: MonthTabsProps) {
  const months = getUniqueMonths(groups)
  const [activeWeek, setActiveWeek] = useState<number>(groups[0]?.isoWeek ?? 0)

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    for (const group of groups) {
      const el = document.getElementById(`week-${group.isoWeek}`)
      if (!el) continue
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveWeek(group.isoWeek) },
        { threshold: 0.3 }
      )
      obs.observe(el)
      observers.push(obs)
    }
    return () => observers.forEach(o => o.disconnect())
  }, [groups])

  function scrollToWeek(isoWeek: number) {
    document.getElementById(`week-${isoWeek}`)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Trouve le mois actif à partir de la semaine active
  const activeGroup = groups.find(g => g.isoWeek === activeWeek)
  const activeMonth = activeGroup ? getMonthFromDate(activeGroup.startDate) : months[0]?.month

  return (
    <div className="sticky top-14 z-40 bg-surface/80 backdrop-blur-xl py-2">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {months.map(({ month, year, firstWeek }) => (
            <button
              key={`${year}-${month}`}
              onClick={() => scrollToWeek(firstWeek)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-body transition-colors ${
                activeMonth === month
                  ? 'bg-gold text-surface font-semibold'
                  : 'text-muted hover:text-text'
              }`}
            >
              {FR_MONTHS[month]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Vérifier la compilation**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/agenda/
git commit -m "feat: WeekSection + MonthTabs components"
```

---

## Task 10: Page agenda `/[pays]`

**Files:**
- Create: `src/app/[pays]/page.tsx`

> **Next.js 16 :** `params` est une `Promise` — toujours utiliser `await params`.

- [ ] **Step 1: Créer `src/app/[pays]/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getActiveCountries, getAgendaByCountry } from '@/lib/queries'
import { groupFilmsByWeek } from '@/lib/utils'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { MonthTabs } from '@/components/agenda/MonthTabs'
import { WeekSection } from '@/components/agenda/WeekSection'

export const revalidate = 3600

export async function generateStaticParams() {
  const countries = await getActiveCountries()
  return countries.map(c => ({ pays: c.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pays: string }>
}): Promise<Metadata> {
  const { pays } = await params
  const countries = await getActiveCountries()
  const country = countries.find(c => c.id === pays)
  return {
    title: country ? `Agenda ${country.name} — Films 26` : 'Agenda Films 26',
  }
}

export default async function AgendaPage({
  params,
}: {
  params: Promise<{ pays: string }>
}) {
  const { pays } = await params
  const [countries, films] = await Promise.all([
    getActiveCountries(),
    getAgendaByCountry(pays),
  ])

  const country = countries.find(c => c.id === pays)
  if (!country) notFound()

  const groups = groupFilmsByWeek(films)

  return (
    <>
      <Header countries={countries} currentCountryId={pays} />
      <main className="max-w-7xl mx-auto px-4 pb-24 md:pb-8">
        {groups.length > 0 ? (
          <>
            <MonthTabs groups={groups} />
            <div className="mt-6 space-y-12">
              {groups.map(group => (
                <WeekSection key={group.isoWeek} group={group} paysId={pays} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <p className="font-display text-muted text-lg">
              Aucune sortie programmée pour le moment.
            </p>
          </div>
        )}
      </main>
      <Footer />
      <BottomNav paysId={pays} />
    </>
  )
}
```

- [ ] **Step 2: Lancer le dev et vérifier `/ci` ou `/sn`**

```bash
npm run dev
```

Ouvrir http://localhost:3000/ci — l'agenda doit afficher les semaines avec les films.

- [ ] **Step 3: Commit**

```bash
git add src/app/[pays]/
git commit -m "feat: agenda page /[pays] with ISR + MonthTabs + WeekSections"
```

---

## Task 11: Composants fiche film (Hero, TechInfo, CastGrid)

**Files:**
- Create: `src/components/film/HeroSection.tsx`
- Create: `src/components/film/TechInfo.tsx`
- Create: `src/components/film/CastGrid.tsx`

- [ ] **Step 1: Créer `src/components/film/HeroSection.tsx`**

```tsx
import Image from 'next/image'
import type { Film } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface HeroSectionProps {
  film: Film & { release_date: string }
}

export function HeroSection({ film }: HeroSectionProps) {
  return (
    <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
      {film.poster_url ? (
        <Image
          src={film.poster_url}
          alt={film.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      ) : (
        <div className="w-full h-full bg-surface-low flex items-center justify-center text-muted text-6xl">
          🎬
        </div>
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-3">
          {film.genre && (
            <span className="bg-chip-bg text-chip-text rounded-full text-xs px-3 py-1 font-body">
              {film.genre}
            </span>
          )}
          {film.projection_fmt && (
            <span className="text-cyan bg-surface-card/80 rounded-md text-xs px-3 py-1 font-body">
              {film.projection_fmt}
            </span>
          )}
        </div>

        <h1 className="font-display font-bold text-text text-4xl md:text-6xl leading-tight mb-2 tracking-tight">
          {film.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-muted text-sm font-body">
          {film.release_date && <span>Au cinéma à partir du {formatDate(film.release_date)}</span>}
          {film.duration_min && (
            <span>{Math.floor(film.duration_min / 60)}h{String(film.duration_min % 60).padStart(2, '0')}</span>
          )}
          {film.nationality && <span>{film.nationality}</span>}
        </div>

        {film.material_url && (
          <a
            href={film.material_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-gold to-gold-dim text-surface font-body font-semibold text-sm px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity"
          >
            ↓ Télécharger le matériel disponible
          </a>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Créer `src/components/film/TechInfo.tsx`**

```tsx
import type { Film } from '@/lib/types'

interface TechInfoProps {
  film: Film
}

export function TechInfo({ film }: TechInfoProps) {
  const items = [
    { label: 'Format', value: film.projection_fmt },
    { label: 'Mix Audio', value: film.audio_mix },
    { label: 'Nationalité', value: film.nationality },
    { label: 'Studio', value: film.studio },
  ].filter(i => i.value)

  if (items.length === 0) return null

  return (
    <div className="bg-surface-low rounded-xl p-5">
      <h3 className="font-body text-xs uppercase tracking-widest text-muted mb-4">
        Infos Techniques
      </h3>
      <div className="space-y-3">
        {items.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-muted text-xs font-body">{label}</span>
            <span className="text-cyan text-sm font-body font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Créer `src/components/film/CastGrid.tsx`**

```tsx
import type { Film } from '@/lib/types'

interface CastGridProps {
  film: Film
}

export function CastGrid({ film }: CastGridProps) {
  if (!film.cast_main && !film.director) return null

  // cast_main est une string séparée par des virgules
  const cast = film.cast_main
    ? film.cast_main.split(',').map(s => s.trim()).filter(Boolean)
    : []

  return (
    <div>
      {film.director && (
        <div className="mb-4">
          <span className="font-body text-xs uppercase tracking-widest text-muted">Réalisateur</span>
          <p className="font-display font-semibold text-text mt-1">{film.director}</p>
        </div>
      )}
      {cast.length > 0 && (
        <div>
          <span className="font-body text-xs uppercase tracking-widest text-muted">Avec</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {cast.map(name => (
              <span key={name} className="bg-surface-card text-text text-sm font-body px-3 py-1.5 rounded-lg">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Vérifier la compilation**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/film/
git commit -m "feat: HeroSection, TechInfo, CastGrid components"
```

---

## Task 12: Page fiche film `/[pays]/films/[slug]`

**Files:**
- Create: `src/app/[pays]/films/[slug]/page.tsx`

- [ ] **Step 1: Créer `src/app/[pays]/films/[slug]/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getActiveCountries, getFilmBySlug } from '@/lib/queries'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { HeroSection } from '@/components/film/HeroSection'
import { TechInfo } from '@/components/film/TechInfo'
import { CastGrid } from '@/components/film/CastGrid'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pays: string; slug: string }>
}): Promise<Metadata> {
  const { pays, slug } = await params
  const film = await getFilmBySlug(slug, pays)
  return {
    title: film ? `${film.title} — Films 26` : 'Films 26',
    description: film?.synopsis ?? undefined,
  }
}

export default async function FilmPage({
  params,
}: {
  params: Promise<{ pays: string; slug: string }>
}) {
  const { pays, slug } = await params
  const [countries, film] = await Promise.all([
    getActiveCountries(),
    getFilmBySlug(slug, pays),
  ])

  if (!film) notFound()

  return (
    <>
      <Header countries={countries} currentCountryId={pays} />
      <main className="pb-24 md:pb-8">
        <HeroSection film={film} />

        <div className="max-w-7xl mx-auto px-4 mt-10">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="md:col-span-2 space-y-8">
              {film.synopsis && (
                <div>
                  <h2 className="font-body text-xs uppercase tracking-widest text-muted mb-3">
                    Synopsis
                  </h2>
                  <p className="font-body text-muted leading-relaxed">{film.synopsis}</p>
                </div>
              )}
              <CastGrid film={film} />
            </div>

            {/* Colonne latérale */}
            <div className="space-y-4">
              <TechInfo film={film} />
            </div>
          </div>

          <div className="mt-8">
            <Link
              href={`/${pays}`}
              className="text-gold-dim hover:text-gold font-body text-sm transition-colors"
            >
              ← Retour à l'agenda
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav paysId={pays} />
    </>
  )
}
```

- [ ] **Step 2: Tester en dev — naviguer vers une fiche film**

```bash
npm run dev
```

Depuis l'agenda, cliquer sur un film → la fiche s'affiche avec le hero + infos.

- [ ] **Step 3: Commit**

```bash
git add src/app/[pays]/films/
git commit -m "feat: film detail page /[pays]/films/[slug]"
```

---

## Task 13: Feed mouvements `/[pays]/mouvements`

**Files:**
- Create: `src/components/mouvements/EventCard.tsx`
- Create: `src/components/mouvements/EventFeed.tsx`
- Create: `src/app/[pays]/mouvements/page.tsx`

- [ ] **Step 1: Créer `src/components/mouvements/EventCard.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import type { FilmReleaseEvent, Film } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface EventCardProps {
  event: FilmReleaseEvent & { film: Film }
  paysId: string
}

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  added:        { label: 'Nouvelle sortie',      color: 'text-cyan' },
  date_changed: { label: 'Date modifiée',         color: 'text-gold' },
  removed:      { label: 'Retiré du programme',  color: 'text-muted' },
}

export function EventCard({ event, paysId }: EventCardProps) {
  const meta = EVENT_LABELS[event.event_type] ?? EVENT_LABELS.added

  return (
    <Link
      href={`/${paysId}/films/${event.film_id}`}
      className="flex gap-4 p-4 bg-surface-card rounded-lg hover:scale-[1.01] transition-transform"
    >
      <div className="w-12 h-16 rounded-md overflow-hidden flex-shrink-0 bg-surface-low relative">
        {event.film?.poster_url ? (
          <Image src={event.film.poster_url} alt={event.film.title} fill className="object-cover" sizes="48px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">🎬</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-body font-semibold uppercase tracking-wide ${meta.color}`}>
            {meta.label}
          </span>
        </div>
        <p className="font-display font-semibold text-text text-sm truncate mb-1">
          {event.film?.title ?? event.film_id}
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-muted font-body">
          {event.event_type === 'added' && event.new_date && (
            <span>Sortie : {formatDate(event.new_date)}</span>
          )}
          {event.event_type === 'date_changed' && event.old_date && event.new_date && (
            <span>{formatDate(event.old_date)} → {formatDate(event.new_date)}</span>
          )}
          {event.event_type === 'removed' && event.old_date && (
            <span>Était prévu le {formatDate(event.old_date)}</span>
          )}
          <span className="text-surface-card">{formatDate(event.occurred_at.split('T')[0])}</span>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Créer `src/components/mouvements/EventFeed.tsx`**

```tsx
import type { FilmReleaseEvent, Film } from '@/lib/types'
import { EventCard } from './EventCard'

interface EventFeedProps {
  events: (FilmReleaseEvent & { film: Film })[]
  paysId: string
}

export function EventFeed({ events, paysId }: EventFeedProps) {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="font-display text-muted text-lg">Aucun mouvement récent.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map(event => (
        <EventCard key={event.id} event={event} paysId={paysId} />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Créer `src/app/[pays]/mouvements/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getActiveCountries, getMovementsByCountry } from '@/lib/queries'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { EventFeed } from '@/components/mouvements/EventFeed'

export const revalidate = 1800

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pays: string }>
}): Promise<Metadata> {
  const { pays } = await params
  const countries = await getActiveCountries()
  const country = countries.find(c => c.id === pays)
  return {
    title: country ? `Mouvements ${country.name} — Films 26` : 'Mouvements — Films 26',
  }
}

export default async function MouvementsPage({
  params,
}: {
  params: Promise<{ pays: string }>
}) {
  const { pays } = await params
  const [countries, events] = await Promise.all([
    getActiveCountries(),
    getMovementsByCountry(pays),
  ])

  const country = countries.find(c => c.id === pays)
  if (!country) notFound()

  return (
    <>
      <Header countries={countries} currentCountryId={pays} />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-gold text-2xl">Mouvements</h1>
          <Link
            href={`/${pays}`}
            className="text-gold-dim hover:text-gold font-body text-sm transition-colors"
          >
            ← Agenda
          </Link>
        </div>
        <EventFeed events={events} paysId={pays} />
      </main>
      <Footer />
      <BottomNav paysId={pays} />
    </>
  )
}
```

- [ ] **Step 4: Test final end-to-end**

```bash
npm run dev
```

Vérifier le parcours complet :
1. http://localhost:3000 → sélecteur pays
2. Cliquer un pays → agenda avec semaines + films
3. Cliquer un film → fiche avec hero + synopsis + cast
4. Naviguer vers `/[pays]/mouvements` → feed d'événements
5. Redimensionner < 768px → bottom nav + cards horizontales visibles

- [ ] **Step 5: Vérifier le build**

```bash
npm run build
```

Expected: build réussi, pas d'erreur TypeScript ni de page non rendue.

- [ ] **Step 6: Commit final**

```bash
git add src/components/mouvements/ src/app/[pays]/mouvements/
git commit -m "feat: mouvements page + EventCard + EventFeed"
git push origin main
```

---

## Self-review

**Couverture spec :**
- ✅ Routes `/`, `/[pays]`, `/[pays]/films/[slug]`, `/[pays]/mouvements`
- ✅ Design system Marquee Pro (tokens @theme Tailwind v4)
- ✅ ISR 3600s agenda + films, SSR 1800s mouvements
- ✅ `generateStaticParams` pour les 20 pays
- ✅ `await params` (Next.js 16)
- ✅ `unstable_cache` pour les requêtes Supabase
- ✅ FilmCard desktop vertical + mobile horizontal
- ✅ MonthTabs sticky + scroll-spy
- ✅ WeekSection avec `id="week-{n}"` pour scroll-to-anchor
- ✅ BottomNav mobile (Agenda + Mouvements)
- ✅ Hero plein largeur + gradient overlay + CTA matériel
- ✅ `films.id` utilisé comme slug partout
- ✅ Tests utilitaires Vitest pour isoWeek, groupByWeek, formatDate
- ✅ Hors scope v1 : pas de SALLES, FAVORIS, auth
