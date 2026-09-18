# WEJHA (وجهة) — Design System

**Brand intent:** WEJHA is a premium marketplace for discovering and renting photography/filming locations. The website is a space, not a collection of cards — cinematic, spatial, editorial, image-first, quietly confident. Not a SaaS dashboard, not generic ecommerce, not AI-gradient aesthetics.

Avoid: purple AI gradients, neon/glow, floating blobs, heavy glassmorphism, heavy shadows, excessive rounding, giant gradient text, particles, decorative 3D objects, constant motion, centered-everything layouts, emoji-as-icons.

---

## 1. Color Tokens

| Token | Value | Use |
|---|---|---|
| `--color-canvas` | `#F5F3EE` | Main light background |
| `--color-ink` | `#151514` | Headings, nav, primary text |
| `--color-text-secondary` | `#68655F` | Secondary text |
| `--color-text-muted` | `#96928A` | Muted/meta text |
| `--color-white` | `#FFFFFF` | Elevated surfaces |
| `--color-surface` | `#EEECE6` | Grouped surfaces |
| `--color-border` | `rgba(21,21,20,0.10)` | Hairline borders |
| `--color-accent` | `#C86F48` (terracotta) | CTAs, selected state, highlights only — never a dominant fill |
| `--color-dark` | `#0C0D0C` | Dark background |
| `--color-dark-surface` | `#151715` | Dark grouped surface |
| `--color-dark-elevated` | `#1D1F1D` | Dark elevated surface |
| `--color-dark-text` | `#F4F2ED` | Dark primary text |
| `--color-dark-muted` | `#A5A29B` | Dark muted text |
| `--color-dark-border` | `rgba(255,255,255,0.10)` | Dark hairline borders |

Photography may introduce colors outside this palette — never color-correct images to force brand-palette compliance.

**Dark mode trigger:** system `prefers-color-scheme` by default; immersive hero/night-context sections may force dark regardless of system preference.

---

## 2. Typography

Primary: high-quality Arabic sans-serif — modern, geometric-but-human, strong glyph construction at large sizes, clean numerals. Latin font only where Arabic font lacks coverage.

| Token | Size |
|---|---|
| `--text-display-xl` | `clamp(4rem, 8vw, 8rem)` |
| `--text-display` | `clamp(3rem, 6vw, 6rem)` |
| `--text-h1` | `clamp(2.5rem, 4vw, 4.5rem)` |
| `--text-h2` | `clamp(2rem, 3vw, 3rem)` |
| `--text-h3` | `clamp(1.5rem, 2vw, 2rem)` |
| `--text-body-lg` | `18px` |
| `--text-body` | `16px` |
| `--text-small` | `14px` |
| `--text-micro` | `12px` |

Rules: few font weights, use size not weight for hierarchy; generous Arabic line-height; never clip Arabic glyphs (no `overflow: hidden` on text containers carrying Arabic); no decorative oversized text without compositional purpose.

---

## 3. Spacing, Radius, Motion Tokens

**Spacing (8px base):** `8 16 24 32 40 48 64 80 96 120 160 200`
- Components: 8–24px · Cards: 16–32px · Sections: 64–120px · Hero/major transitions: 120–200px

**Radius:** `--radius-sm: 8px` · `--radius-md: 12px` · `--radius-lg: 16px` · `--radius-hero: 20–28px` (major visual containers only) · Buttons: 10–14px

**Motion:** default easing `cubic-bezier(0.22, 1, 0.36, 1)`
- `--motion-micro`: 200–350ms
- `--motion-standard`: 400–700ms
- `--motion-large`: 800–1400ms
- `--motion-cinematic`: 1500–3000ms+

Animate `transform`, `opacity`, `clip-path` — not layout properties. Respect `prefers-reduced-motion` everywhere, no exceptions.

**Layout:** max-width `1440px`; horizontal padding `clamp(24px, 5vw, 80px)`.

---

## 4. Composition Modes — pick one per section

| Mode | When | Traits |
|---|---|---|
| **Immersive** | Hero, major visual moments, transitions | Full viewport, layered imagery, depth, large type, minimal UI |
| **Editorial** | Category discovery, storytelling | Asymmetric layout, oversized type, large images, overlap allowed |
| **Archive** | Browse, search, collections | Structured grid, consistent, efficient, image-first |

Never default every section to centered-heading + centered-text + 3-equal-cards.

---

## 5. Component Rules

| Component | Rule |
|---|---|
| **Primary button** | Solid, high contrast, compact, no glow. Light: ink bg / white text. Dark: light bg / dark text. Accent (terracotta) used selectively, not default. |
| **Secondary button** | Transparent or subtle surface, thin border, quiet. |
| **Icon button** | Compact, circular or square by context, clear hover state. |
| **Icons** | One consistent thin-line geometric system (e.g. Lucide). No emoji as UI icons. |
| **Location card** (Archive mode) | Image dominant → category / name / city → metadata/price. No boxed-in metadata. Must look distinct from category tiles. |
| **Category tile** (Editorial/discovery) | Large visual tile, oversized label, asymmetric/horizontal movement allowed. Feels like "choose a world," distinct from location cards ("choose a place"). |
| **Gallery** | Multi-image composition, not one-image-plus-thumbnails. Slow continuous auto-scroll allowed. Click → fullscreen lightbox: swipe, drag, keyboard arrows, counter, close. |
| **Filters** (Archive mode) | Compact, quiet, horizontal bar or side panel on desktop; bottom sheet on mobile. Obvious but restrained selected state, accent used sparingly. |
| **Nav** | Minimal. Logo present but not oversized, links quiet, one clear CTA. May go transparent→solid on scroll. No default floating pill nav. |
| **Surfaces** | Default = transparent/background. Elevate only to communicate grouping — not every element needs a card. Shadows soft and rare. |
| **Image hover** | Scale 1 → 1.025–1.05, 500–900ms, smooth easing. Never aggressive zoom. |

---

## 6. Hero

Not background-image + overlay + text. Must feel spatial: depth, camera-like movement, layering, atmosphere. Layered photography / 2.5D parallax is the default approach — reach for WebGL/Three.js only if the product need justifies the engineering and mobile-perf cost. No floating 3D object placed just to prove "3D."

Motion: controlled reveal → typography enters naturally → settles into near-imperceptible parallax. Pointer response maximally subtle, damped. No bounce, spin, elastic, particles.

---

## 7. Responsive

Mobile is a distinct composition, not a shrunk desktop: focused + cinematic + efficient. Simplify/remove 3D and parallax on mobile, preserve hierarchy and image quality. Minimum touch target `44px`.

---

## 8. Accessibility

Sufficient contrast, full keyboard nav, visible focus states, semantic HTML, alt text on all photography, `prefers-reduced-motion` respected, readable minimum sizes. Never traded away for visual effect.

---

## 9. Admin

Separate experience, not held to this system's cinematic rules. Admin prioritizes speed, clarity, reliability — plain UI, standard components.

---

## 10. Quality Bar

Before shipping any component, check: composition (intentional?), hierarchy (obvious?), spatiality (has depth?), imagery (feels like the product?), Arabic typography (premium?), motion (natural?), consistency (belongs to WEJHA?), restraint (would removing an effect improve it — if yes, remove it).
