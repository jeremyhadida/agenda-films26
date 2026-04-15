# Design Spec — Plateforme Publique B2B agenda.films26.com

**Date :** 2026-04-14
**Projet :** Films 26 / Metropolitan Filmexport
**Repo :** `agenda-films26`
**Référence parent :** [2026-04-08-agenda-cinema-design.md](https://github.com/jeremyhadida/antigravity-forecast/blob/main/docs/superpowers/specs/2026-04-08-agenda-cinema-design.md)

---

## Contexte

Films 26 distribue des films en Afrique Francophone (20 pays). Cette plateforme publique B2B est destinée aux exploitants de salles de cinéma : elle leur permet de consulter l'agenda hebdomadaire des sorties par pays.

- **Read-only** — aucune écriture, pas d'authentification en v1
- Les données sont saisies dans l'app interne (`antigravity-forecast`) et lues ici via Supabase
- La date dans `film_releases` est l'acte de publication : existence d'une ligne = film affiché dans ce pays

---

## Stack

- Next.js 16 (App Router)
- Tailwind CSS v4
- Supabase (même instance que l'app interne, clé anon read-only)
- `next/image` pour les posters
- Manrope + Inter via `next/font/google`

---

## Design System "Marquee Pro"

Extrait des maquettes Stitch (`design mock ups stitch/`). Règle fondamentale : **No-Line Rule** — zéro border pour séparer les sections, uniquement des shifts de `background-color`.

### Tokens de couleur

| Token Tailwind        | Valeur    | Usage                          |
|-----------------------|-----------|--------------------------------|
| `surface`             | `#021232` | Background principal           |
| `surface-low`         | `#0A1A3A` | Sections, header sticky        |
| `surface-card`        | `#263455` | Cards films                    |
| `gold`                | `#FFD700` | Accent principal, tab actif    |
| `gold-dim`            | `#E9C400` | Liens, états hover             |
| `gold-light`          | `#FFE16D` | Focus states                   |
| `text`                | `#FFF6DF` | Texte principal                |
| `muted`               | `#D0C6AB` | Texte secondaire, métadonnées  |
| `chip-bg`             | `#544601` | Background chips genre         |
| `chip-text`           | `#C9B468` | Texte chips genre              |
| `cyan`                | `#DEFCFF` | Tags techniques (2D, IMAX…)    |

### Typographie

- **Headlines** : Manrope — `display-lg` (3.5rem, tracking tight) pour titres éditoriaux
- **Body / Utility** : Inter — métadonnées films (durée, genre, réalisateur)
- Contraste "Big & Small" : titre `headline-sm` + métadonnée `label-md` uppercase

### Radius

| Nom    | Valeur    | Usage                              |
|--------|-----------|------------------------------------|
| `sm`   | 0.25rem   | Tooltips                           |
| `md`   | 0.75rem   | Posters internes, petits tags      |
| `lg`   | 1rem      | Cards films, modals                |
| `xl`   | 1.5rem    | Sections hero, search bars         |
| `full` | 9999px    | Boutons, chips de sélection        |

### Règles d'interaction

- Hover sur cards : `hover:scale-[1.02] transition-transform` uniquement (pas de changement couleur)
- Navigation bottom (mobile) : `bg-surface-low/70 backdrop-blur-xl`
- Shadows : ambiant uniquement — `0 12px 24px rgba(0,12,42,0.4)`, jamais noir pur

---

## Routes & Data Fetching

| Route                      | Stratégie          | revalidate |
|----------------------------|--------------------|------------|
| `/`                        | Statique (build)   | —          |
| `/[pays]`                  | ISR (generateStaticParams) | 3600s |
| `/[pays]/films/[slug]`     | ISR à la demande   | 3600s      |
| `/[pays]/mouvements`       | SSR                | 1800s      |

`generateStaticParams` pour `/[pays]` génère les 20 pays actifs (ceux ayant au moins une entrée `film_releases`).

Le `slug` des films est `films.id` (déjà en format slug dans la DB).

---

## Structure des fichiers

```
src/
├── app/
│   ├── layout.tsx                        # Layout global, fonts, metadata
│   ├── page.tsx                          # Sélecteur de pays (/)
│   └── [pays]/
│       ├── page.tsx                      # Agenda hebdo
│       ├── films/[slug]/
│       │   └── page.tsx                  # Fiche film
│       └── mouvements/
│           └── page.tsx                  # Feed mouvements
├── components/
│   ├── layout/
│   │   ├── Header.tsx                    # Logo + nav + CountrySelector
│   │   ├── Footer.tsx
│   │   └── BottomNav.tsx                 # Mobile uniquement
│   ├── agenda/
│   │   ├── MonthTabs.tsx                 # Tabs mois sticky + scroll-spy
│   │   ├── WeekSection.tsx               # En-tête semaine + grille films
│   │   └── FilmCard.tsx                  # Carte film (desktop vertical / mobile horizontal)
│   ├── film/
│   │   ├── HeroSection.tsx               # Image plein largeur + titre overlay
│   │   ├── TechInfo.tsx                  # Format, Mix Audio, Nationalité
│   │   └── CastGrid.tsx                  # Photos + noms casting
│   └── mouvements/
│       ├── EventFeed.tsx
│       └── EventCard.tsx
└── lib/
    ├── supabase.ts                       # Client Supabase (anon, read-only)
    ├── queries.ts                        # Toutes les requêtes Supabase
    └── utils.ts                          # isoWeek(), formatDate(), groupByWeek()
```

---

## Composants détaillés

### `FilmCard`

- **Desktop** : carte verticale, poster `aspect-[2/3] rounded-md`, grille `grid-cols-5 lg:grid-cols-3 sm:grid-cols-2`
- **Mobile** : ligne horizontale `flex-row`, poster `w-16 h-24 rounded-md`
- Toute la carte est un `<Link>` vers `/[pays]/films/[slug]`
- Chips genre : `bg-chip-bg text-chip-text rounded-full text-xs`
- Tags techniques (2D/3D/IMAX/Atmos) : `text-cyan rounded-md text-xs`
- `hover:scale-[1.02] transition-transform duration-200`

### `WeekSection`

- En-tête : "SEMAINE 16 — 14 avr 2026" (Manrope) + badge "5 SORTIES" (chip gold)
- `id="week-{isoWeek}"` pour scroll-to-anchor
- Background `bg-surface-low` — séparation visuelle sans border
- Contient la grille de `FilmCard`

### `MonthTabs`

- Position : `sticky top-0 z-10 bg-surface/80 backdrop-blur-xl`
- Tab actif : `bg-gold text-surface rounded-full px-4 py-1`
- Tab inactif : `text-muted hover:text-text`
- Scroll horizontal sur mobile (`overflow-x-auto scrollbar-none`)
- Scroll-spy : IntersectionObserver sur les `WeekSection` pour mettre à jour le tab actif

### `HeroSection` (fiche film)

- Image `next/image` plein largeur, `h-[60vh] object-cover`
- Gradient overlay : `bg-gradient-to-t from-surface via-surface/60 to-transparent`
- Titre Manrope `text-5xl font-bold` overlayé
- Badges format `text-cyan`, genre `bg-chip-bg text-chip-text`
- CTA "Télécharger le matériel" : `bg-gradient-to-r from-gold to-gold-dim text-surface rounded-full`

### `BottomNav` (mobile, v1)

- 2 items : Agenda + Mouvements
- `fixed bottom-0 w-full bg-surface-low/70 backdrop-blur-xl`
- Item actif : `text-text` + dot `w-1 h-1 bg-gold rounded-full mx-auto mt-1`

---

## Requêtes Supabase (`lib/queries.ts`)

```ts
// Agenda : films d'un pays groupés par semaine ISO
getAgendaByCountry(countryId: string)
// → film_releases JOIN films WHERE country_id = ?
// → retourne: { week: number, date: string, films: Film[] }[]

// Fiche film
getFilmBySlug(slug: string, countryId: string)
// → films WHERE id = ? + film_releases WHERE country_id = ?

// Mouvements
getMovementsByCountry(countryId: string)
// → film_release_events JOIN films WHERE country_id = ? AND visible = true
// → ORDER BY occurred_at DESC LIMIT 50

// Sélecteur pays
getActiveCountries()
// → countries JOIN film_releases GROUP BY id (au moins 1 release)
```

---

## Schéma Supabase (read-only)

### `films`
```
id (slug), title, studio, release_date, director, cast_main, synopsis,
genre, poster_url, trailer_url, material_url, duration_min,
projection_fmt, audio_mix, nationality
```

### `film_releases`
```
film_id → films.id
country_id → countries.id
release_date (date)
```
Existence d'une ligne = film publié dans ce pays.

### `film_release_events`
```
id, film_id, country_id,
event_type: 'added' | 'date_changed' | 'removed'
old_date, new_date, visible (boolean), occurred_at (timestamptz)
```
Afficher uniquement `visible = true`.

### `countries`
```
id (code ISO), name, region
```

**20 pays couverts :**
- Maghreb : MA, DZ, TN
- Ouest XOF : BJ, BF, CI, GN, ML, NE, SN, TG
- Centrale XAF : CM, CG, CD, GA
- Autres : DJ, MG, MR, RW

---

## Hors scope v1

- Authentification exploitants
- Onglets SALLES et FAVORIS (présents dans les maquettes Stitch, reportés en v2)
- Notifications push
- Logique de décalage automatique MA/TN (mercredi précédent)
- Scraping IMDB/TMDB

---

## Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=<même URL que l'app interne>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<même anon key>
```

---

## Vérification (tests end-to-end)

1. `npm run dev` → ouvrir `http://localhost:3000` → sélecteur pays s'affiche
2. Cliquer sur "Côte d'Ivoire" → `/ci` → agenda avec semaines et films
3. Cliquer sur un film → `/ci/films/[slug]` → hero image + infos techniques
4. Naviguer vers `/ci/mouvements` → feed d'événements visible = true
5. Redimensionner en mobile → bottom nav visible, cards en mode horizontal
6. Vérifier `revalidate: 3600` dans les page.tsx (ISR actif)
