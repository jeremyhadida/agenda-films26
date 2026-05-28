# Design System Document: Cinematic Editorial Experience

## 1. Overview & Creative North Star

### The Creative North Star: "The Digital Curator"
This design system moves away from the "utility-first" appearance of standard mobile apps and toward a high-end, editorial experience. It is designed to feel like a premium film program—authoritative, immersive, and visually rich. 

The system rejects the rigid, boxy constraints of traditional grids in favor of **Intentional Asymmetry**. By utilizing overlapping elements (like movie posters breaking the container boundary) and high-contrast typography scales, we create a "Cinematic Narrative." The goal is to guide the user’s eye not through lines and borders, but through light, depth, and tonal hierarchy.

---

## 2. Colors

The color palette is anchored in deep oceanic blues to provide a high-contrast stage for "Cinematic Gold" highlights.

### Surface Hierarchy & Nesting
To achieve a high-end feel, we follow the **"No-Line" Rule**: 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background color shifts or subtle tonal transitions.

*   **The Layering Principle:** Treat the UI as a series of physical layers. 
    *   **Base:** `surface` (#021232) or `surface-dim`.
    *   **Sections:** Use `surface-container-low` (#0A1A3A) to define large content areas.
    *   **Nesting:** Place a `surface-container-highest` (#263455) card inside a `surface-container-low` section to create natural lift.

### The "Glass & Gradient" Rule
Flat colors can feel static. To inject "soul" into the interface:
*   **Glassmorphism:** For floating navigation or overlays, use `surface-container` colors at 70% opacity with a `20px` backdrop-blur.
*   **Signature Textures:** Use subtle linear gradients for primary CTAs (e.g., `primary-container` #FFD700 to `primary-fixed-dim` #E9C400) to mimic the glow of a cinema screen.

---

## 3. Typography

The system utilizes a dual-font strategy to balance character with readability.

*   **Headlines (Manrope):** We use Manrope for all `display` and `headline` roles. Its geometric yet warm proportions feel modern and premium. Use `display-lg` (3.5rem) with tight letter-spacing for high-impact editorial moments.
*   **Body & Utility (Inter):** Inter is used for `title`, `body`, and `label` roles. It provides maximum legibility at small sizes for movie metadata (duration, genre, director).
*   **Identity through Scale:** Create hierarchy by pairing a `headline-sm` title with a significantly smaller `label-md` in all-caps for metadata. This "Big & Small" contrast is a hallmark of high-end editorial design.

---

## 4. Elevation & Depth

Depth in this design system is "Ambient," not "Structural."

*   **Tonal Layering:** Avoid drop shadows for static elements. Instead, use the `surface-container` tiers. A `surface-container-lowest` card sitting on a `surface-container-high` background creates a recessed, "carved-in" look.
*   **Ambient Shadows:** For floating elements (like a "Book Tickets" FAB), use an extra-diffused shadow: `offset: 0 12px`, `blur: 24px`, `color: rgba(0, 12, 42, 0.4)`. The shadow must be a tinted version of the background, never pure black.
*   **The "Ghost Border" Fallback:** If a container requires more definition against a complex background (like a poster), use a `ghost-border`: the `outline-variant` token (#4D4732) at 15% opacity.

---

## 5. Components

### Cards (The "Cinema Compact" Style)
Cards are the heart of the agenda. 
*   **Layout:** Forbid divider lines. Separate the poster from the metadata using a 12px horizontal gap.
*   **Corner Radius:** Use `lg` (1rem) for the main container and `md` (0.75rem) for internal elements like the movie poster.
*   **Interaction:** On hover/active states, the card should scale slightly (1.02x) rather than changing color.

### Buttons & Chips
*   **Primary Button:** Uses the high-contrast `primary-container` (#FFD700) with `on-primary-container` text. Use `full` (9999px) rounding for a modern feel.
*   **Genre Chips:** Use `secondary-container` (#544601) with `on-secondary-container` (#C9B468) text. These should feel like subtle "tags" rather than heavy buttons.
*   **Filter Chips:** When active, use a subtle `tertiary` (#DEFCFF) outer glow to signify the "active" state.

### Input Fields
*   **Styling:** No bottom borders. Use `surface-container-highest` with a `ghost-border`. 
*   **Focus State:** Instead of a thick border, use a 2px `primary-fixed` (#FFE16D) glow on the bottom edge only.

### Navigation (The Dynamic Dock)
*   The bottom navigation should use the **Glassmorphism** rule.
*   Active states are indicated by the `primary` (#FFF6DF) color and a small 4px `primary-container` dot beneath the icon.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a separator. If you feel the need for a line, increase the padding by `8px` instead.
*   **DO** bleed imagery. Let movie posters touch the edges of their containers or overlap background elements to create a 3D effect.
*   **DO** use the `tertiary` cyan tones for "Technical" info (e.g., IMAX, 4K, Atmos tags) to distinguish them from "Content" info (Genre, Rating).

### Don't
*   **DON'T** use 100% white text on the deep navy background. Use `on-surface-variant` (#D0C6AB) for secondary text to reduce eye strain and maintain the "moody" cinematic vibe.
*   **DON'T** use the standard Material "Surface" for everything. If the whole app is one color, the editorial hierarchy fails. Use the full range from `surface-container-lowest` to `highest`.
*   **DON'T** use default "Blue" for links. Always use `primary-fixed-dim` (#E9C400) for interactive text.

---

## 7. Roundedness Scale Reference
*   **None (0px):** For full-bleed background images only.
*   **Sm (0.25rem):** Micro-components (tooltips).
*   **Md (0.75rem):** Inner posters, small tags.
*   **Lg (1rem):** Standard movie cards, modal sheets.
*   **Xl (1.5rem):** Hero sections, search bars.
*   **Full (9999px):** Buttons, selection chips.