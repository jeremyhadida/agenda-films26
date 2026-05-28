# Design — Timeline verticale (vue frise)

**Date :** 2026-05-28
**Statut :** Approuvé

---

## Contexte

L'agenda Films26 affiche une grille de cartes films par semaine. Les exploitants de salles ont besoin d'une **vue calendaire rapide** pour visualiser la densité des sorties sur plusieurs semaines d'un seul regard, puis explorer les films individuellement.

La vue frise est un **mode alternatif** à la grille (toggle), visible uniquement sur mobile.

---

## Concept validé

Timeline verticale avec axe central :

- **Scroll vertical** — geste naturel sur mobile
- **Ligne centrale** — axe temporel qui se dessine progressivement au scroll (GSAP)
- **Films en alternance** — gauche/droite de la ligne, aucune hiérarchie de position
- **Nœuds de semaine** sur l'axe — étiquette "S22 · 28 mai", semaine courante mise en évidence (gold)
- **Cartes qui arrivent des côtés** — animation GSAP ScrollTrigger, cartes gauche depuis la gauche, droite depuis la droite
- **Semaines vides** — nœud discret sur l'axe, aucune carte
- **Date affichée** sur chaque nœud : `S22 · 28 mai` — numéro ISO + date du lundi de la semaine. Utilise `formatDate(group.startDate)` (utilitaire existant dans `src/lib/utils.ts`) tronqué au jour + mois (sans l'année). Format cible : `"28 mai"`.

---

## Gestion des multi-films par semaine

| Nb films | Disposition |
|----------|-------------|
| 1        | Solo gauche (toujours — la droite reste vide, le dot est centré sur l'axe) |
| 2        | Paire — une carte gauche, une carte droite, même ligne |
| 3        | Paire sur la première ligne + solo sur la ligne suivante |
| 4+       | Deux paires consécutives sous le même nœud de semaine |

La paire garantit l'absence de hiérarchie : les deux films sont exactement au même niveau vertical, reliés au même point sur l'axe.

### Couleur des dots — alternance par semaine

Les points sur l'axe alternent de couleur à chaque semaine pour marquer visuellement le changement de période, indépendamment du genre :

| Semaine | Couleur du dot | Border |
|---------|----------------|--------|
| Semaines impaires (S19, S21…) | `muted` `#d0c6ab` | `#d0c6ab40` |
| Semaines paires (S20, S22…) | `cyan` `#defcff` | `#defcff40` |
| Semaine courante (toujours) | `gold` `#ffd700` + glow | `#ffd700` |

La couleur est calculée côté rendu : `isoWeek % 2 === 0 ? 'cyan' : 'muted'`, sauf si c'est la semaine courante (gold prioritaire).

---

## Architecture des composants

### Nouveaux fichiers

**`src/components/agenda/AgendaTimeline.tsx`** — Client Component principal
- Reçoit `groups: WeekGroup[]` en prop (sérialisable depuis le Server Component)
- Gère le scroll vertical dans un `div` avec `overflow-y: auto`
- Enregistre GSAP ScrollTrigger avec `scroller` custom (le div, pas window)
- Initialise les animations au mount via `useGSAP()`
- Cleanup automatique via le contexte GSAP (`ctx.revert()`)

**`src/components/agenda/AgendaViewToggle.tsx`** — Client Component
- État local `view: 'grid' | 'timeline'`
- Bouton toggle visible uniquement sur mobile (`md:hidden`)
- Passe la prop `view` aux enfants ou utilise un Context si nécessaire

### Fichiers modifiés

**`src/app/[pays]/page.tsx`**
- Wrap le contenu dans `<AgendaViewToggle groups={groups} />`
- `AgendaViewToggle` rend soit `<WeekSection>` (grille existante) soit `<AgendaTimeline>`

**`src/app/globals.css`**
- Aucun keyframe CSS nécessaire — GSAP gère toutes les animations

---

## Animations GSAP

```ts
// Enregistrement
gsap.registerPlugin(ScrollTrigger)

// Cartes — arrivent depuis leur côté
gsap.fromTo(card, 
  { opacity: 0, x: isLeft ? -28 : 28 },
  { opacity: 1, x: 0, duration: 0.32, ease: 'power3.out',
    scrollTrigger: { trigger: row, scroller, start: 'top 78%', onLeaveBack: ... } }
)

// Point sur l'axe — pop
gsap.fromTo(dot, { scale: 0, opacity: 0 }, { scale: 1.3, opacity: 1, duration: 0.22, ease: 'back.out(2)' })

// Ligne centrale — se dessine au scroll
gsap.set(centerLine, { scaleY: 0, transformOrigin: 'top center' })
// onUpdate: gsap.set(centerLine, { scaleY: self.progress })

// Nœuds semaine — fade
gsap.fromTo(weekNode, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' })
```

---

## Design tokens utilisés

Tous issus du design system Marquee Pro (`globals.css`) :

| Token | Valeur | Usage |
|-------|--------|-------|
| `surface-card` | `#263455` | Fond des cartes film |
| `gold` | `#ffd700` | Semaine courante, dot actif, badge |
| `text` | `#fff6df` | Titre du film |
| `muted` | `#d0c6ab` | Réalisateur, métadonnées |
| `cyan` | `#defcff` | Durée, format projection |
| `surface-low` | `#0a1a3a` | Fond des nœuds de semaine |
| `border` | `#2a3a5a` | Bordures cartes, axe central |

### Contenu d'une carte film

| Champ | Affichage | Source |
|-------|-----------|--------|
| Genre | 1 seul chip — premier genre de la liste (split par virgule, `[0]`) | `film.genre` |
| Titre | Gras, 2 lignes max | `film.title` |
| Réalisateur | `Dir. Nom` en muted | `film.director` |
| Casting | 1 ligne tronquée, plus petit, muted/65 | `film.cast_main` |
| Durée + format | `1h55 · IMAX` en cyan | `film.duration_min` + `film.projection_fmt` |
| Badge événement | Icône contextuelle (voir ci-dessous) | `FilmReleaseEvent[]` |

**Un seul genre affiché :** `film.genre?.split(',')[0].trim()` — le reste est ignoré dans cette vue compacte.

### Badges événements (nouveautés / modifications)

Les événements récents visibles (`visible = true`) sont affichés sous forme d'icône discrète sur la carte concernée. Les données viennent de `getMovementsByCountry()`, déjà fetché dans `page.tsx` et passé en prop à `AgendaTimeline`.

| `event_type` | Icône | Couleur | Label tooltip |
|---|---|---|---|
| `added` | `✦` (étoile pleine) | `gold` | Nouvelle sortie |
| `date_changed` | `↕` (flèches) | `cyan` | Date modifiée |
| `removed` | — | — | Non affiché (film retiré de la liste) |

L'icône est positionnée en haut à droite de la carte. On affiche **l'événement le plus récent** par film (`occurred_at` DESC, limit 1 par `film_id`). Si plusieurs événements existent pour un même film, seul le dernier compte.

**Prop supplémentaire sur `AgendaTimeline` :** `events: FilmReleaseEvent[]`

Chips genre : classes existantes de `FilmCard.tsx` (même mapping `GENRE_CLASSES`).

---

## Ce qui ne change pas

- `WeekSection.tsx` — grille desktop inchangée
- `FilmCard.tsx` — conservé, utilisé dans la grille
- `StudioBadge.tsx` — non utilisé dans la timeline (cards plus compactes)
- Toutes les routes, queries, types — aucun changement

---

## Dépendance GSAP

GSAP doit être installé dans le projet :

```bash
npm install gsap
```

`ScrollTrigger` est inclus dans le package `gsap` — pas de dépendance supplémentaire.

---

## Vérification

1. `npm install gsap` — pas d'erreur
2. `npm run build` — 0 erreur TypeScript
3. Sur mobile (DevTools device mode) :
   - Scroll vers le bas → cartes arrivent des deux côtés simultanément
   - Scroll vers le haut → cartes repartent vers leurs côtés
   - Semaine courante bien mise en évidence (gold)
   - Paires : les deux cartes sont exactement au même niveau vertical
   - Semaines vides : nœud visible, aucune carte
4. Sur desktop : la timeline est invisible (`hidden md:block` sur la grille)
5. Toggle grille ↔ timeline fonctionne et mémorise l'état
