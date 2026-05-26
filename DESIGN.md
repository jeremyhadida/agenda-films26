---
name: Agenda Films26
description: Agenda hebdomadaire des sorties cinéma en Afrique Francophone
colors:
  surface: "#021232"
  surface-low: "#0a1a3a"
  surface-card: "#263455"
  gold: "#ffd700"
  gold-dim: "#e9c400"
  gold-light: "#ffe16d"
  text: "#fff6df"
  muted: "#d0c6ab"
  chip-bg: "#544601"
  chip-text: "#c9b468"
  cyan: "#defcff"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontWeight: 600
    fontSize: "0.875rem"
    lineHeight: 1.3
  body:
    fontFamily: "Inter, sans-serif"
    fontWeight: 400
    fontSize: "0.75rem"
    lineHeight: 1.5
  label:
    fontFamily: "Inter, sans-serif"
    fontWeight: 400
    fontSize: "0.625rem"
    letterSpacing: "0.1em"
rounded:
  sm: "0.25rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
components:
  film-row:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
  month-tab-active:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "6px 16px"
  month-tab-inactive:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.xl}"
    padding: "6px 16px"
  genre-chip:
    backgroundColor: "{colors.chip-bg}"
    textColor: "{colors.chip-text}"
    rounded: "{rounded.xl}"
    padding: "2px 8px"
---

# Design System: Agenda Films26

## 1. Overview

**Creative North Star: "Le Programme"**

Agenda Films26 est conçu comme un programme de cinéma imprimé haut de gamme : l'information est dense, typographiquement maîtrisée, chaque élément occupe exactement l'espace qu'il mérite. Le fond sombre n'est pas un effet de style — c'est la salle elle-même, avant que les lumières s'allument. L'or n'est pas décoratif — c'est l'accent de prestige discret d'une marquise de cinéma historique.

Le registre est **product** : l'exploitant vient lire, pas être impressionné. L'interface s'efface derrière les données. Aucun élément ne cherche l'attention pour lui-même. La hiérarchie visuelle est au service du débit de lecture, pas de l'esthétique.

Ce système rejette explicitement deux anti-références : les dashboards SaaS génériques (cards grises interchangeables, bleu corporate sans caractère) et les outils d'exploitation internes austères (grilles HTML sans personnalité, typo système, aucun soin visuel). Films26 est professionnel ET cinématographique. Ces deux qualités ne s'excluent pas.

**Key Characteristics:**
- Fond quasi-noir teinté bleu nuit, jamais neutre gris
- Un seul accent chromatique : l'or, utilisé avec parcimonie
- Deux polices complémentaires : Manrope (structure, confiance) + Inter (lisibilité, densité)
- Élévation tonale pure — aucune ombre portée
- Densité assumée, respiration maîtrisée par l'espacement, pas par le vide

## 2. Colors: La Palette Salle Obscure

Un fond monochrome teinté, un seul accent chaud, des neutres ivoire. La couleur est une discipline.

### Primary
- **Or Marquee** (`#ffd700`): L'accent primaire. Dates hebdomadaires, onglets actifs, liens d'action. Réservé aux éléments à valeur navigationnelle ou temporelle. Sa rareté est le point.
- **Or Marquee Sombre** (`#e9c400`): Variante hover et liens secondaires. Jamais en background plein.
- **Or Marquee Clair** (`#ffe16d`): Éclat léger sur surface sombre, uniquement pour les états focus ou les highlights de liste.

### Neutral
- **Minuit Profond** (`#021232`): Surface racine. Le fond de toute l'application. Teinté bleu — jamais un noir neutre.
- **Fond de Cabine** (`#0a1a3a`): Header sticky, arrière-plans secondaires. Un cran au-dessus du Minuit.
- **Ardoise Bleue** (`#263455`): Surface des cartes, des lignes film, des pills de semaine. Le troisième niveau tonal.
- **Ivoire Chaud** (`#fff6df`): Texte principal. Teinté crème — jamais un blanc pur.
- **Parchemin** (`#d0c6ab`): Texte secondaire, métadonnées, labels de numéros de semaine.

### Tertiary
- **Lumière Écran** (`#defcff`): Tags techniques uniquement (format projection : IMAX, 3D, Dolby Atmos). Cyan froid sur fond sombre — signal technique immédiat.
- **Ambre Pellicule** (`#544601` bg / `#c9b468` text): Réservé aux chips genre. Fond ambré sombre, texte doré atténué.

### Named Rules
**La Règle de l'Or Rare.** L'or n'apparaît que sur les éléments porteurs d'information temporelle ou navigationnelle (dates, onglets actifs, titres de semaine). Il ne sert jamais de décoration. Un écran qui serait "trop doré" est un écran qui a échoué.

**La Règle du Fond Teinté.** Aucune surface n'est noir pur ou blanc pur. Chaque niveau de profondeur est teinté vers le bleu nuit (`#021232`). Le gris neutre est interdit.

## 3. Typography

**Display Font:** Manrope (sans-serif, variable weight 400–800)
**Body Font:** Inter (sans-serif, variable weight 400–600)

**Character:** Manrope apporte la structure et la confiance — ses formes géométriques douces évoquent un générique contemporain sans arrogance. Inter gère la densité informationnelle : parfaitement lisible à 10–12px, il disparaît au profit du contenu. L'association est fonctionnelle d'abord, cinématographique par résonance.

### Hierarchy
- **Display** (Manrope, 700–800, clamp(1.5rem–3rem), lh 1.1): Titres de mois sur la page agenda, nom de film en hero. Toujours sur fond sombre.
- **Title** (Manrope, 600–700, 0.875rem–1rem, lh 1.3): Plages de dates hebdomadaires (en or), titres de film dans les lignes compactes.
- **Body** (Inter, 400, 0.75rem, lh 1.5): Réalisateur, métadonnées film, compteur de sorties.
- **Label** (Inter, 400, 0.625rem, ls 0.1em, uppercase): Numéros de semaine, labels de région sur la homepage. Toujours en `muted`.

### Named Rules
**La Règle de la Hiérarchie Binaire.** Deux polices, deux rôles. Manrope pour ce qui structure et oriente (dates, titres, navigation). Inter pour ce qui informe et décrit (métadonnées, labels). Ne jamais utiliser Manrope pour du texte courant ni Inter pour un titre principal.

## 4. Elevation

Ce système est **plat par doctrine** : aucune ombre portée. La profondeur est exprimée exclusivement par la teinte — trois niveaux tonals du même bleu nuit.

| Niveau | Token | Hex | Usage |
|--------|-------|-----|-------|
| Fond | `surface` | `#021232` | Canvas racine |
| Intermédiaire | `surface-low` | `#0a1a3a` | Header, backdrop floutés |
| Carte | `surface-card` | `#263455` | Lignes film, pills, drawers |

### Named Rules
**La Règle du Tonal Pur.** Les ombres portées sont interdites. La hiérarchie spatiale s'exprime par la luminosité des surfaces. Si l'on ressent le besoin d'une ombre, c'est que la hiérarchie tonale n'est pas assez affirmée — augmenter le contraste de teinte, ne pas ajouter une ombre.

## 5. Components

### Ligne Film (FilmCard compact)
Le composant central. Une ligne horizontale dense, fond `surface-card`, radius `sm` (4px — intentionnellement carré, évoque l'imprimé).
- **Structure:** chip genre | titre + logo studio | réalisateur (masqué mobile) | durée · format
- **Chip genre:** fond ambré `chip-bg`, texte `chip-text`, radius `xl` (pill). Couleur dynamique par genre (rouge/action, bleu/drame, etc.) via classes utilitaires Tailwind.
- **Format technique:** texte `cyan` pour IMAX/3D/Dolby — signal visuel immédiat distinct du reste.
- **Pas de hover state interactif** : la ligne n'est pas un lien dans la version actuelle.

### Onglets Mois (MonthTabs)
Navigation sticky sous le header. Scroll horizontal sur mobile.
- **Inactif:** texte `muted`, fond transparent, radius `xl`
- **Actif:** fond `gold`, texte `surface` (inversion fond sombre), Manrope semibold
- **Transition:** `transition-colors` 150ms — pas d'animation de position, uniquement de couleur

### En-tête de Semaine (WeekSection header)
- Label "SEMAINE XX" : Inter 10px, `muted`, uppercase, letter-spacing 0.1em
- Plage de dates : Manrope bold, `gold`, 1rem
- Compteur de sorties : pill `surface-card`, texte `muted`, Inter xs, radius `xl`

### Navigation Header
Sticky, backdrop-blur sur `surface-low/80`. Logo "FILMS 26" Manrope bold `gold`. Pays courant texte `muted`. Lien "Changer" texte `gold-dim`.
- **Mobile:** header simplifié, navigation déplacée vers BottomNav

### Navigation Mobile (BottomNav)
Barre inférieure fixe sur mobile. Deux onglets : Agenda et Mouvements.
- **Actif:** texte `gold`
- **Inactif:** texte `muted`

## 6. Do's and Don'ts

### Do:
- **Do** utiliser `surface-card` (`#263455`) comme fond de tout élément de liste ou carte — jamais `surface-low` directement pour du contenu.
- **Do** réserver l'or (`#ffd700`) aux dates, titres de semaine, et onglets actifs. Sa rareté crée son impact.
- **Do** utiliser `cyan` (`#defcff`) exclusivement pour les tags techniques (format projection, mix audio). C'est un signal visuel, pas une couleur décorative.
- **Do** appliquer `rounded-sm` (4px) aux lignes film et aux surfaces denses. Garder `rounded-xl` pour les pills et chips.
- **Do** afficher le réalisateur en Inter regular `muted` — jamais en Manrope, jamais en `text` full blanc.
- **Do** écrire les labels de semaine en uppercase Inter avec letter-spacing — le contraste avec les dates Manrope gold est intentionnel.

### Don't:
- **Don't** introduire de cards grises ou de surfaces bleu corporate générique. C'est exactement ce que ce design refuse.
- **Don't** ajouter des ombres portées (`box-shadow`). L'élévation est tonale, jamais ombragée.
- **Don't** utiliser du blanc pur (`#ffffff`) ou du noir pur (`#000000`). Toute surface doit être teintée.
- **Don't** utiliser l'or comme couleur de fond sur de grandes surfaces. L'or est un accent, pas une couleur de surface.
- **Don't** utiliser `border-left` coloré comme accent décoratif sur les lignes film. Changer la teinte de fond ou le poids typographique.
- **Don't** appliquer du `background-clip: text` avec un gradient. L'emphase passe par le poids ou la taille, jamais par un gradient de texte.
- **Don't** rendre l'interface austère sous prétexte d'utilitaire. L'outil interne banal est l'anti-référence déclarée. Films26 est professionnel ET cinématographique.
