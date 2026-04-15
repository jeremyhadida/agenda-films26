@AGENTS.md
# CLAUDE.md — Agenda Films26 (Plateforme Publique B2B)

## Contexte Produit
Site public B2B pour **FILMS 26** (Metropolitan Filmexport), distributeur en Afrique Francophone.
Plateforme destinée aux exploitants de salles de cinéma : agenda hebdomadaire des sorties par pays.
**Read-only** — aucune écriture. Pas d'authentification en v1.
Back-office de saisie : app interne séparée (repo `antigravity-forecast`).

## Stack Technique
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (même instance que l'app interne, read-only)
- **Images**: next/image
- **Fonts**: Manrope + Inter via next/font/google
- **Dev server**: `npm run dev` → http://localhost:3000

## Design System "Marquee Pro"
```css
--color-bg:        #021232;
--color-accent:    #FFD700;
--color-text:      #FFF6DF;
--color-secondary: #D0C6AB;
--radius:          8px;

Routes
Route	Description
/[pays]	Agenda hebdomadaire — sections par semaine, cartes films
/[pays]/films/[slug]	Fiche détail — header immersif, trailer, casting, matériel
/[pays]/mouvements	Feed des événements récents (visible = true)
Schéma Supabase (read-only)
films

id, title, studio, release_date, director, cast_main, synopsis, genre,
poster_url, trailer_url, material_url, duration_min, projection_fmt, audio_mix, nationality
film_releases

film_id (→ films.id), country_id (→ countries.id), release_date (date)
Existence d'une ligne = film publié dans ce pays.

film_release_events

id, film_id, country_id, event_type ('added'|'date_changed'|'removed'),
old_date, new_date, visible (boolean), occurred_at (timestamptz)
Afficher uniquement visible = true.

countries

id (code ISO), name, region
Pays couverts (20)
Maghreb : MA, DZ, TN
Ouest XOF : BJ, BF, CI, GN, ML, NE, SN, TG
Centrale XAF : CM, CG, CD, GA
Autres : DJ, MG, MR, RW

Logique d'affichage
Un film n'est affiché dans un pays que s'il a une entrée film_releases pour ce pays
Navigation par semaine ISO (scroll-to-anchor)
Revalidation ISR : 1 heure (revalidate: 3600)
Mobile : layout compact, toute la carte cliquable
Hors scope v1
Authentification exploitants
Notifications push
Logique de décalage automatique MA/TN (mercredi précédent)
Scraping IMDB/TMDB


---

## Étape 4 — Copier les variables d'environnement

Créer `.env.local` :
NEXT_PUBLIC_SUPABASE_URL=<même URL que l'app interne>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<même anon key>



Ces valeurs sont dans `.env` du repo `antigravity-forecast`.

---

> **Note :** Si le MCP Stitch n'est pas disponible (erreur d'auth OAuth), exporter les screens en PNG depuis Stitch et les partager directement dans le chat — Claude les analyse visuellement et génère le Tailwind correspondant.

## Étape 5 — Premier message Claude Code dans le nouveau repo

Ouvrir Claude Code dans le dossier `agenda-films26` et coller ce message :

Je veux construire la plateforme publique B2B agenda.films26.com décrite dans CLAUDE.md.

Contexte du projet parent (app interne) :

Spec complète : https://github.com/jeremyhadida/antigravity-forecast/blob/main/docs/superpowers/specs/2026-04-08-agenda-cinema-design.md
Stack interne : Vite/React/TypeScript/Supabase
Les données sont déjà en base (film_releases, film_release_events, films avec poster_url etc.)
Lance la phase de brainstorming pour concevoir l'architecture Next.js 15 :
routes, composants, data fetching (SSR/ISR), design Marquee Pro, responsive mobile.



---

## Résumé des étapes

| # | Action |
|---|---|
| 1 | `gh repo create` + `create-next-app` |
| 2 | Créer `CLAUDE.md` (contenu ci-dessus) |
| 3 | Créer `.env.local` avec les clés Supabase |
| 4 | `git add . && git commit -m "chore: init Next.js 15 app"` + push |
| 5 | Ouvrir Claude Code dans le nouveau dossier |
| 6 | Coller le message de bootstrap ci-dessus |
