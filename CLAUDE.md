@AGENTS.md
# CLAUDE.md — Agenda Films26 (Plateforme Publique B2B)

## Contexte Produit

Site public B2B pour **FILMS 26** (Metropolitan Filmexport), distributeur en Afrique Francophone.
Destiné aux exploitants de salles de cinéma : agenda hebdomadaire des sorties par pays.

- **Read-only** — aucune écriture, pas d'authentification
- **Back-office de saisie** : app interne séparée (repo `antigravity-forecast`)
- **Production** : https://agenda-f26.vercel.app (domaine cible : `agenda.films26.com`)

---

## Stack Technique

| Outil | Version |
|-------|---------|
| Next.js (App Router) | 16.2.3 |
| React | 19.2.4 |
| Tailwind CSS | v4 |
| Supabase JS | ^2.103.0 |
| TypeScript | ^5 |
| Vitest | ^4 |

- **Dev server** : `npm run dev` → http://localhost:3000
- **Tests** : `npm test`

---

## Variables d'environnement

Fichier `.env.local` (gitignored, configuré sur Vercel) :
```
NEXT_PUBLIC_SUPABASE_URL=<même URL que l'app interne>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<même anon key>
```
Ces valeurs sont dans `.env` du repo `antigravity-forecast`.

---

## Design System "Marquee Pro"

Défini dans `src/app/globals.css` via `@theme` Tailwind v4 :

```css
/* Surfaces */
--color-surface:      #021232
--color-surface-low:  #0a1a3a
--color-surface-card: #263455

/* Or */
--color-gold:         #ffd700
--color-gold-dim:     #e9c400
--color-gold-light:   #ffe16d

/* Texte */
--color-text:         #fff6df
--color-muted:        #d0c6ab

/* Chips genre */
--color-chip-bg:      #544601
--color-chip-text:    #c9b468

/* Tags techniques */
--color-cyan:         #defcff

/* Fonts */
font-display: Manrope
font-body:    Inter

/* Radius */
--radius: 0.25 / 0.75 / 1 / 1.5rem
```

---

## Routes

| Route | Description | Cache |
|-------|-------------|-------|
| `/` | Accueil — liste des pays par région | `force-static` |
| `/[pays]` | Agenda hebdomadaire — sections par semaine ISO, cartes films | ISR 3600s |
| `/[pays]/films/[slug]` | Fiche détail film — hero immersif, synopsis, casting, infos techniques | ISR 3600s |
| `/[pays]/mouvements` | Feed des événements récents (visible = true) | ISR 1800s |

---

## Composants

### `src/components/layout/`
| Fichier | Type | Rôle |
|---------|------|------|
| `Header.tsx` | Server | En-tête sticky — logo Films26, pays courant, lien Mouvements |
| `Footer.tsx` | Server | Pied de page — copyright Metropolitan Filmexport |
| `MobileNav.tsx` | Client | Wrapper mobile — gère l'état BottomNav + MouvementsDrawer |
| `BottomNav.tsx` | Client | Barre de navigation inférieure mobile (Agenda / Mouvements) |

### `src/components/agenda/`
| Fichier | Type | Rôle |
|---------|------|------|
| `MonthTabs.tsx` | Client | Onglets mois sticky avec IntersectionObserver (scroll-to-anchor) |
| `WeekSection.tsx` | Server | Section semaine ISO — label, plage dates, nombre de sorties |
| `FilmCard.tsx` | Server | Carte film — deux variants desktop (grille 5 colonnes) / mobile (liste horizontale) |
| `StudioBadge.tsx` | Client | Logo studio depuis `/public/logos/{slug}.png`, fallback texte si 404 |

### `src/components/film/`
| Fichier | Type | Rôle |
|---------|------|------|
| `HeroSection.tsx` | Server | Image hero 50-60vh avec gradient — genre, format, date, durée, nationalité |
| `TechInfo.tsx` | Server | Sidebar 1/3 desktop — format projection, mix audio, nationalité, studio |
| `CastGrid.tsx` | Server | Réalisateur en gras + liste acteurs (split par virgule) |

### `src/components/mouvements/`
| Fichier | Type | Rôle |
|---------|------|------|
| `EventFeed.tsx` | Server | Feed groupé par jour + type d'événement, tri chronologique |
| `EventCard.tsx` | Server | Ligne événement — poster mini, type coloré, dates old→new |
| `MouvementsDrawer.tsx` | Client | Bottom sheet mobile (80dvh max), lien vers page complète |

---

## Schéma Supabase (read-only)

### `films`
```
id (slug), title, studio, release_date, director, cast_main, synopsis, genre,
poster_url, trailer_url, material_url, duration_min, projection_fmt, audio_mix, nationality
```

### `film_releases`
```
film_id (→ films.id), country_id (→ countries.id), release_date
```
L'existence d'une ligne = film publié dans ce pays.

### Statuts de film (`films.status`)

Valeurs exactes en base (contrainte CHECK côté back-office `antigravity-forecast`, migration `011_brouillon_status.sql`) — **en anglais**, ne pas confondre avec leurs libellés français :

| Valeur en base   | Libellé FR      | Visible agenda public (`/[pays]`) | Visible `/master/[pays]` |
|-------------------|-----------------|:---:|:---:|
| `brouillon`        | Brouillon        | ❌ | ✅ |
| `nego`              | Négo             | ✅ | ✅ |
| `validated`         | Validé           | ✅ | ✅ |
| `competition`       | Concurrence       | ❌ | ✅ |
| `cancelled`         | Annulé           | ❌ | ❌ |

⚠️ Piège déjà rencontré : `competition` (base) ≠ `concurrence` (label FR) — un filtre codé en dur sur la chaîne `'concurrence'` ne matche jamais rien. Toujours filtrer sur les valeurs anglaises de la colonne `status`.

Logique de filtrage, centralisée dans `src/lib/queries.ts` :
- **Agenda public + encart Mouvements + PDF exploitant** : liste blanche `AGENDA_STATUSES = ['validated', 'nego']` (`getAgendaByCountry`, `getMovementsByCountry`).
- **`/master/[pays]`** (interne) : tout sauf `cancelled` (`getAgendaByCountryMaster`, `getMovementsByCountryMaster`).
- **Newsletter Brevo** (repo `antigravity-forecast`, `DiffusionDrawer.tsx`) : même liste blanche `['validated', 'nego']`, appliquée sur le statut lu depuis `MOCK_FILMS[film_id].status` avant construction du payload envoyé à l'Edge Function `send-mailing`.

### `film_release_events`
```
id, film_id, country_id,
event_type: 'added' | 'date_changed' | 'removed',
old_date, new_date, visible (boolean), occurred_at (timestamptz)
```
Afficher uniquement `visible = true`.

### `countries`
```
id (code ISO), name, region
```

### Pays couverts (20)
- **Maghreb** : MA, DZ, TN
- **Ouest XOF** : BJ, BF, CI, GN, ML, NE, SN, TG
- **Centrale XAF** : CM, CG, CD, GA
- **Autres** : DJ, MG, MR, RW

---

## Data Layer

### `src/lib/queries.ts`
| Fonction | Paramètres | Retour | Revalidate |
|----------|-----------|--------|-----------|
| `getActiveCountries()` | — | `Country[]` | 3600s |
| `getAgendaByCountry(countryId)` | code pays | `(Film & { release_date })[]` | 3600s |
| `getFilmBySlug(slug, countryId)` | slug, code pays | `Film & { release_date }` \| null | 3600s |
| `getMovementsByCountry(countryId)` | code pays | `FilmReleaseEvent[]` (limit 50, validated/nego) | 1800s |
| `getMovementsByCountryMaster(countryId)` | code pays | `FilmReleaseEvent[]` (limit 50, tout sauf cancelled) | 1800s |

### `src/lib/utils.ts`
| Fonction | Usage |
|----------|-------|
| `groupFilmsByWeek(films)` | Groupe et trie les films par semaine ISO → `WeekGroup[]` |
| `getIsoWeek(dateStr)` | Numéro de semaine ISO (1-53) |
| `getIsoYear(dateStr)` | Année ISO |
| `getWeekMonday(year, isoWeek)` | Date ISO du lundi d'une semaine |
| `formatWeekLabel(isoWeek, monday)` | "SEMAINE 16 — 13 avr 2026" |
| `formatWeekDateRange(startDate)` | "08 — 14 avr 2026" ou "28 avr — 04 mai 2026" |
| `formatDate(dateStr)` | "14 avr 2026" |
| `formatDuration(minutes)` | "1h45" |

---

## Logique d'affichage

- Un film n'est affiché dans un pays que s'il a une entrée `film_releases` pour ce pays
- Navigation par semaine ISO (scroll-to-anchor via `MonthTabs`)
- Les événements mouvements n'affichent que `visible = true`
- Mobile : layout compact, carte film entièrement cliquable
- `generateStaticParams` sur `/[pays]` et `/[pays]/films/[slug]`

---

## État d'implémentation

### Fonctionnalités implémentées
- Homepage avec sélection pays par région
- Agenda hebdomadaire avec groupement par semaine ISO
- Fiche film avec hero immersif
- Feed mouvements avec tri par jour et type
- Navigation mobile (BottomNav + drawer mouvements)
- Responsive desktop (5 colonnes) / mobile (liste horizontale)
- Design system Marquee Pro
- Caching ISR (1h agenda, 30 min mouvements)

### Incomplet
- `public/logos/` vide — les logos studios affichent un fallback texte
- `trailer_url` présente en base mais non utilisée dans l'UI
- Aucun test écrit (vitest configuré, 0 fichiers de test)

### Hors scope v1
- Authentification exploitants
- Notifications push
- Logique de décalage automatique MA/TN (mercredi précédent)
- Scraping IMDB/TMDB
