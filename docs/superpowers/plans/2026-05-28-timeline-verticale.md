# Timeline Verticale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une vue timeline verticale alternée gauche/droite comme mode alternatif à la grille, activée par un toggle mobile uniquement.

**Architecture:** `AgendaViewToggle` (Client) reçoit la grille en `children` depuis le Server Component `page.tsx` et rend soit les enfants (grille), soit `AgendaTimeline` (Client). `AgendaTimeline` utilise GSAP ScrollTrigger sur le scroll window pour animer cartes et axe central.

**Tech Stack:** GSAP 3.12+ (`gsap` + `gsap/react` + `gsap/ScrollTrigger`), React 19, Next.js 16 App Router, Tailwind v4, TypeScript strict.

---

## Fichiers

| Action | Fichier | Responsabilité |
|--------|---------|----------------|
| Modifier | `src/lib/utils.ts` | Ajouter `formatDateShort` |
| Créer | `src/components/agenda/AgendaTimeline.tsx` | Timeline + cartes + animations GSAP |
| Créer | `src/components/agenda/AgendaViewToggle.tsx` | Toggle état grille/timeline |
| Modifier | `src/app/[pays]/page.tsx` | Enrober le contenu dans `AgendaViewToggle` |

---

## Task 1 — Installer GSAP et ajouter `formatDateShort`

**Files:**
- Modify: `src/lib/utils.ts` (après ligne 61, après `formatDate`)

- [ ] **Étape 1 : Installer GSAP**

```bash
cd "agenda-films26" && npm install gsap
```

Sortie attendue : `added 1 package` (ou similaire), pas d'erreur.

- [ ] **Étape 2 : Vérifier que GSAP est bien présent**

```bash
ls node_modules/gsap/gsap-core.js && echo "OK"
```

Sortie attendue : `OK`

- [ ] **Étape 3 : Ajouter `formatDateShort` dans `src/lib/utils.ts`**

Ajouter après la fonction `formatDate` (ligne ~62) :

```ts
/**
 * Formats an ISO date string as "14 avr" (day + month, no year).
 */
export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  return `${d.getUTCDate()} ${FR_MONTHS[d.getUTCMonth()]}`
}
```

- [ ] **Étape 4 : Vérifier le build**

```bash
npm run build
```

Sortie attendue : `✓ Compiled successfully` sans erreur TypeScript.

- [ ] **Étape 5 : Commit**

```bash
git add src/lib/utils.ts package.json package-lock.json
git commit -m "feat: install gsap, add formatDateShort utility"
```

---

## Task 2 — Créer `AgendaTimeline.tsx`

**Files:**
- Create: `src/components/agenda/AgendaTimeline.tsx`

- [ ] **Étape 1 : Créer le fichier**

Créer `src/components/agenda/AgendaTimeline.tsx` avec ce contenu complet :

```tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from 'gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Film, FilmReleaseEvent, WeekGroup } from '@/lib/types'
import { formatDuration, formatDateShort, getIsoWeek } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

// ── Genre classes (même mapping que FilmCard) ──
const GENRE_CLASSES: Record<string, string> = {
  ACTION:       'bg-red-900/60 text-red-200',
  COMÉDIE:      'bg-yellow-900/60 text-yellow-200',
  COMEDIE:      'bg-yellow-900/60 text-yellow-200',
  DRAME:        'bg-blue-900/60 text-blue-200',
  MUSICAL:      'bg-purple-900/60 text-purple-200',
  HORREUR:      'bg-red-950/80 text-red-300',
  THRILLER:     'bg-orange-900/60 text-orange-200',
  ANIMATION:    'bg-emerald-900/60 text-emerald-200',
  DOCUMENTAIRE: 'bg-teal-900/60 text-teal-200',
  SF:           'bg-sky-900/60 text-sky-200',
  SCIENCE:      'bg-sky-900/60 text-sky-200',
}

function genreClass(genre: string): string {
  const key = Object.keys(GENRE_CLASSES).find(k => genre.toUpperCase().includes(k))
  return key ? GENRE_CLASSES[key] : 'bg-chip-bg text-chip-text'
}

function dotColorClass(isoWeek: number, isCurrent: boolean): string {
  if (isCurrent) return 'bg-gold border-gold shadow-[0_0_8px_rgba(255,215,0,0.45)]'
  return isoWeek % 2 === 0
    ? 'bg-cyan/20 border-cyan/30'
    : 'bg-muted/20 border-muted/30'
}

// ── Film card within the timeline ──
interface FilmTimelineCardProps {
  film: Film & { release_date: string }
  event: FilmReleaseEvent | undefined
  side: 'left' | 'right'
}

function FilmTimelineCard({ film, event, side }: FilmTimelineCardProps) {
  const genre = film.genre?.split(',')[0]?.trim()

  return (
    <div
      className={`tl-card-${side} relative bg-surface-card border border-[#2a3a5a] rounded-lg p-2.5 ${
        side === 'left' ? 'mr-3 text-right' : 'ml-3 text-left'
      }`}
    >
      {/* Event badge */}
      {event && (
        <span
          className={`absolute top-1.5 ${side === 'left' ? 'left-1.5' : 'right-1.5'} text-[9px] leading-none ${
            event.event_type === 'added' ? 'text-gold' : 'text-cyan'
          }`}
          title={event.event_type === 'added' ? 'Nouvelle sortie' : 'Date modifiée'}
        >
          {event.event_type === 'added' ? '✦' : '↕'}
        </span>
      )}

      {/* Genre chip */}
      {genre && (
        <span className={`inline-block rounded-sm px-1.5 py-px text-[6.5px] font-body font-bold mb-1.5 ${genreClass(genre)}`}>
          {genre}
        </span>
      )}

      {/* Title */}
      <p className="font-display font-bold text-text text-[10.5px] leading-snug line-clamp-2">
        {film.title}
      </p>

      {/* Director */}
      {film.director && (
        <p className="text-[8px] font-body text-muted/70 mt-0.5 truncate">
          Dir. {film.director}
        </p>
      )}

      {/* Cast */}
      {film.cast_main && (
        <p className="text-[7.5px] font-body text-muted/55 mt-0.5 truncate">
          {film.cast_main}
        </p>
      )}

      {/* Duration + format */}
      <div className={`flex gap-1 mt-1.5 text-[7.5px] font-body text-cyan ${
        side === 'left' ? 'justify-end' : 'justify-start'
      }`}>
        {film.duration_min && <span>{formatDuration(film.duration_min)}</span>}
        {film.projection_fmt && <span>· {film.projection_fmt}</span>}
      </div>
    </div>
  )
}

// ── Main component ──
interface AgendaTimelineProps {
  groups: WeekGroup[]
  events: FilmReleaseEvent[]
}

export function AgendaTimeline({ groups, events }: AgendaTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Build lookup: film_id → most recent visible non-removed event
  const eventMap = new Map<string, FilmReleaseEvent>()
  events
    .filter(e => e.visible && e.event_type !== 'removed')
    .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
    .forEach(e => { if (!eventMap.has(e.film_id)) eventMap.set(e.film_id, e) })

  // Current ISO week
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const currentWeek = getIsoWeek(todayStr)

  useGSAP(() => {
    const container = containerRef.current
    if (!container) return

    // Center axis — draws progressively as user scrolls
    const axis = container.querySelector<HTMLElement>('.tl-axis')
    if (axis) {
      gsap.set(axis, { scaleY: 0, transformOrigin: 'top center' })
      ScrollTrigger.create({
        trigger: container,
        start: 'top 80%',
        end: 'bottom bottom',
        onUpdate: self => {
          gsap.set(axis, { scaleY: self.progress })
        },
      })
    }

    // Week nodes — fade up
    container.querySelectorAll<HTMLElement>('.tl-week-node').forEach(node => {
      gsap.set(node, { opacity: 0, y: 8 })
      ScrollTrigger.create({
        trigger: node,
        start: 'top 88%',
        onEnter:    () => gsap.to(node, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }),
        onLeaveBack: () => gsap.to(node, { opacity: 0, y: 8, duration: 0.15 }),
      })
    })

    // Film rows — cards fly in from sides
    container.querySelectorAll<HTMLElement>('.tl-film-row').forEach(row => {
      const leftCard  = row.querySelector<HTMLElement>('.tl-card-left')
      const rightCard = row.querySelector<HTMLElement>('.tl-card-right')
      const dot       = row.querySelector<HTMLElement>('.tl-dot')

      if (leftCard)  gsap.set(leftCard,  { opacity: 0, x: -28 })
      if (rightCard) gsap.set(rightCard, { opacity: 0, x: 28 })
      if (dot)       gsap.set(dot,       { scale: 0, opacity: 0 })

      ScrollTrigger.create({
        trigger: row,
        start: 'top 82%',
        onEnter: () => {
          if (dot)       gsap.to(dot,       { scale: 1, opacity: 1, duration: 0.22, ease: 'back.out(2)' })
          if (leftCard)  gsap.to(leftCard,  { opacity: 1, x: 0, duration: 0.32, delay: 0.05, ease: 'power3.out' })
          if (rightCard) gsap.to(rightCard, { opacity: 1, x: 0, duration: 0.32, delay: 0.05, ease: 'power3.out' })
        },
        onLeaveBack: () => {
          if (dot)       gsap.to(dot,       { scale: 0, opacity: 0, duration: 0.15 })
          if (leftCard)  gsap.to(leftCard,  { opacity: 0, x: -28, duration: 0.18, ease: 'power2.in' })
          if (rightCard) gsap.to(rightCard, { opacity: 0, x: 28,  duration: 0.18, ease: 'power2.in' })
        },
      })
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="relative mt-4 pb-16">
      {/* Vertical axis */}
      <div
        className="tl-axis pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#1e3260] to-transparent"
        aria-hidden="true"
      />

      {groups.map(group => {
        const isCurrent = group.isoWeek === currentWeek
        const films = group.films

        // Build pairs: [0,1], [2,3], ...
        const rows: { left: typeof films[0]; right: typeof films[0] | null }[] = []
        for (let i = 0; i < films.length; i += 2) {
          rows.push({ left: films[i], right: films[i + 1] ?? null })
        }

        return (
          <div key={group.isoWeek}>
            {/* Week node */}
            <div className="tl-week-node flex justify-center py-3 relative z-10">
              <div
                className={`border rounded-full px-3 py-1 text-[8.5px] font-body font-bold tracking-wider ${
                  isCurrent
                    ? 'bg-gold/10 border-gold/50 text-gold shadow-[0_0_12px_rgba(255,215,0,0.15)]'
                    : 'bg-surface-low border-[#2a3a5a]/60 text-muted/60'
                }`}
              >
                S{group.isoWeek} · {formatDateShort(group.startDate)}
                {isCurrent && <span className="ml-1.5 opacity-70 font-normal">— en cours</span>}
              </div>
            </div>

            {/* Film rows */}
            {rows.map(({ left, right }, rowIdx) => (
              <div
                key={`${group.isoWeek}-${rowIdx}`}
                className="tl-film-row grid grid-cols-[1fr_16px_1fr] items-center py-1.5 relative z-10 px-2"
              >
                <FilmTimelineCard film={left} event={eventMap.get(left.id)} side="left" />

                <div
                  className={`tl-dot w-2.5 h-2.5 rounded-full border-[1.5px] justify-self-center flex-shrink-0 ${dotColorClass(group.isoWeek, isCurrent)}`}
                />

                {right
                  ? <FilmTimelineCard film={right} event={eventMap.get(right.id)} side="right" />
                  : <div />
                }
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Étape 2 : Vérifier que `getIsoWeek` est bien exportée depuis `src/lib/utils.ts`**

Ouvrir `src/lib/utils.ts` et confirmer que la ligne 6 commence par `export function getIsoWeek`.

- [ ] **Étape 3 : Build TypeScript**

```bash
npm run build
```

Sortie attendue : `✓ Compiled successfully`. Si erreur sur `useGSAP` : vérifier que gsap est ≥ 3.12 (`cat node_modules/gsap/package.json | grep '"version"'`).

- [ ] **Étape 4 : Commit**

```bash
git add src/components/agenda/AgendaTimeline.tsx
git commit -m "feat: add AgendaTimeline vertical timeline component with GSAP ScrollTrigger"
```

---

## Task 3 — Créer `AgendaViewToggle.tsx`

**Files:**
- Create: `src/components/agenda/AgendaViewToggle.tsx`

- [ ] **Étape 1 : Créer le fichier**

```tsx
'use client'

import { useState } from 'react'
import type { FilmReleaseEvent, WeekGroup } from '@/lib/types'
import { AgendaTimeline } from './AgendaTimeline'

interface AgendaViewToggleProps {
  groups: WeekGroup[]
  events: FilmReleaseEvent[]
  children: React.ReactNode
}

export function AgendaViewToggle({ groups, events, children }: AgendaViewToggleProps) {
  const [view, setView] = useState<'grid' | 'timeline'>('grid')

  return (
    <>
      {/* Toggle button — mobile uniquement */}
      <div className="md:hidden flex justify-end mb-3 mt-1">
        <button
          onClick={() => setView(v => v === 'grid' ? 'timeline' : 'grid')}
          className="flex items-center gap-1.5 text-[10px] font-body font-semibold text-muted border border-[#2a3a5a] rounded-full px-3 py-1.5 transition-colors hover:border-muted/50 active:scale-95"
          aria-pressed={view === 'timeline'}
          aria-label={view === 'grid' ? 'Passer en vue frise' : 'Passer en vue grille'}
        >
          {view === 'grid' ? '≡ Frise' : '⊞ Grille'}
        </button>
      </div>

      {/* Grille (children Server Component) */}
      <div className={view === 'grid' ? 'block' : 'hidden'}>
        {children}
      </div>

      {/* Timeline */}
      {view === 'timeline' && (
        <AgendaTimeline groups={groups} events={events} />
      )}
    </>
  )
}
```

- [ ] **Étape 2 : Build TypeScript**

```bash
npm run build
```

Sortie attendue : `✓ Compiled successfully`.

- [ ] **Étape 3 : Commit**

```bash
git add src/components/agenda/AgendaViewToggle.tsx
git commit -m "feat: add AgendaViewToggle grid/timeline toggle (mobile)"
```

---

## Task 4 — Modifier `src/app/[pays]/page.tsx`

**Files:**
- Modify: `src/app/[pays]/page.tsx`

- [ ] **Étape 1 : Ajouter l'import de `AgendaViewToggle`**

En haut du fichier, après les imports existants, ajouter :

```ts
import { AgendaViewToggle } from '@/components/agenda/AgendaViewToggle'
```

- [ ] **Étape 2 : Enrober le contenu agenda dans `AgendaViewToggle`**

Remplacer le bloc conditionnel `{groups.length > 0 ? (...) : (...)}` par :

```tsx
{groups.length > 0 ? (
  <AgendaViewToggle groups={groups} events={events}>
    <>
      <MonthTabs groups={groups} />
      <ScrollToCurrentWeek startDates={groups.map(g => g.startDate)} />
      <div className="mt-6 space-y-12">
        {groups.map((group, i) => {
          const showMonth =
            i === 0 || getMonthKey(groups[i - 1].startDate) !== getMonthKey(group.startDate)

          return (
            <div key={group.isoWeek}>
              {showMonth && (
                <div className="mb-8">
                  <h2 className="font-display font-bold text-text text-2xl md:text-3xl tracking-wide">
                    {getMonthLabel(group.startDate)}
                  </h2>
                  <div className="mt-1.5 h-px bg-gold/20 w-20" />
                </div>
              )}
              <WeekSection group={group} />
            </div>
          )
        })}
      </div>
    </>
  </AgendaViewToggle>
) : (
  <div className="flex flex-col items-center justify-center min-h-[50vh]">
    <p className="font-display text-muted text-lg">
      Aucune sortie programmée pour le moment.
    </p>
  </div>
)}
```

Note : `events` est déjà disponible — il est fetchée ligne 53 (`const [countries, films, events] = await Promise.all([...])`). Le passer à `AgendaViewToggle` ne nécessite pas de nouvelle requête.

- [ ] **Étape 3 : Build complet**

```bash
npm run build
```

Sortie attendue : `✓ Compiled successfully`, 0 erreur TypeScript, 0 warning sur les types.

Si erreur `Type 'FilmReleaseEvent[]' is not assignable` : vérifier que l'import `FilmReleaseEvent` est bien dans `AgendaViewToggle.tsx`.

- [ ] **Étape 4 : Tester en dev**

```bash
npm run dev
```

Ouvrir http://localhost:3000/dz en DevTools, régler sur iPhone 14 (390×844).

Checklist visuelle :
- [ ] Le bouton `≡ Frise` est visible en bas à droite des onglets mois (mobile)
- [ ] Le bouton est **invisible** sur desktop (≥768px)
- [ ] Cliquer `≡ Frise` → la grille disparaît, la timeline s'affiche
- [ ] Scroller → les cartes arrivent des deux côtés simultanément
- [ ] La ligne centrale se dessine progressivement
- [ ] La semaine courante a son nœud en gold avec "— en cours"
- [ ] Une semaine avec 2 films → paire gauche/droite, même niveau vertical
- [ ] Une semaine avec 3 films → paire + solo gauche en dessous
- [ ] Les dots alternent muted (semaines impaires) / cyan (semaines paires) / gold (courante)
- [ ] Films avec événement récent → icône `✦` (gold) ou `↕` (cyan) en coin de carte
- [ ] Cliquer `⊞ Grille` → retour à la grille, MonthTabs et scroll fonctionnels

- [ ] **Étape 5 : Commit final**

```bash
git add src/app/[pays]/page.tsx
git commit -m "feat: integrate AgendaViewToggle in agenda page — toggle grille/frise"
```

---

## Task 5 — Push et vérification Vercel

- [ ] **Étape 1 : Push**

```bash
git push
```

- [ ] **Étape 2 : Attendre le build Vercel**

Vérifier sur https://agenda-f26.vercel.app/dz que la build passe et que la vue frise fonctionne en mobile.

- [ ] **Étape 3 : Vérifier les variables d'environnement**

GSAP n'a pas besoin de variable d'environnement. Aucune action nécessaire côté Vercel.

---

## Rappels Next.js 16 (AGENTS.md)

Avant d'écrire ou modifier du code, lire `node_modules/next/dist/docs/01-app/` — notamment la section sur les Server et Client Components. Points de vigilance :
- Les Server Components ne peuvent pas importer de Client Components qui utilisent `useState`/`useEffect` sans `'use client'`
- Passer des Server Components comme `children` à un Client Component est supporté et recommandé pour ce cas d'usage
- `'use client'` se propage : tout composant importé par un Client Component devient client-side

---

## Self-review

**Couverture spec :**
- ✓ Timeline verticale, scroll window, axe central dessiné au scroll
- ✓ Films alternance gauche/droite (paires)
- ✓ Nœuds semaine `S22 · 28 mai` avec `formatDateShort`
- ✓ Semaine courante en gold avec mention "en cours"
- ✓ Dots alternant muted/cyan par parité, gold si courante
- ✓ Gestion 1/2/3/4+ films (paires + solo)
- ✓ GSAP ScrollTrigger — cartes depuis côtés, axe, nœuds
- ✓ Un seul genre (split[0])
- ✓ Casting (cast_main)
- ✓ Badges événements `✦` / `↕` avec eventMap lookup
- ✓ Toggle mobile-only (md:hidden)
- ✓ Grille inchangée, Server Components préservés

**Types cohérents :** `WeekGroup`, `Film`, `FilmReleaseEvent` — tous importés depuis `@/lib/types`, pas de nouveaux types introduits.

**Pas de placeholder.**
